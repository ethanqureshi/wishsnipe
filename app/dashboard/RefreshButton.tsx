"use client"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function RefreshButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
    setDone(false)
    setTimeout(() => setDone(true), 2500)
  }

  return (
    <button
      onClick={refresh}
      disabled={isPending}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        background: done ? "rgba(74,222,128,0.08)" : "transparent",
        border: `1px solid ${done ? "rgba(74,222,128,0.3)" : "var(--border-strong)"}`,
        borderRadius: "6px",
        color: done ? "#4ade80" : "var(--text-muted)",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
        cursor: isPending ? "wait" : "pointer",
        opacity: isPending ? 0.5 : 1,
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "inline-block",
          animation: isPending ? "spin 1s linear infinite" : "none",
          fontSize: "13px",
          lineHeight: 1,
        }}
      >
        ↻
      </span>
      {isPending ? "SYNCING…" : done ? "SYNCED ✓" : "REFRESH"}
    </button>
  )
}
