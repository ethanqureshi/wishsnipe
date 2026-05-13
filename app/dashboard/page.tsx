import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { fetchWishlist, fetchGameDetails, formatPrice, type GameDetails } from "@/lib/steam"
import {
  upsertUser,
  upsertGames,
  upsertWishlistItems,
  insertPriceSnapshots,
  upsertHistoricalLows,
  getStoredHistoricalLows,
  getCachedGamePrices,
} from "@/lib/db"
import { lookupItadIds, fetchHistoricalLows, getDealBadge, type DealBadge } from "@/lib/itad"
import { supabaseAdmin } from "@/lib/supabase"
import { EmailSettings, ThresholdInput } from "./AlertControls"
import { HUDBackground } from "./HUDBackground"
import { RefreshButton } from "./RefreshButton"
import { SmallWishlistBanner } from "./SmallWishlistBanner"
import { UpgradeBanner } from "./UpgradeBanner"

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  const steamId = session.user.steamId
  const { upgraded } = await searchParams

  // Phase 1: wishlist + user data + upsert user — all parallel
  const [wishlistItems, { data: userData }] = await Promise.all([
    fetchWishlist(steamId),
    supabaseAdmin.from("users").select("alert_email, is_pro").eq("steam_id", steamId).single(),
    upsertUser(steamId, session.user.name ?? "", session.user.image ?? ""),
  ])

  const isPro = (userData as { is_pro?: boolean } | null)?.is_pro ?? false
  const gameLimit = isPro ? 20 : 5

  const sorted = [...wishlistItems].sort((a, b) => a.priority - b.priority)
  const appids = sorted.slice(0, gameLimit).map((i) => i.appid)

  // Phase 2: DB price cache + ITAD stored lows + thresholds + wishlist write — all parallel
  const [cachedPrices, stored, { data: thresholdRows }] = await Promise.all([
    getCachedGamePrices(appids),
    getStoredHistoricalLows(appids),
    appids.length > 0
      ? supabaseAdmin
          .from("wishlist_items")
          .select("appid, alert_threshold_price")
          .eq("steam_id", steamId)
          .in("appid", appids)
      : Promise.resolve({ data: [] }),
    upsertWishlistItems(steamId, wishlistItems),
  ])

  // Phase 3: Steam fetch (stale/missing only) + ITAD lookup — parallel
  const staleAppids = appids.filter((id) => !cachedPrices.has(id))
  const staleThreshold = Date.now() - 24 * 60 * 60 * 1000
  const needsRefresh = appids.filter((id) => {
    const row = stored.get(id)
    return !row || new Date(row.updatedAt).getTime() < staleThreshold
  })
  const itadAttempted = new Set<number>(needsRefresh)

  const [freshGames, itadIdMap] = await Promise.all([
    staleAppids.length > 0 ? fetchGameDetails(staleAppids) : Promise.resolve([]),
    needsRefresh.length > 0 ? lookupItadIds(needsRefresh) : Promise.resolve(new Map<number, string>()),
  ])

  const games = [...cachedPrices.values(), ...freshGames]

  // Write fresh Steam data back to DB (non-blocking for render)
  const dbWrite = freshGames.length > 0
    ? upsertGames(freshGames).then(() => insertPriceSnapshots(freshGames))
    : Promise.resolve()

  // Phase 4: fetch historical lows for newly found ITAD IDs
  if (itadIdMap.size > 0) {
    const lows = await fetchHistoricalLows([...itadIdMap.values()])
    const toStore = [...itadIdMap.entries()]
      .map(([appid, itadId]) => {
        const low = lows.get(itadId)
        return low ? { appid, ...low } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    if (toStore.length > 0) await upsertHistoricalLows(toStore)
  }

  await dbWrite
  const freshLows = await getStoredHistoricalLows(appids)
  const itadChecked = new Set([...freshLows.keys(), ...itadAttempted])

  const thresholdMap = new Map(
    (thresholdRows ?? []).map(
      (r: { appid: number; alert_threshold_price: number | null }) => [
        r.appid,
        r.alert_threshold_price,
      ]
    )
  )

  const totalValue = games.reduce((sum, g) => sum + (g.currentPrice ?? 0), 0)
  const activeAlerts = [...thresholdMap.values()].filter((v) => v !== null).length

  return (
    <div style={{ minHeight: "100vh" }}>
      <HUDBackground />
      <div className="vignette" aria-hidden />
      {/* ── Nav ── */}
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
          {/* Wordmark */}
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

          {/* Email settings */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <EmailSettings currentEmail={userData?.alert_email ?? null} />
          </div>

          {/* User info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name ?? "avatar"}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid var(--border-strong)",
                }}
              />
            )}
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user?.name}
            </span>
            {isPro && (
              <span
                className="font-mono"
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--bg)",
                  background: "var(--amber)",
                  borderRadius: "4px",
                  padding: "2px 5px",
                }}
              >
                PRO
              </span>
            )}
            <a
              href="/signout"
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
                textDecoration: "none",
                padding: "4px 8px",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              EXIT
            </a>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        {/* Upgraded toast */}
        {upgraded === "1" && (
          <div
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "10px",
              padding: "14px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "18px" }}>⚡</span>
            <span style={{ color: "var(--amber)", fontWeight: 600, fontSize: "14px" }}>
              Welcome to Pro! Unlimited games and instant alerts are now active.
            </span>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <h1
              className="font-display"
              style={{ fontSize: "32px", letterSpacing: "0.04em", color: "var(--text)" }}
            >
              WISHLIST
            </h1>
            <RefreshButton />
          </div>
          {/* Amber rule */}
          <div style={{ height: "1px", background: "linear-gradient(to right, rgba(245,158,11,0.5), transparent)", marginBottom: "10px" }} />
          {/* Live stats */}
          {wishlistItems.length > 0 && (
            <div
              className="font-mono"
              style={{ color: "var(--text-dim)", fontSize: "11px", letterSpacing: "0.08em", display: "flex", gap: "16px", flexWrap: "wrap" }}
            >
              <span>{wishlistItems.length} GAMES</span>
              {totalValue > 0 && <span>{formatPrice(totalValue)} TOTAL</span>}
              <span>{activeAlerts} ACTIVE ALERT{activeAlerts !== 1 ? "S" : ""}</span>
            </div>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <EmptyState message="No wishlist items found" sub="Make your Steam wishlist Public in privacy settings." />
        ) : games.length === 0 ? (
          <EmptyState message="Couldn't load game details" sub="Try refreshing the page." />
        ) : games.length < 5 ? (
          <>
            <SmallWishlistBanner />
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {games.map((game, i) => {
                const low = freshLows.get(game.appid)
                return (
                  <GameCard key={game.appid} game={game} historicalLow={low?.lowPrice ?? null}
                    historicalLowShop={low?.lowShop ?? null} hasItadData={itadChecked.has(game.appid)}
                    threshold={thresholdMap.get(game.appid) ?? null} index={i} />
                )
              })}
            </div>
          </>
        ) : (
          <>
            <div
              className="dashboard-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {games.map((game, i) => {
                const low = freshLows.get(game.appid)
                return (
                  <GameCard
                    key={game.appid}
                    game={game}
                    historicalLow={low?.lowPrice ?? null}
                    historicalLowShop={low?.lowShop ?? null}
                    hasItadData={itadChecked.has(game.appid)}
                    threshold={thresholdMap.get(game.appid) ?? null}
                    index={i}
                  />
                )
              })}
            </div>
            {!isPro && wishlistItems.length > 5 && (
              <UpgradeBanner lockedCount={wishlistItems.length - 5} />
            )}
            {isPro && wishlistItems.length > 20 && (
              <p
                className="font-mono"
                style={{
                  textAlign: "center",
                  color: "var(--text-dim)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  marginTop: "40px",
                }}
              >
                SHOWING 20 OF {wishlistItems.length} — FULL LIST COMING SOON
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Badge config ── */
const BADGE_CONFIG: Record<
  DealBadge,
  { bg: string; text: string; glow: string; shadow: string }
> = {
  "Historical Low 🎯": {
    bg: "rgba(251,191,36,0.12)",
    text: "#fbbf24",
    glow: "rgba(251,191,36,0.35)",
    shadow: "rgba(251,191,36,0.15)",
  },
  "Never Been Cheaper ⚡": {
    bg: "rgba(192,132,252,0.12)",
    text: "#c084fc",
    glow: "rgba(192,132,252,0.35)",
    shadow: "rgba(192,132,252,0.15)",
  },
  "Near Low 💚": {
    bg: "rgba(52,211,153,0.10)",
    text: "#34d399",
    glow: "rgba(52,211,153,0.30)",
    shadow: "rgba(52,211,153,0.12)",
  },
  "Good Deal 👍": {
    bg: "rgba(74,222,128,0.08)",
    text: "#4ade80",
    glow: "rgba(74,222,128,0.25)",
    shadow: "rgba(74,222,128,0.10)",
  },
  "Average Deal 🟡": {
    bg: "rgba(251,146,60,0.08)",
    text: "#fb923c",
    glow: "rgba(251,146,60,0.20)",
    shadow: "rgba(251,146,60,0.08)",
  },
  "Wait 🔴": {
    bg: "rgba(248,113,113,0.08)",
    text: "#f87171",
    glow: "rgba(248,113,113,0.20)",
    shadow: "rgba(248,113,113,0.08)",
  },
  "": {
    bg: "transparent",
    text: "var(--text-muted)",
    glow: "rgba(255,255,255,0.07)",
    shadow: "transparent",
  },
}

function GameCard({
  game,
  historicalLow,
  historicalLowShop,
  hasItadData,
  threshold,
  index,
}: {
  game: GameDetails
  historicalLow: number | null
  historicalLowShop: string | null
  hasItadData: boolean
  threshold: number | null
  index: number
}) {
  const badge = getDealBadge(game.currentPrice, historicalLow, game.discountPercent)
  const cfg = BADGE_CONFIG[badge]
  const isOnSale = game.discountPercent > 0
  const storeUrl = `https://store.steampowered.com/app/${game.appid}`
  const isAtHistoricalLow = historicalLow !== null && game.currentPrice !== null && game.currentPrice <= historicalLow

  const leftBorderColor = hasItadData
    ? (badge ? cfg.text : "rgba(80,90,120,0.35)")
    : (isOnSale ? "rgba(251,146,60,0.5)" : "rgba(60,70,100,0.3)")

  return (
    <div
      className="game-card card-enter"
      style={{
        animationDelay: `${index * 55}ms`,
        "--card-glow": cfg.glow,
        "--card-glow-shadow": cfg.shadow,
        display: "flex",
        flexDirection: "column",
        borderLeft: `3px solid ${leftBorderColor}`,
      } as React.CSSProperties}
    >
      {/* Image */}
      <a href={storeUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative" }}>
        <div className="scanlines" style={{ position: "relative", minHeight: "160px", aspectRatio: "460/215", overflow: "hidden", background: "var(--surface-2)" }}>
          <img
            src={game.headerImage}
            alt={game.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            loading="lazy"
          />
          {/* Gradient overlay for text legibility */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(2,3,10,0.85) 0%, transparent 55%)",
            }}
          />
          {/* Discount badge */}
          {isOnSale && (
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(2,3,10,0.85)",
                border: "1px solid rgba(74,222,128,0.4)",
                borderRadius: "5px",
                padding: "2px 7px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#4ade80",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.02em",
              }}
            >
              -{game.discountPercent}%
            </div>
          )}
        </div>
      </a>

      {/* Card body */}
      <div style={{ padding: "12px 14px 8px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Game name */}
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="card-title"
          style={{
            color: "var(--text)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {game.name}
        </a>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          {game.isFree ? (
            <span
              className="font-mono"
              style={{ color: "#4ade80", fontSize: "15px", fontWeight: 700 }}
            >
              FREE
            </span>
          ) : game.currentPrice == null ? (
            <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              N/A
            </span>
          ) : (
            <>
              <span
                className={`font-mono${isAtHistoricalLow ? " price-at-low" : ""}`}
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: isOnSale ? "#4ade80" : "var(--text)",
                }}
              >
                {formatPrice(game.currentPrice)}
              </span>
              {isOnSale && game.originalPrice && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatPrice(game.originalPrice)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Deal badge */}
        {hasItadData ? (
          badge ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "3px 8px",
                background: cfg.bg,
                border: `1px solid ${cfg.glow}`,
                borderRadius: "5px",
                fontSize: "11px",
                fontWeight: 600,
                color: cfg.text,
                letterSpacing: "0.01em",
                alignSelf: "flex-start",
                fontFamily: "var(--font-body)",
              }}
            >
              {badge}
            </div>
          ) : null
        ) : (
          // No ITAD data — Steam-only fallback badge
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 8px",
              background: isOnSale ? "rgba(251,146,60,0.08)" : "rgba(100,110,140,0.08)",
              border: `1px solid ${isOnSale ? "rgba(251,146,60,0.25)" : "rgba(100,110,140,0.20)"}`,
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 600,
              color: isOnSale ? "#fb923c" : "#4a5280",
              letterSpacing: "0.01em",
              alignSelf: "flex-start",
              fontFamily: "var(--font-body)",
            }}
          >
            {isOnSale ? `On Sale −${game.discountPercent}%` : "Full Price"}
          </div>
        )}

        {/* Historical low */}
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.01em",
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {!hasItadData ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 6px",
                background: "rgba(100,110,140,0.07)",
                border: "1px solid rgba(100,110,140,0.18)",
                borderRadius: "4px",
                color: "#3a4060",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily: "var(--font-mono)",
              }}
            >
              NO HISTORY
            </span>
          ) : historicalLow !== null ? (
            <>
              <span style={{ color: "var(--text-dim)" }}>ALL-TIME LOW </span>
              <span style={{ color: "var(--col-hist)" }}>
                {formatPrice(historicalLow)}
              </span>
              {historicalLowShop && (
                <span style={{ color: "var(--text-dim)" }}> · {historicalLowShop}</span>
              )}
            </>
          ) : (
            <span style={{ color: "var(--text-dim)" }}>No price history</span>
          )}
        </div>
      </div>

      {/* Alert input */}
      <ThresholdInput appid={game.appid} currentThreshold={threshold} />
    </div>
  )
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "60px 40px",
        textAlign: "center",
      }}
    >
      <p style={{ color: "var(--text)", fontWeight: 600, marginBottom: "8px" }}>{message}</p>
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{sub}</p>
    </div>
  )
}
