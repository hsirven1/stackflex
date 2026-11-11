# StackFlex — production deploy checklist

Lean public beta. Do not enable experimental portfolio routes in production.

## 1. Environment variables (Vercel / host)

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Canonical host Claude/users hit with **no redirect**. Today: `https://www.stackflex.app` (apex 308s → www; Claude drops `Authorization` across hosts) |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS` | No | Set to `1` only on Pro+ to send custom funnel events |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Defaults to `hello@stackflex.app` |
| `MCP_PORTFOLIO_TOKEN` | For MCP | Server-only bearer for `/api/mcp` (Encrypted; never `NEXT_PUBLIC_`). See `docs/MCP.md` |
| `MCP_DRAFT_SECRET` | For MCP in prod | Server-only HMAC for review URLs (Encrypted; never `NEXT_PUBLIC_`) |
| `LINKEDIN_CLIENT_ID` | No | Leave empty to **disable** LinkedIn import |
| `LINKEDIN_CLIENT_SECRET` | With LinkedIn | From LinkedIn developer app |
| `LINKEDIN_REDIRECT_URI` | No | Defaults to `{NEXT_PUBLIC_SITE_URL}/api/auth/linkedin/callback` |
| `STACKFLEX_OAUTH_SECRET` | With LinkedIn | Strong random secret (or reuse client secret) |

LinkedIn import stays disabled when `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` are unset (`/api/auth/linkedin/status` → `{ "configured": false }`).

## 2. Hosting configuration

- **Platform:** Vercel (or compatible Node host) with HTTPS on `stackflex.app`.
- **Build:** `npm run build`
- **Start:** `npm run start` (Vercel uses the build output automatically).
- **Node:** matches Next.js 16 requirements.
- **Domains:** Production URL is `https://www.stackflex.app` (apex redirects to www). Set `NEXT_PUBLIC_SITE_URL=https://www.stackflex.app` so MCP review URLs and Claude’s connector host match.

### LinkedIn app (only if enabling import)

1. Redirect URL: `https://stackflex.app/api/auth/linkedin/callback`
2. Product: Sign In with LinkedIn using OpenID Connect
3. Set env vars above and redeploy

### Vercel Web Analytics

1. Enable **Web Analytics** for the StackFlex project in the Vercel dashboard (no env var required for page views).
2. Confirm page views and referrers appear under **Analytics** after deploy (Reddit traffic shows as a referring site when visitors arrive from there).
3. Custom funnel events (`start_clicked`, `onboarding_completed`, `card_downloaded`, `banner_downloaded`, `profile_edited`, …) require a **Pro** (or Enterprise) plan. On Hobby they stay abstracted and are not sent.
4. After upgrading to Pro, set `NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS=1` and redeploy to activate `track()` → Vercel custom events.
5. UTM campaign breakdown in the Vercel UI needs the **Web Analytics Plus** add-on; referrers work without it.

## 3. Routes that must stay closed in production

| Path | Production behavior |
|---|---|
| `/dev/*` | 404 |
| `/portfolio`, `/portfolio/build`, `/portfolio/preview` | 404 |
| `/api/auth/linkedin` | 503 unless LinkedIn env is configured |

**Exception:** `/portfolio/review/[token]` stays available in production — it is the private MCP draft review surface (signed URL token). `/api/mcp` returns 503 until `MCP_PORTFOLIO_TOKEN` is set. See `docs/MCP.md`.

Local `next dev` still serves portfolio + `/dev` galleries for testing.

## 4. Pre-deploy verification

```bash
npm test
npx tsc --noEmit
npm run build
npm run start   # then smoke-test below
```

Smoke:

- `GET /` → 200
- `GET /privacy`, `/contact`, `/opengraph-image`, `/robots.txt`, `/sitemap.xml` → 200
- `GET /dev/banner-export` → 404
- `GET /portfolio/build` → 404
- `GET /api/auth/linkedin/status` → `{"configured":false}` (unless intentionally enabled)
- Sitemap / OG absolute URLs use `https://stackflex.app` when `NEXT_PUBLIC_SITE_URL` is set at build time

## 5. Hosting cost controls

- Set a **monthly spend alert** in the Vercel (or host) billing dashboard.
- Cap preview deployments if using them heavily.
- Web Analytics: Hobby includes a monthly event allowance for page views; upgrade to Pro before enabling custom funnel events (`NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS=1`).
- Keep LinkedIn import off unless needed (avoids OAuth abuse surface).

## 6. Rollback

1. In Vercel → Deployments → open the last known-good production deployment → **Promote to Production** (instant rollback).
2. If env vars were the cause, revert the env change and redeploy.
3. Confirm `/`, `/privacy`, and Results download still work after promote.

## 7. Post-deploy

- [ ] Canonical domain loads over HTTPS
- [ ] OG preview looks correct in LinkedIn/Slack debugger
- [ ] Vercel Analytics receiving pageviews (and custom events only if Pro + `NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS=1`)
- [ ] LinkedIn import intentionally off **or** end-to-end OAuth works
- [ ] Spend alert enabled
