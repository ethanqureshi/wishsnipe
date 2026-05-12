import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { appid, thresholdPrice } = await req.json()
  if (!appid || typeof thresholdPrice !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // thresholdPrice is in dollars from the UI; store as cents
  const cents = Math.round(thresholdPrice * 100)

  await supabaseAdmin
    .from("wishlist_items")
    .update({ alert_threshold_price: cents })
    .eq("steam_id", session.user.steamId)
    .eq("appid", appid)

  return NextResponse.json({ ok: true })
}
