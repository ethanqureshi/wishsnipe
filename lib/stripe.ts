import Stripe from "stripe"

function cleanEnv(val: string | undefined): string {
  return (val ?? "").replace(/^﻿/, "").trim()
}

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY), {
      apiVersion: "2025-04-30.basil",
    })
  }
  return _stripe
}
