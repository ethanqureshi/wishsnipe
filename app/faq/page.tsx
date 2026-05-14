const BADGES = [
  {
    label: "Historical Low 🎯",
    bg: "rgba(251,191,36,0.12)",
    text: "#fbbf24",
    border: "rgba(251,191,36,0.35)",
    desc: "Cheapest this game has ever been. Buy it.",
  },
  {
    label: "Never Been Cheaper ⚡",
    bg: "rgba(192,132,252,0.12)",
    text: "#c084fc",
    border: "rgba(192,132,252,0.35)",
    desc: "Price just dropped below any previously recorded low. Rare.",
  },
  {
    label: "Near Low 💚",
    bg: "rgba(52,211,153,0.10)",
    text: "#34d399",
    border: "rgba(52,211,153,0.30)",
    desc: "Within 10% of the all-time low. Very good deal.",
  },
  {
    label: "Good Deal 👍",
    bg: "rgba(74,222,128,0.08)",
    text: "#4ade80",
    border: "rgba(74,222,128,0.25)",
    desc: "40%+ off but not near historical low. Worth it if you want it now.",
  },
  {
    label: "Average Deal 🟡",
    bg: "rgba(251,146,60,0.08)",
    text: "#fb923c",
    border: "rgba(251,146,60,0.20)",
    desc: "Discounted but better deals have happened. Consider waiting.",
  },
  {
    label: "Wait 🔴",
    bg: "rgba(248,113,113,0.08)",
    text: "#f87171",
    border: "rgba(248,113,113,0.20)",
    desc: "Full price or close to it. Historical low is much lower. Be patient.",
  },
  {
    label: "On Sale 🟠",
    bg: "rgba(251,146,60,0.08)",
    text: "#fb923c",
    border: "rgba(251,146,60,0.25)",
    desc: "No historical data available but currently discounted.",
  },
  {
    label: "Full Price ⬜",
    bg: "rgba(100,110,140,0.08)",
    text: "#4a5280",
    border: "rgba(100,110,140,0.20)",
    desc: "No discount right now.",
  },
]

const FAQS = [
  {
    q: "Does this work with any Steam account?",
    a: "Yes — just set your Steam profile and wishlist to Public in your privacy settings.",
  },
  {
    q: "How often are prices checked?",
    a: "Every 6 hours via automated background checks.",
  },
  {
    q: "Where does price history come from?",
    a: "IsThereAnyDeal.com — the most comprehensive PC game price database, tracking deals across all major storefronts.",
  },
  {
    q: "Will I get spammed?",
    a: "No. You only get emailed when a game drops to your target price or lower.",
  },
  {
    q: "Is my Steam password stored?",
    a: "Never. We use Steam's official OpenID login — no password is ever shared with us.",
  },
  {
    q: "What happens if I remove a game from my Steam wishlist?",
    a: "Hit Refresh on your dashboard to sync. WishSnipe mirrors whatever is on your Steam wishlist.",
  },
]

export default function FAQ() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(2,3,10,0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <a
            href="/dashboard"
            className="font-display"
            style={{
              fontSize: "22px",
              letterSpacing: "0.06em",
              background: "linear-gradient(135deg, #fff 0%, var(--amber) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            WISHSNIPE
          </a>
          <span
            className="font-mono"
            style={{ color: "var(--text-dim)", fontSize: "10px", letterSpacing: "0.1em" }}
          >
            / FAQ
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 96px" }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: "56px" }}>
          <p
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: "var(--amber)",
              marginBottom: "14px",
            }}
          >
            WISHSNIPE / HOW IT WORKS
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(52px, 9vw, 80px)",
              lineHeight: 0.92,
              letterSpacing: "0.04em",
              color: "var(--text)",
              marginBottom: "20px",
            }}
          >
            STOP PAYING<br />FULL PRICE
          </h1>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(to right, rgba(245,158,11,0.45), transparent)",
              marginBottom: "20px",
            }}
          />
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "15px",
              lineHeight: 1.75,
              maxWidth: "560px",
            }}
          >
            WishSnipe connects to your Steam account and imports your wishlist automatically.
            Every 6 hours, it checks prices across all major storefronts and compares them to
            historical lows — alerting you only when a game is genuinely worth buying.
          </p>
        </div>

        {/* ── Badges ── */}
        <Section title="WHAT THE BADGES MEAN">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {BADGES.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    background: b.bg,
                    border: `1px solid ${b.border}`,
                    borderRadius: "5px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: b.text,
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-body)",
                    flexShrink: 0,
                    minWidth: "200px",
                  }}
                >
                  {b.label}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5 }}>
                  {b.desc}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Free vs Pro ── */}
        <Section title="FREE VS PRO">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            <PlanCard
              title="FREE"
              price="$0 — always"
              features={[
                "Track up to 5 wishlist games",
                "Historical low badges",
                "Price alerts at your target",
                "Daily email digest",
              ]}
            />
            <PlanCard
              title="PRO"
              price="$2.99 — one-time, lifetime"
              features={[
                "Unlimited games tracked",
                "Instant price alert emails",
                "Everything in Free",
                "Supports development",
              ]}
              highlight
            />
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section title="FAQ">
          <div>
            {FAQS.map((item, i) => (
              <div
                key={i}
                style={{ borderTop: "1px solid var(--border)", padding: "22px 0" }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    color: "var(--amber)",
                    letterSpacing: "0.05em",
                    marginBottom: "10px",
                  }}
                >
                  {item.q}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.7 }}>
                  {item.a}
                </p>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border)" }} />
          </div>
        </Section>

        {/* ── CTA ── */}
        <div style={{ marginTop: "56px", textAlign: "center" }}>
          <a
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "10px",
              color: "var(--amber)",
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              letterSpacing: "0.06em",
              textDecoration: "none",
            }}
          >
            ⊕ OPEN DASHBOARD
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "56px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2
          className="font-display"
          style={{
            fontSize: "26px",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: "12px",
          }}
        >
          {title}
        </h2>
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, rgba(245,158,11,0.25), transparent)",
          }}
        />
      </div>
      {children}
    </section>
  )
}

function PlanCard({
  title,
  price,
  features,
  highlight,
}: {
  title: string
  price: string
  features: string[]
  highlight?: boolean
}) {
  return (
    <div
      style={{
        background: highlight ? "rgba(245,158,11,0.04)" : "var(--surface)",
        border: `1px solid ${highlight ? "rgba(245,158,11,0.28)" : "var(--border)"}`,
        borderRadius: "10px",
        padding: "24px",
      }}
    >
      <p
        className="font-display"
        style={{
          fontSize: "24px",
          letterSpacing: "0.08em",
          color: highlight ? "var(--amber)" : "var(--text)",
          marginBottom: "4px",
        }}
      >
        {title}
      </p>
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          color: "var(--text-dim)",
          letterSpacing: "0.06em",
          marginBottom: "20px",
        }}
      >
        {price}
      </p>
      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
        {features.map((f) => (
          <li key={f} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span
              style={{
                color: highlight ? "var(--amber)" : "var(--text-dim)",
                flexShrink: 0,
                fontSize: "12px",
                marginTop: "1px",
              }}
            >
              —
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5 }}>
              {f}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
