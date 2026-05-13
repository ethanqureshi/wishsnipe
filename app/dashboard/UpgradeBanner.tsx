"use client"
import { useState } from "react"

export function UpgradeBanner({ lockedCount }: { lockedCount: number }) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(245,158,11,0.25)",
        borderLeft: "3px solid var(--amber)",
        borderRadius: "12px",
        padding: "28px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div>
        <p
          className="font-display"
          style={{ fontSize: "20px", letterSpacing: "0.06em", color: "var(--amber)", marginBottom: "8px" }}
        >
          UPGRADE TO PRO
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5 }}>
          {lockedCount} more game{lockedCount !== 1 ? "s" : ""} on your wishlist.
          <br />
          Unlock unlimited tracking + instant alerts.
        </p>
      </div>

      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="upgrade-banner-btn"
        style={{
          background: loading ? "rgba(245,158,11,0.07)" : "rgba(245,158,11,0.12)",
          border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: "8px",
          color: "var(--amber)",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-display)",
          fontSize: "16px",
          letterSpacing: "0.08em",
          padding: "10px 28px",
          transition: "background 0.2s, box-shadow 0.2s",
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(245,158,11,0.2)"
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"
        }}
      >
        {loading ? "REDIRECTING…" : "$2.99 ONE-TIME"}
      </button>

      <p
        className="font-mono"
        style={{ color: "var(--text-dim)", fontSize: "10px", letterSpacing: "0.06em" }}
      >
        TEST MODE — NO REAL CHARGE
      </p>
    </div>
  )
}
