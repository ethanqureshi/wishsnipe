import { formatPrice } from "@/lib/steam"

type Props = {
  gameName: string
  appid: number
  currentPrice: number
  originalPrice: number | null
  discountPercent: number
  historicalLow: number | null
}

export function PriceAlertEmail({
  gameName,
  appid,
  currentPrice,
  originalPrice,
  discountPercent,
  historicalLow,
}: Props) {
  const storeUrl = `https://store.steampowered.com/app/${appid}`
  const isHistoricalLow = historicalLow !== null && currentPrice <= historicalLow

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto", background: "#0f1923", color: "#fff", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ background: "#1b2838", padding: "24px 24px 16px", borderBottom: "1px solid #2a475e" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#8ba3b8", letterSpacing: 1 }}>WISHSNIPE ALERT</p>
        <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700 }}>Price drop detected</h1>
      </div>

      <div style={{ padding: 24 }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>{gameName}</h2>

        {isHistoricalLow && (
          <div style={{ background: "#4c1d95", borderRadius: 6, padding: "6px 12px", display: "inline-block", marginBottom: 16, fontSize: 13, fontWeight: 700 }}>
            🏆 HISTORICAL LOW
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
          <tbody>
            <tr>
              <td style={{ color: "#8ba3b8", fontSize: 13, paddingBottom: 8 }}>Current price</td>
              <td style={{ textAlign: "right", fontWeight: 700, fontSize: 20, color: "#57cbde" }}>
                {formatPrice(currentPrice)}
              </td>
            </tr>
            {originalPrice && discountPercent > 0 && (
              <tr>
                <td style={{ color: "#8ba3b8", fontSize: 13, paddingBottom: 8 }}>Regular price</td>
                <td style={{ textAlign: "right", color: "#8ba3b8", textDecoration: "line-through" }}>
                  {formatPrice(originalPrice)}
                </td>
              </tr>
            )}
            {discountPercent > 0 && (
              <tr>
                <td style={{ color: "#8ba3b8", fontSize: 13, paddingBottom: 8 }}>Discount</td>
                <td style={{ textAlign: "right", color: "#57cbde", fontWeight: 700 }}>-{discountPercent}%</td>
              </tr>
            )}
            {historicalLow !== null && (
              <tr>
                <td style={{ color: "#8ba3b8", fontSize: 13 }}>All-time low</td>
                <td style={{ textAlign: "right", color: "#8ba3b8" }}>{formatPrice(historicalLow)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <a
          href={storeUrl}
          style={{ display: "block", background: "#1b2838", border: "1px solid #4c6b8a", color: "#fff", textAlign: "center", padding: "14px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}
        >
          View on Steam →
        </a>
      </div>

      <div style={{ padding: "16px 24px", borderTop: "1px solid #1e2d3d", fontSize: 12, color: "#4a6b82" }}>
        You&apos;re receiving this because you set a price alert on WishSnipe.
      </div>
    </div>
  )
}
