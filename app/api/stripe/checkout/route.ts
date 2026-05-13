import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getStripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://wishsnipe.vercel.app"

  const checkout = await getStripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: session.user.steamId,
    metadata: { steam_id: session.user.steamId },
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/dashboard`,
  })

  return NextResponse.json({ url: checkout.url })
}
