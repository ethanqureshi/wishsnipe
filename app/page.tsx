import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (session) redirect("/dashboard")

  const { error } = await searchParams

  const errorMessages: Record<string, string> = {
    steam_auth_failed: "Steam verification failed. Please try again.",
    invalid_steam_id: "Couldn't read your Steam ID. Please try again.",
    steam_profile_not_found: "Couldn't load your Steam profile. Check your API key.",
  }
  const errorMsg = error ? (errorMessages[error] ?? "Something went wrong. Please try again.") : null

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/videos/gaming1.mp4" type="video/mp4" />
        <source src="/videos/gaming2.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2,3,10,0.72)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Top ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 1,
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
          maxWidth: "440px",
          width: "100%",
        }}
      >
        {/* Crosshair icon */}
        <div
          aria-hidden
          style={{
            fontSize: "36px",
            color: "var(--amber)",
            opacity: 0.3,
            marginBottom: "20px",
            lineHeight: 1,
            fontFamily: "var(--font-mono)",
          }}
        >
          ⊕
        </div>

        {/* Wordmark */}
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(72px, 14vw, 108px)",
            lineHeight: 0.92,
            letterSpacing: "0.05em",
            background: "linear-gradient(160deg, #ffffff 0%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "20px",
          }}
        >
          WISH
          <br />
          SNIPE
        </h1>

        {/* Divider line */}
        <div
          aria-hidden
          style={{
            width: "48px",
            height: "1px",
            background: "rgba(245,158,11,0.4)",
            marginBottom: "20px",
          }}
        />

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            lineHeight: 1.7,
            marginBottom: "36px",
            maxWidth: "320px",
          }}
        >
          Connect your Steam account. Get notified the instant
          a wishlist game hits your target price — or its all-time low.
        </p>

        {errorMsg && (
          <div
            role="alert"
            style={{
              width: "100%",
              marginBottom: "24px",
              padding: "12px 16px",
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "13px",
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </div>
        )}

        <a href="/api/auth/steam/login" className="btn-steam">
          <SteamIcon />
          Sign in with Steam
        </a>

        <p
          style={{
            marginTop: "18px",
            color: "var(--text-dim)",
            fontSize: "11px",
            letterSpacing: "0.06em",
            fontFamily: "var(--font-mono)",
          }}
        >
          NO PASSWORD · OPENID · STEAM HANDLES AUTH
        </p>
      </div>

      {/* Bottom version tag */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          fontSize: "10px",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
          fontFamily: "var(--font-mono)",
          zIndex: 3,
        }}
      >
        WISHSNIPE v1.0
      </div>
    </main>
  )
}

function SteamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.979 0C5.678 0 0.511 4.86 0.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
    </svg>
  )
}
