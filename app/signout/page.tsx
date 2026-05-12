"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"

export default function SignOutPage() {
  const [leaving, setLeaving] = useState(false)

  async function confirm() {
    setLeaving(true)
    await signOut({ callbackUrl: "/" })
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(248,113,113,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "380px",
          width: "100%",
        }}
      >
        {/* Icon */}
        <div
          aria-hidden
          style={{
            fontSize: "32px",
            opacity: 0.3,
            marginBottom: "20px",
            fontFamily: "var(--font-mono)",
            color: "#f87171",
          }}
        >
          ⊗
        </div>

        {/* Wordmark */}
        <div
          className="font-display"
          style={{
            fontSize: "14px",
            letterSpacing: "0.2em",
            color: "var(--text-muted)",
            marginBottom: "16px",
          }}
        >
          WISHSNIPE
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: "clamp(40px, 8vw, 60px)",
            lineHeight: 1,
            letterSpacing: "0.04em",
            color: "var(--text)",
            marginBottom: "16px",
          }}
        >
          CONFIRM EXIT
        </h1>

        <div
          aria-hidden
          style={{
            width: "40px",
            height: "1px",
            background: "rgba(248,113,113,0.4)",
            marginBottom: "20px",
          }}
        />

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            lineHeight: 1.6,
            marginBottom: "36px",
          }}
        >
          You'll need to sign back in with Steam
          to access your wishlist and price alerts.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <button
            onClick={confirm}
            disabled={leaving}
            style={{
              padding: "14px 28px",
              background: leaving ? "rgba(248,113,113,0.05)" : "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.35)",
              borderRadius: "10px",
              color: "#f87171",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.1em",
              cursor: leaving ? "wait" : "pointer",
              opacity: leaving ? 0.6 : 1,
              transition: "all 0.2s",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (!leaving) {
                ;(e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.14)"
                ;(e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(248,113,113,0.15)"
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "rgba(248,113,113,0.08)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
            }}
          >
            {leaving ? "SIGNING OUT…" : "CONFIRM EXIT"}
          </button>

          <a
            href="/dashboard"
            style={{
              padding: "12px 28px",
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "10px",
              color: "var(--text-muted)",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              textDecoration: "none",
              textAlign: "center",
              transition: "border-color 0.2s, color 0.2s",
              width: "100%",
              display: "block",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"
              ;(e.currentTarget as HTMLElement).style.color = "var(--text)"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"
              ;(e.currentTarget as HTMLElement).style.color = "var(--text-muted)"
            }}
          >
            ← GO BACK
          </a>
        </div>

        <p
          style={{
            marginTop: "32px",
            color: "var(--text-dim)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            fontFamily: "var(--font-mono)",
          }}
        >
          STEAM OPENID · NO STORED PASSWORDS
        </p>
      </div>
    </main>
  )
}
