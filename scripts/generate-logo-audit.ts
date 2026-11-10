import { writeFileSync } from "fs";
import { auditAllToolLogos, auditSummary } from "../src/lib/catalog/logoAudit";

const rows = auditAllToolLogos();
const { total, counts } = auditSummary(rows);
const mono = rows.filter((r) => r.status === "Monogram fallback");

const lines: string[] = [
  "# Tool logo audit",
  "",
  "Generated from the live StackFlex catalog via `src/lib/catalog/logoAudit.ts`.",
  "Review visually at [`/dev/tool-logos`](http://localhost:3000/dev/tool-logos) (development only).",
  "",
  "## Summary",
  "",
  "| Metric | Count |",
  "|--------|------:|",
  `| Catalog tools audited | ${total} |`,
  `| Verified official | ${counts["Verified official"]} |`,
  `| Verified maintained library | ${counts["Verified maintained library"]} |`,
  `| Parent-brand fallback | ${counts["Parent-brand fallback"]} |`,
  `| Monogram fallback | ${counts["Monogram fallback"]} |`,
  `| Missing | ${counts["Missing"]} |`,
  `| Needs review | ${counts["Needs review"]} |`,
  "",
  `**Verified logos (official + library + parent-brand):** ${
    counts["Verified official"] + counts["Verified maintained library"] + counts["Parent-brand fallback"]
  }`,
  "",
  "## Recently fixed / upgraded",
  "",
  "| Tool | ID | Change |",
  "|------|----|--------|",
  "| OpenClaw | `openclaw` | Official lobster mark from [openclaw/openclaw](https://github.com/openclaw/openclaw) `apps/linux/src-tauri/icons/icon.svg` |",
  "| Hermes Agent | `hermes-agent` | Official desktop artwork from [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) installer assets |",
  "| Salesforce Agentforce | `salesforce-agentforce` | Parent-brand Salesforce cloud (Agentforce-specific mark not freely redistributable); replaces `Af` monogram |",
  "| Claude Code | `claude-code` | Confirmed Claude Code–specific mark via LOGO_ASSETS `claudecode` (lobehub / code.claude.com alignment) |",
  "| Canva Magic Studio | `canva-ai` | Canva parent mark (historical Simple Icons path, teal fill) |",
  "| Slack AI | `slack-ai` | Slack 2019 hashmark (slug existed but was missing from the icon registry) |",
  "| Adobe Premiere Pro | `premiere-pro` | Adobe parent mark |",
  "| Fathom | `fathom` | Simple Icons `fathom` |",
  "| HubSpot Breeze | `hubspot-breeze` | Already using HubSpot Simple Icons mark (parent brand) — verified |",
  "| Z.ai | `glm-chat` | Official mark from [chat.z.ai](https://chat.z.ai) CDN (`z-cdn.chatglm.cn/.../logo.svg`) |",
  "| HeyGen | `heygen` | Symbol from official [HeyGen brand kit](https://www.heygen.com/brand-kit) |",
  "| Descript | `descript` | Official 2026 red mark from [descript.com](https://www.descript.com) favicon SVG |",
  "| OpusClip | `opusclip` | Avatar_B from official [OpusClip media kit](https://media.opus.pro/) |",
  "| Synthesia | `synthesia` | Official site webclip mark from [synthesia.io](https://www.synthesia.io/newsroom) |",
  "| Granola | `granola` | Official 2026 spiral from [granola.ai](https://www.granola.ai) favicon SVG |",
  "| Elicit | `elicit` | Official apple-touch icon from [elicit.com](https://elicit.com) |",
  "| Otter.ai | `otter` | Symbol from official [Otter media kit](https://otter.ai/media-kit) blue-vertical SVG |",
  "| Fireflies.ai | `fireflies` | Official site icon from [fireflies.ai](https://fireflies.ai/icon.png) |",
  "| llama.cpp | `llama-cpp` | Current icon from [ggml-org/llama.brand](https://github.com/ggml-org/llama.brand) (CC BY-NC + identification grant) |",
  "| Klaviyo AI | `klaviyo-ai` | Parent-brand Klaviyo mark from [klaviyo.com](https://www.klaviyo.com) icons |",
  "| Gong AI | `gong-ai` | Parent-brand Gong mark from [gong.io](https://www.gong.io) favicon SVG |",
  "| Gorgias AI | `gorgias-ai` | Parent-brand Gorgias symbol from official style ZIP |",
  "| Productboard AI | `productboard-ai` | Parent-brand vessel mark from [productboard.com media kit](https://www.productboard.com/media-kit/) |",
  "",
  "## Unresolved / monogram fallbacks",
  "",
  "These still need official or library marks:",
  "",
  ...(mono.length
    ? mono.map((r) => `- **${r.name}** (\`${r.id}\`) — ${r.notes}`)
    : ["- None."]),
  "",
  "### Deferred (no suitable compact verified mark yet)",
  "",
  "- **Jasper** (`jasper`) — Official brand kit only publishes wide wordmarks; site favicon is a low-res “j” monogram, not suitable for tool chips.",
  "- **Gamma** (`gamma`) — Only a 32×32 favicon “G” was obtainable from gamma.app without third-party directories; left as monogram rather than upscaling unverified artwork.",
  "",
  "## Full catalog",
  "",
  "| Tool | ID | Logo source | Status | Notes |",
  "|------|----|-------------|--------|-------|",
  ...rows.map((r) => {
    const src = r.source.replace(/\|/g, "\\|");
    const notes = r.notes.replace(/\|/g, "\\|").replace(/\n/g, " ");
    return `| ${r.name} | \`${r.id}\` | ${src} | ${r.status} | ${notes} |`;
  }),
  "",
  "## Trademark note",
  "",
  "All third-party logos remain trademarks of their respective owners. StackFlex embeds them only for product identification in user-generated stack profiles. Do not treat embedded assets as a grant of brand usage rights beyond that context.",
  "",
];

writeFileSync("docs/tool-logo-audit.md", lines.join("\n"));
console.log(`Wrote docs/tool-logo-audit.md (${total} tools)`);
console.log(counts);
