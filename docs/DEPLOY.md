# StackFlex — production deploy checklist

Lean public beta. Do not enable experimental portfolio routes in production.

## 1. Environment variables (Vercel / host)

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `https://stackflex.app` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Recommended | `stackflex.app` |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | No | Only if self-hosting / proxying Plausible |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Defaults to `hello@stackflex.app` |
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
- **Domains:** apex + `www` → HTTPS; set `NEXT_PUBLIC_SITE_URL` to the canonical host you want in OG/sitemap (prefer `https://stackflex.app`).

### LinkedIn app (only if enabling import)

1. Redirect URL: `https://stackflex.app/api/auth/linkedin/callback`
2. Product: Sign In with LinkedIn using OpenID Connect
3. Set env vars above and redeploy

### Plausible

1. Add site `stackflex.app` in Plausible (or self-host).
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=stackflex.app`.
3. Confirm hash pageviews (`#guide`, `#results`) and custom events in the dashboard:
   - `start_clicked`
   - `onboarding_completed`
   - `card_downloaded`
   - `banner_downloaded`
   - `profile_edited`

## 3. Routes that must stay closed in production

| Path | Production behavior |
|---|---|
| `/dev/*` | 404 |
| `/portfolio`, `/portfolio/build`, `/portfolio/preview` | 404 |
| `/api/auth/linkedin` | 503 unless LinkedIn env is configured |

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
- Plausible: use the plan that matches expected traffic; traffic spikes show in Plausible, not as per-event cloud function cost (client-side beacon).
- Keep LinkedIn import off unless needed (avoids OAuth abuse surface).

## 6. Rollback

1. In Vercel → Deployments → open the last known-good production deployment → **Promote to Production** (instant rollback).
2. If env vars were the cause, revert the env change and redeploy.
3. Confirm `/`, `/privacy`, and Results download still work after promote.

## 7. Post-deploy

- [ ] Canonical domain loads over HTTPS
- [ ] OG preview looks correct in LinkedIn/Slack debugger
- [ ] Plausible receiving pageviews + a test `start_clicked`
- [ ] LinkedIn import intentionally off **or** end-to-end OAuth works
- [ ] Spend alert enabled
