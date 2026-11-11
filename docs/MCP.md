# StackFlex MCP portfolio drafting

Smallest end-to-end MCP integration for creating **private** AI portfolio drafts.

## What exists today

| Piece | Path |
|---|---|
| MCP endpoint | `POST/GET https://<host>/api/mcp` |
| Tool | `create_portfolio_draft` |
| Review UI | `/portfolio/review/[token]` |
| Schema | `stackflex-portfolio-import-v1` (shared with the paste-import experiment) |

The connecting assistant (Claude / ChatGPT) performs extraction. StackFlex only validates, stores a private draft token, and returns a review URL. Drafts are **never** published automatically.

## Single-user / development mode (current)

StackFlex has no user accounts or database. This MCP integration therefore uses:

1. **Shared bearer token** — `MCP_PORTFOLIO_TOKEN`
2. **HMAC draft signing** — `MCP_DRAFT_SECRET` (falls back to `STACKFLEX_OAUTH_SECRET` in local/dev)
3. **Signed URL tokens** — the draft payload is compressed + signed into the review URL (no DB)

Anyone who knows the review URL can open the draft. Treat the URL as a secret.

### Required environment variables

```bash
# Required to enable /api/mcp (server-only; never NEXT_PUBLIC_*)
MCP_PORTFOLIO_TOKEN=generate-a-long-random-secret

# Required in production to sign draft tokens (server-only)
MCP_DRAFT_SECRET=generate-another-long-random-secret

# Canonical public origin — must match the host Claude calls (no redirect)
# Production StackFlex currently redirects apex → www, so use www:
NEXT_PUBLIC_SITE_URL=https://www.stackflex.app
```

Without `MCP_PORTFOLIO_TOKEN`, `/api/mcp` returns **503**.

`MCP_PORTFOLIO_TOKEN` and `MCP_DRAFT_SECRET` are read only on the server. Never prefix them with `NEXT_PUBLIC_`. Never commit them. Rotate if leaked.

## Local run

```bash
npm install
# add MCP_PORTFOLIO_TOKEN (+ MCP_DRAFT_SECRET) to .env.local
npm run dev
```

MCP URL: `http://localhost:3000/api/mcp`

### Connect Claude (custom connector / remote MCP)

Claude remote connectors call your server from Anthropic’s cloud (public HTTPS required).

**Important — no host redirects:** Claude drops the `Authorization` header when following a redirect to a different host. StackFlex currently 308s `https://stackflex.app` → `https://www.stackflex.app`, so the connector URL **must** be the final host:

`https://www.stackflex.app/api/mcp`

Do **not** register `https://stackflex.app/api/mcp`.

#### Claude.ai / Claude Desktop (remote custom connector)

1. Customize → Connectors → Add custom connector (Team/Enterprise: Owners add under Organization settings).
2. Name: `StackFlex Portfolio`.
3. URL: `https://www.stackflex.app/api/mcp`.
4. Authentication: **No sign in** (static bearer, not OAuth).
5. **Request headers** (beta; may be limited by org):
   - Header name: `Authorization`
   - Value exactly: `Bearer <MCP_PORTFOLIO_TOKEN>` (include the `Bearer ` prefix; Claude does not add it)
6. Add / save, then enable the connector for the conversation.

If your Claude plan/org does not show **Request headers**, static bearer auth cannot be configured in the UI — that is a Claude-side blocker, not a StackFlex code change. Do not work around it by removing auth.

#### Local / Desktop config file (stdio-adjacent clients that support HTTP headers)

```json
{
  "mcpServers": {
    "stackflex-portfolio": {
      "url": "https://www.stackflex.app/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_MCP_PORTFOLIO_TOKEN"
      }
    }
  }
}
```

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector@latest
```

Connect with Streamable HTTP to `http://localhost:3000/api/mcp`, set the Authorization bearer token, list tools, then call `create_portfolio_draft`.

### Minimal tool call payload

```json
{
  "format": "stackflex-portfolio-import-v1",
  "provider": "claude",
  "scope": {
    "contextsUsed": ["This conversation"],
    "inaccessible": ["Full chat history"],
    "limitations": "Could not access older chats."
  },
  "projects": [
    {
      "title": "Weekly research brief",
      "summary": "Built a recurring research workflow that summarizes sources into a brief.",
      "type": "workflow",
      "status": "completed",
      "myContribution": "Designed prompts and reviewed outputs.",
      "aiUse": "Drafted summaries from notes.",
      "tools": ["Claude"],
      "capabilities": ["Research", "Writing"],
      "outcome": "Cut weekly prep time.",
      "evidence": {
        "kind": "discussed_in_conversation",
        "note": "Described in this conversation.",
        "sourceUrl": null
      },
      "needsReview": []
    }
  ]
}
```

The tool returns a `reviewUrl`. Open it, edit projects, then use **Confirm review & download**. That marks the draft reviewed locally and downloads JSON — it does **not** create a public portfolio page.

## Private Vercel deploy (do not skip)

Serverless notes: `mcp-handler` v2 serves **stateless** Streamable HTTP (no Redis). Compatible with Vercel Node serverless / Next.js Route Handlers. `maxDuration = 60` is set on `/api/mcp`.

1. Commit and push the MCP integration to the branch Vercel deploys (today: `main` / `design-v2` as configured for Production).
2. In Vercel → Project `stackflex` → Settings → Environment Variables (Production):
   - `NEXT_PUBLIC_SITE_URL` = `https://www.stackflex.app` (Sensitive/plain; rebuild required after change)
   - `MCP_PORTFOLIO_TOKEN` = long random secret (**Encrypted**, Production only or Preview if you intentionally test there)
   - `MCP_DRAFT_SECRET` = different long random secret (**Encrypted**)
3. Redeploy Production so the new route + env are live.
4. Smoke (from your machine):
   ```bash
   # Must be 401 without token (not 308 to another host, not 404)
   curl -sI https://www.stackflex.app/api/mcp | head
   curl -s https://www.stackflex.app/api/mcp
   # With token: initialize / tools/list via MCP Inspector (Streamable HTTP)
   ```
5. Confirm a draft `reviewUrl` starts with `https://www.stackflex.app/portfolio/review/` and opens as **Private draft / Unpublished**.

Production MCP URL: `https://www.stackflex.app/api/mcp`

## Security model (honest)

| Concern | Current behavior | Required before public multi-user launch |
|---|---|---|
| MCP write access | Shared bearer token | Per-user OAuth (CIMD) + scoped tokens |
| Draft access | Secret signed URL | Authenticated ownership checks |
| Persistence | Signed URL payload | Database / object store with retention + deletion |
| Publish | Explicit UI confirm → download only | Real publish flow with public URLs only after confirm |
| Logging | No project content logged | Keep that guarantee |

## ChatGPT compatibility blockers

- ChatGPT custom GPT / connector MCP support differs from Claude and often requires a production HTTPS endpoint plus a provider-approved OAuth flow.
- Static shared bearer tokens are **not** a ChatGPT-ready multi-tenant auth model.
- Until StackFlex has user accounts + OAuth, ChatGPT should be treated as unsupported for production connectors.

## What this does not include

- GitHub integration
- Custom MCP UI widgets
- Landing page redesign
- Automatic publication
- Conversation history storage
- Changes to the existing paste-based JSON import experiment (`/experiments/ai-portfolio`)
