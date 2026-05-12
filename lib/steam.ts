export type WishlistItem = {
  appid: number
  priority: number
  date_added: number
}

export type GameDetails = {
  appid: number
  name: string
  headerImage: string
  currentPrice: number | null  // cents
  originalPrice: number | null // cents
  discountPercent: number
  isFree: boolean
}

export async function fetchWishlist(steamId: string): Promise<WishlistItem[]> {
  const url = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamId}&key=${process.env.STEAM_API_KEY}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return []
  const data = await res.json()
  return data?.response?.items ?? []
}

async function fetchOneGame(appid: number): Promise<GameDetails | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&filters=basic,price_overview`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const game = data?.[String(appid)]?.data
    if (!game) return null
    return {
      appid,
      name: game.name as string,
      headerImage: game.header_image as string,
      currentPrice: game.price_overview?.final ?? null,
      originalPrice: game.price_overview?.initial ?? null,
      discountPercent: game.price_overview?.discount_percent ?? 0,
      isFree: game.is_free ?? false,
    }
  } catch {
    return null
  }
}

export async function fetchGameDetails(appids: number[]): Promise<GameDetails[]> {
  const results: GameDetails[] = []
  // 5 concurrent requests to avoid Steam rate limits
  for (let i = 0; i < appids.length; i += 5) {
    const batch = appids.slice(i, i + 5)
    const settled = await Promise.all(batch.map(fetchOneGame))
    results.push(...settled.filter((r): r is GameDetails => r !== null))
  }
  return results
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
