import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    const rawBody = await req.arrayBuffer()
    event = getStripe().webhooks.constructEvent(Buffer.from(rawBody), sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[stripe/webhook] signature verification failed:", msg)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const steamId = session.client_reference_id
    if (steamId) {
      const { error } = await supabaseAdmin
        .from("users")
        .update({ is_pro: true })
        .eq("steam_id", steamId)
      if (error) {
        console.error("[stripe/webhook] failed to mark user as pro:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      console.log("[stripe/webhook] marked user as pro:", steamId)
    }
  }

  return NextResponse.json({ received: true })
}
