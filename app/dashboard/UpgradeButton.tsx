"use client"
import { useState } from "react"

export function UpgradeButton() {
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
    <button
      onClick={handleUpgrade}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        background: loading ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.35)",
        borderRadius: "7px",
        color: "var(--amber)",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        opacity: loading ? 0.7 : 1,
        transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          const el = e.currentTarget
          el.style.background = "rgba(245,158,11,0.14)"
          el.style.borderColor = "rgba(245,158,11,0.6)"
          el.style.boxShadow = "0 0 16px rgba(245,158,11,0.15)"
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = "rgba(245,158,11,0.08)"
        el.style.borderColor = "rgba(245,158,11,0.35)"
        el.style.boxShadow = "none"
      }}
    >
      {loading ? "…" : "⚡ Go Pro — $2.99"}
    </button>
  )
}
