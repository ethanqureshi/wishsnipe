export default function Loading() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav skeleton */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(2,3,10,0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <span
            className="font-display"
            style={{
              fontSize: "26px",
              letterSpacing: "0.06em",
              background: "linear-gradient(135deg, #fff 0%, var(--amber) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              flexShrink: 0,
            }}
          >
            WISHSNIPE
          </span>

          {/* Email skeleton */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div className="skeleton" style={{ width: "240px", height: "34px", borderRadius: "8px" }} />
          </div>

          {/* Avatar skeleton */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="skeleton" style={{ width: "28px", height: "28px", borderRadius: "50%" }} />
            <div className="skeleton" style={{ width: "80px", height: "14px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "42px", height: "26px", borderRadius: "6px" }} />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 24px 64px" }}>
        {/* Header skeleton */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div className="skeleton" style={{ width: "160px", height: "36px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "80px", height: "28px", borderRadius: "6px" }} />
          </div>
          {/* Amber rule */}
          <div style={{ height: "1px", background: "linear-gradient(to right, rgba(245,158,11,0.3), transparent)", marginBottom: "10px" }} />
          {/* Stats skeleton */}
          <div style={{ display: "flex", gap: "16px" }}>
            <div className="skeleton" style={{ width: "70px", height: "11px", borderRadius: "3px" }} />
            <div className="skeleton" style={{ width: "90px", height: "11px", borderRadius: "3px" }} />
            <div className="skeleton" style={{ width: "110px", height: "11px", borderRadius: "3px" }} />
          </div>
        </div>

        {/* Syncing indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: "var(--amber)",
              opacity: 0.7,
              animation: "pulse-opacity 1.4s ease-in-out infinite",
            }}
          >
            ⬡ SYNCING WISHLIST…
          </span>
        </div>

        {/* Card skeletons */}
        <div
          className="dashboard-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                borderLeft: "3px solid rgba(245,158,11,0.15)",
                display: "flex",
                flexDirection: "column",
                opacity: 1 - i * 0.08,
              }}
            >
              {/* Image skeleton */}
              <div
                className="skeleton"
                style={{ width: "100%", minHeight: "160px", aspectRatio: "460/215" }}
              />
              {/* Body */}
              <div style={{ padding: "12px 14px 8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="skeleton" style={{ height: "14px", borderRadius: "3px", width: "85%" }} />
                <div className="skeleton" style={{ height: "14px", borderRadius: "3px", width: "55%" }} />
                <div className="skeleton" style={{ height: "20px", borderRadius: "4px", width: "70px" }} />
                <div className="skeleton" style={{ height: "11px", borderRadius: "3px", width: "120px", marginTop: "4px" }} />
              </div>
              {/* Alert row skeleton */}
              <div
                style={{
                  padding: "10px 12px",
                  borderTop: "1px solid var(--border)",
                  background: "rgba(0,0,0,0.2)",
                }}
              >
                <div className="skeleton" style={{ height: "24px", borderRadius: "6px", width: "140px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
