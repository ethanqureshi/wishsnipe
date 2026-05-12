"use client"

import { useState } from "react"

export function EmailSettings({ currentEmail }: { currentEmail: string | null }) {
  const [email, setEmail] = useState(currentEmail ?? "")
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function save() {
    setStatus("saving")
    const res = await fetch("/api/alerts/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setStatus(res.ok ? "saved" : "error")
    setTimeout(() => setStatus("idle"), 2200)
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Alert email"
        autoComplete="off"
        suppressHydrationWarning
        className="input-dark"
        style={{ padding: "7px 12px", fontSize: "13px", width: "210px" }}
      />
      <button
        onClick={save}
        disabled={status === "saving"}
        style={{
          padding: "7px 14px",
          background:
            status === "saved"
              ? "rgba(74,222,128,0.12)"
              : status === "error"
              ? "rgba(248,113,113,0.12)"
              : "rgba(245,158,11,0.10)",
          border: `1px solid ${
            status === "saved"
              ? "rgba(74,222,128,0.35)"
              : status === "error"
              ? "rgba(248,113,113,0.35)"
              : "rgba(245,158,11,0.30)"
          }`,
          borderRadius: "8px",
          color:
            status === "saved" ? "#4ade80" : status === "error" ? "#f87171" : "var(--amber)",
          fontSize: "13px",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: status === "saving" ? "wait" : "pointer",
          opacity: status === "saving" ? 0.6 : 1,
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : status === "error" ? "Error" : "Save"}
      </button>
    </div>
  )
}

export function ThresholdInput({
  appid,
  currentThreshold,
}: {
  appid: number
  currentThreshold: number | null
}) {
  const [price, setPrice] = useState(
    currentThreshold != null ? (currentThreshold / 100).toFixed(2) : ""
  )
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  async function save() {
    const val = parseFloat(price)
    if (isNaN(val) || val <= 0) return
    setStatus("saving")
    const res = await fetch("/api/alerts/threshold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appid, thresholdPrice: val }),
    })
    setStatus(res.ok ? "saved" : "error")
    setTimeout(() => setStatus("idle"), 2000)
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "10px 12px",
        borderTop: "1px solid var(--border)",
        background: "rgba(0,0,0,0.2)",
      }}
    >
      <span
        style={{
          color: "var(--text-muted)",
          fontSize: "11px",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        ALERT &lt;$
      </span>
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="0.00"
        autoComplete="off"
        suppressHydrationWarning
        className="input-dark font-mono"
        style={{
          padding: "4px 8px",
          fontSize: "12px",
          width: "64px",
          borderRadius: "6px",
        }}
      />
      <button
        onClick={save}
        disabled={status === "saving"}
        className={status === "saved" ? "pulse-save" : ""}
        style={{
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          color:
            status === "saved"
              ? "#4ade80"
              : status === "error"
              ? "#f87171"
              : "var(--amber)",
          background: "transparent",
          border: "none",
          cursor: status === "saving" ? "wait" : "pointer",
          opacity: status === "saving" ? 0.5 : 1,
          padding: "4px 2px",
          transition: "color 0.2s",
        }}
      >
        {status === "saving" ? "···" : status === "saved" ? "SET ✓" : status === "error" ? "ERR" : "SET"}
      </button>
    </div>
  )
}
