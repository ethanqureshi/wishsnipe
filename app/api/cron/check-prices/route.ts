import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { fetchGameDetails, formatPrice, type GameDetails } from "@/lib/steam"
import { upsertGames, insertPriceSnapshots } from "@/lib/db"
import { lookupItadIds, fetchHistoricalLows } from "@/lib/itad"
import { Resend } from "resend"
import { render } from "@react-email/render"
import { PriceAlertEmail } from "@/app/email/PriceAlert"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  console.log("[cron] reached handler, CRON_SECRET length:", process.env.CRON_SECRET?.length ?? 0)

  if (!isAuthorized(req)) {
    console.log("[cron] unauthorized — header:", req.headers.get("authorization")?.slice(0, 10))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[cron] authorized, starting price check")

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 1. Fetch all watched appids
    console.log("[cron] querying wishlist_items")
    const { data: items, error } = await supabaseAdmin
      .from("wishlist_items")
      .select("appid, steam_id, alert_threshold_price, last_alerted_at")
    if (error) {
      console.log("[cron] wishlist_items error:", error.message)
      return NextResponse.json({ error: "db_wishlist", detail: error.message }, { status: 500 })
    }

    const appids = [...new Set((items ?? []).map((i: { appid: number }) => i.appid))]
    console.log("[cron] appids count:", appids.length)
    if (appids.length === 0) return NextResponse.json({ ok: true, checked: 0 })

    // 2. Fetch current Steam prices (sequential batches of 5 to avoid rate limits)
    const games: GameDetails[] = []
    for (let i = 0; i < appids.length; i += 5) {
      const batch = await fetchGameDetails(appids.slice(i, i + 5))
      games.push(...batch)
    }

    const gameMap = new Map(games.map((g) => [g.appid, g]))

    // 3. Upsert metadata + insert snapshots (writes price cache columns)
    if (games.length > 0) {
      await upsertGames(games)
      await insertPriceSnapshots(games)
    }

    // 4. Refresh stale ITAD lows
    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: staleRows } = await supabaseAdmin
      .from("historical_lows")
      .select("appid")
      .lt("updated_at", staleThreshold)

    const staleAppids = (staleRows ?? []).map((r: { appid: number }) => r.appid)
    const missingAppids = appids.filter(
      (id) => !(staleRows ?? []).find((r: { appid: number }) => r.appid === id)
    )
    const needsItad = [...new Set([...staleAppids, ...missingAppids])]

    if (needsItad.length > 0) {
      const itadIdMap = await lookupItadIds(needsItad)
      const lows = await fetchHistoricalLows([...itadIdMap.values()])
      const toStore = [...itadIdMap.entries()]
        .map(([appid, itadId]) => {
          const low = lows.get(itadId)
          return low ? { appid, ...low } : null
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)

      if (toStore.length > 0) {
        await supabaseAdmin.from("historical_lows").upsert(
          toStore.map((l) => ({
            appid: l.appid,
            itad_id: l.itadId,
            low_price: l.lowPrice,
            low_cut: l.lowCut,
            low_shop: l.lowShop,
            low_date: l.lowDate,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: "appid" }
        )
      }
    }

    // 5. Check alert thresholds and send emails
    const { data: historicalLows } = await supabaseAdmin
      .from("historical_lows")
      .select("appid, low_price")
      .in("appid", appids)

    const lowMap = new Map(
      (historicalLows ?? []).map((r: { appid: number; low_price: number }) => [r.appid, r.low_price])
    )

    const alertCandidates = (items ?? []).filter(
      (i: { alert_threshold_price: number | null }) => i.alert_threshold_price !== null
    )

    const steamIds = [...new Set(alertCandidates.map((i: { steam_id: string }) => i.steam_id))]
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("steam_id, alert_email")
      .in("steam_id", steamIds)

    const userEmailMap = new Map(
      (users ?? []).map((u: { steam_id: string; alert_email: string | null }) => [u.steam_id, u.alert_email])
    )

    let emailsSent = 0
    const cooldownMs = 24 * 60 * 60 * 1000

    for (const item of alertCandidates) {
      const game = gameMap.get(item.appid)
      if (!game || game.currentPrice === null) continue

      const threshold: number = item.alert_threshold_price
      if (game.currentPrice > threshold) continue

      if (item.last_alerted_at) {
        const lastAlert = new Date(item.last_alerted_at).getTime()
        if (Date.now() - lastAlert < cooldownMs) continue
      }

      const email = userEmailMap.get(item.steam_id)
      if (!email) continue

      const historicalLow = lowMap.get(item.appid) ?? null

      const html = render(PriceAlertEmail({
        gameName: game.name,
        appid: game.appid,
        currentPrice: game.currentPrice,
        originalPrice: game.originalPrice,
        discountPercent: game.discountPercent,
        historicalLow,
      }))

      await resend.emails.send({
        from: "WishSnipe <onboarding@resend.dev>",
        to: email,
        subject: `🎮 ${game.name} dropped to ${formatPrice(game.currentPrice)}`,
        html,
      })

      await supabaseAdmin
        .from("wishlist_items")
        .update({ last_alerted_at: new Date().toISOString() })
        .eq("steam_id", item.steam_id)
        .eq("appid", item.appid)

      emailsSent++
    }

    return NextResponse.json({
      ok: true,
      checked: games.length,
      itadRefreshed: needsItad.length,
      emailsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error("[cron/check-prices]", message, stack)
    return NextResponse.json({ error: "internal", detail: message }, { status: 500 })
  }
}
