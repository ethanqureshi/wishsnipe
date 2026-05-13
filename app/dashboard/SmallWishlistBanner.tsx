"use client"
import { useState } from "react"
import { RefreshButton } from "./RefreshButton"

export function SmallWishlistBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid rgba(245,158,11,0.4)",
        borderRadius: "10px",
        padding: "16px 20px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
          Your wishlist looks a little empty.
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Add games on Steam and hit refresh.
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <RefreshButton />
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "4px 8px",
            transition: "border-color 0.2s, color 0.2s",
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
