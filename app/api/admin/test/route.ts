import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { lookupItadIds, fetchHistoricalLows } from "@/lib/itad"

export const dynamic = "force-dynamic"

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // 1. Supabase connectivity
  try {
    const { data, error } = await supabaseAdmin.from("users").select("steam_id").limit(1)
    results.supabase = error ? { ok: false, error: error.message } : { ok: true, rowCount: data?.length }
  } catch (e) {
    results.supabase = { ok: false, error: String(e) }
  }

  // 2. Supabase tables exist
  for (const table of ["wishlist_items", "games", "price_snapshots", "historical_lows"]) {
    try {
      const { error } = await supabaseAdmin.from(table).select("*").limit(1)
      results[`table_${table}`] = error ? { ok: false, error: error.message } : { ok: true }
    } catch (e) {
      results[`table_${table}`] = { ok: false, error: String(e) }
    }
  }

  // 3. ITAD — test with Cyberpunk 2077 (appid 1091500)
  try {
    const itadMap = await lookupItadIds([1091500])
    const itadId = itadMap.get(1091500)
    if (itadId) {
      const lows = await fetchHistoricalLows([itadId])
      const low = lows.get(itadId)
      results.itad = { ok: true, itadId, low }
    } else {
      results.itad = { ok: false, error: "lookup returned no result for appid 1091500" }
    }
  } catch (e) {
    results.itad = { ok: false, error: String(e) }
  }

  // 4. Env vars present
  results.env = {
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    STEAM_API_KEY: !!process.env.STEAM_API_KEY,
    ITAD_API_KEY: !!process.env.ITAD_API_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    CRON_SECRET: !!process.env.CRON_SECRET,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // 5. Users with alert thresholds set
  try {
    const { data, error } = await supabaseAdmin
      .from("wishlist_items")
      .select("appid, steam_id, alert_threshold_price")
      .not("alert_threshold_price", "is", null)
      .limit(5)
    results.thresholds = error ? { ok: false, error: error.message } : { ok: true, rows: data }
  } catch (e) {
    results.thresholds = { ok: false, error: String(e) }
  }

  // 6. Users with alert emails set
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("steam_id, alert_email")
      .not("alert_email", "is", null)
      .limit(5)
    results.alertEmails = error ? { ok: false, error: error.message } : { ok: true, rows: data }
  } catch (e) {
    results.alertEmails = { ok: false, error: String(e) }
  }

  return NextResponse.json(results, { status: 200 })
}
