import { supabaseAdmin } from "@/lib/supabase"
import type { WishlistItem, GameDetails } from "@/lib/steam"
import type { HistoricalLow } from "@/lib/itad"

export async function upsertUser(steamId: string, name: string, avatar: string) {
  await supabaseAdmin.from("users").upsert(
    { steam_id: steamId, name, avatar },
    { onConflict: "steam_id" }
  )
}

export async function upsertGames(games: GameDetails[]) {
  if (games.length === 0) return
  await supabaseAdmin.from("games").upsert(
    games.map((g) => ({
      appid: g.appid,
      name: g.name,
      header_image: g.headerImage,
      is_free: g.isFree,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: "appid" }
  )
}

export async function upsertWishlistItems(steamId: string, items: WishlistItem[]) {
  if (items.length === 0) return
  await supabaseAdmin.from("wishlist_items").upsert(
    items.map((i) => ({
      steam_id: steamId,
      appid: i.appid,
      priority: i.priority,
      date_added: i.date_added,
    })),
    { onConflict: "steam_id,appid" }
  )
}

export async function insertPriceSnapshots(games: GameDetails[]) {
  if (games.length === 0) return
  await supabaseAdmin.from("price_snapshots").insert(
    games.map((g) => ({
      appid: g.appid,
      current_price: g.currentPrice,
      original_price: g.originalPrice,
      discount_percent: g.discountPercent,
      is_free: g.isFree,
    }))
  )
}

export async function upsertHistoricalLows(lows: (HistoricalLow & { appid: number })[]) {
  if (lows.length === 0) return
  await supabaseAdmin.from("historical_lows").upsert(
    lows.map((l) => ({
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

export async function getStoredHistoricalLows(
  appids: number[]
): Promise<Map<number, { lowPrice: number; lowCut: number; lowShop: string; updatedAt: string }>> {
  const map = new Map<number, { lowPrice: number; lowCut: number; lowShop: string; updatedAt: string }>()
  if (appids.length === 0) return map
  const { data } = await supabaseAdmin
    .from("historical_lows")
    .select("appid, low_price, low_cut, low_shop, updated_at")
    .in("appid", appids)
  for (const row of data ?? []) {
    map.set(row.appid, {
      lowPrice: row.low_price,
      lowCut: row.low_cut,
      lowShop: row.low_shop,
      updatedAt: row.updated_at,
    })
  }
  return map
}
