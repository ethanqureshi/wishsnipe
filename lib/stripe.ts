import Stripe from "stripe"

function cleanEnv(val: string | undefined): string {
  return (val ?? "").replace(/^﻿/, "").trim()
}

export const stripe = new Stripe(cleanEnv(process.env.STRIPE_SECRET_KEY), {
  apiVersion: "2025-04-30.basil",
})
