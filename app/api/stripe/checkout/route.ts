import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://wishsnipe.vercel.app"

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: session.user.steamId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "WishSnipe Pro",
            description: "Unlimited games tracked + instant price alerts",
          },
          unit_amount: 299,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/dashboard`,
  })

  return NextResponse.json({ url: checkout.url })
}
