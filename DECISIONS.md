# WishSnipe — Architecture Decisions

## Auth: Custom Steam OpenID, not NextAuth Steam Provider

NextAuth has no maintained Steam provider. We implement OpenID 2.0 manually:
- `/api/auth/steam/login` — redirects to Steam's OpenID endpoint
- `/api/auth/steam/callback` — verifies assertion, fetches profile, mints a NextAuth-compatible JWT

The JWT is written directly as `__Secure-next-auth.session-token` (HTTPS) or `next-auth.session-token` (HTTP). This means `getServerSession(authOptions)` works normally in server components.

## Cron: GitHub Actions every 6 hours + Vercel daily fallback

Vercel Hobby plan caps built-in cron to once per day. Primary scheduler is a free GitHub Actions workflow (`.github/workflows/price-check.yml`) that fires at 00:00, 06:00, 12:00, 18:00 UTC via `curl` to `/api/cron/check-prices` with `Authorization: Bearer $CRON_SECRET`.

**Setup required:** add `CRON_SECRET` as a repository secret in GitHub → Settings → Secrets → Actions.

The `vercel.json` daily cron (9am UTC) stays as a fallback in case GitHub Actions is disabled.

## ITAD Integration: Per-Game Lookup + Batch Overview

We look up ITAD game IDs one-at-a-time (`/games/lookup/v1`) in batches of 5 to avoid rate limits, then fetch historical lows in a single bulk POST (`/games/overview/v2`). Results are cached in `historical_lows` table with a 24-hour staleness threshold to minimize API calls.

## Wishlist: Top 20 Only

Steam wishlists can have hundreds of games. Dashboard renders the top 20 by priority. Full pagination is a v2 feature.

## Email: `onboarding@resend.dev` Sender

Using Resend's shared sandbox domain. To avoid spam filters in production, verify a custom domain in the Resend dashboard and update `from:` in `/api/cron/check-prices/route.ts`.

## Alert Cooldown: 24 Hours

Once an alert fires for a game, the same game won't trigger another email for 24 hours (`last_alerted_at` column on `wishlist_items`). Prevents spam during extended sales.

## Price Storage: Integer Cents

All prices stored as integer cents (e.g. `$9.99` = `999`) to avoid floating-point issues. `formatPrice()` in `lib/steam.ts` converts to display string.

## Video Background: Higgsfield AI

Two gameplay clips generated with Higgsfield CLI, stored in `public/videos/`. The `<video>` element tries `gaming1.mp4` first with `gaming2.mp4` as fallback. A 72% dark overlay preserves text contrast. If both fail (network, browser policy), the dot-grid `body::before` pseudo-element provides a fallback atmosphere.
