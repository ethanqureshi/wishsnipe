const BASE = "https://api.isthereanydeal.com"

export type HistoricalLow = {
  itadId: string
  lowPrice: number   // cents
  lowCut: number     // percent
  lowShop: string
  lowDate: string | null
}

async function lookupOne(appid: number): Promise<{ appid: number; itadId: string } | null> {
  try {
    const res = await fetch(
      `${BASE}/games/lookup/v1?key=${process.env.ITAD_API_KEY}&appid=${appid}`,
      { cache: "no-store" }
    )
    if (!res.ok) {
      console.error(`[itad] lookup ${appid} failed: HTTP ${res.status}`)
      return null
    }
    const data = await res.json()
    if (!data.found) return null
    return { appid, itadId: data.game.id as string }
  } catch (e) {
    console.error(`[itad] lookup ${appid} error:`, e instanceof Error ? e.message : String(e))
    return null
  }
}

export async function lookupItadIds(appids: number[]): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  for (let i = 0; i < appids.length; i += 5) {
    const batch = await Promise.all(appids.slice(i, i + 5).map(lookupOne))
    for (const r of batch) if (r) map.set(r.appid, r.itadId)
  }
  return map
}

export async function fetchHistoricalLows(itadIds: string[]): Promise<Map<string, HistoricalLow>> {
  const map = new Map<string, HistoricalLow>()
  if (itadIds.length === 0) return map
  try {
    const res = await fetch(
      `${BASE}/games/overview/v2?key=${process.env.ITAD_API_KEY}&country=US`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itadIds),
        cache: "no-store",
      }
    )
    if (!res.ok) {
      console.error(`[itad] overview failed: HTTP ${res.status}`)
      return map
    }
    const data: {
      prices: Array<{
        id: string
        lowest?: {
          price: { amountInt: number }
          cut: number
          shop: { name: string }
          timestamp: string | null
        } | null
      }>
    } = await res.json()

    for (const item of data.prices ?? []) {
      if (!item.lowest) continue
      map.set(item.id, {
        itadId: item.id,
        lowPrice: item.lowest.price.amountInt,
        lowCut: item.lowest.cut,
        lowShop: item.lowest.shop.name,
        lowDate: item.lowest.timestamp,
      })
    }
  } catch (e) {
    console.error("[itad] overview error:", e instanceof Error ? e.message : String(e))
  }
  return map
}

export type DealBadge =
  | "Historical Low 🎯"
  | "Never Been Cheaper ⚡"
  | "Near Low 💚"
  | "Good Deal 👍"
  | "Average Deal 🟡"
  | "Wait 🔴"
  | ""

export function getDealBadge(
  currentPrice: number | null,
  historicalLow: number | null,
  discountPct: number
): DealBadge {
  if (currentPrice === null) return ""
  if (historicalLow !== null) {
    if (currentPrice < historicalLow) return "Never Been Cheaper ⚡"
    if (currentPrice === historicalLow) return "Historical Low 🎯"
    if (currentPrice <= Math.round(historicalLow * 1.1)) return "Near Low 💚"
    if (discountPct >= 40) return "Good Deal 👍"
    if (discountPct > 0) return "Average Deal 🟡"
    if (currentPrice > historicalLow * 1.5) return "Wait 🔴"
    return ""
  }
  if (discountPct >= 40) return "Good Deal 👍"
  if (discountPct > 0) return "Average Deal 🟡"
  return ""
}
