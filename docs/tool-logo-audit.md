# Tool logo audit

Generated from the live StackFlex catalog via `src/lib/catalog/logoAudit.ts`.
Review visually at [`/dev/tool-logos`](http://localhost:3000/dev/tool-logos) (development only).

## Summary

| Metric | Count |
|--------|------:|
| Catalog tools audited | 103 |
| Verified official | 12 |
| Verified maintained library | 82 |
| Parent-brand fallback | 7 |
| Monogram fallback | 2 |
| Missing | 0 |
| Needs review | 0 |

**Verified logos (official + library + parent-brand):** 101

## Recently fixed / upgraded

| Tool | ID | Change |
|------|----|--------|
| OpenClaw | `openclaw` | Official lobster mark from [openclaw/openclaw](https://github.com/openclaw/openclaw) `apps/linux/src-tauri/icons/icon.svg` |
| Hermes Agent | `hermes-agent` | Official desktop artwork from [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) installer assets |
| Salesforce Agentforce | `salesforce-agentforce` | Parent-brand Salesforce cloud (Agentforce-specific mark not freely redistributable); replaces `Af` monogram |
| Claude Code | `claude-code` | Confirmed Claude Code–specific mark via LOGO_ASSETS `claudecode` (lobehub / code.claude.com alignment) |
| Canva Magic Studio | `canva-ai` | Canva parent mark (historical Simple Icons path, teal fill) |
| Slack AI | `slack-ai` | Slack 2019 hashmark (slug existed but was missing from the icon registry) |
| Adobe Premiere Pro | `premiere-pro` | Adobe parent mark |
| Fathom | `fathom` | Simple Icons `fathom` |
| HubSpot Breeze | `hubspot-breeze` | Already using HubSpot Simple Icons mark (parent brand) — verified |
| Z.ai | `glm-chat` | Official mark from [chat.z.ai](https://chat.z.ai) CDN (`z-cdn.chatglm.cn/.../logo.svg`) |
| HeyGen | `heygen` | Symbol from official [HeyGen brand kit](https://www.heygen.com/brand-kit) |
| Descript | `descript` | Official 2026 red mark from [descript.com](https://www.descript.com) favicon SVG |
| OpusClip | `opusclip` | Avatar_B from official [OpusClip media kit](https://media.opus.pro/) |
| Synthesia | `synthesia` | Official site webclip mark from [synthesia.io](https://www.synthesia.io/newsroom) |
| Granola | `granola` | Official 2026 spiral from [granola.ai](https://www.granola.ai) favicon SVG |
| Elicit | `elicit` | Official apple-touch icon from [elicit.com](https://elicit.com) |
| Otter.ai | `otter` | Symbol from official [Otter media kit](https://otter.ai/media-kit) blue-vertical SVG |
| Fireflies.ai | `fireflies` | Official site icon from [fireflies.ai](https://fireflies.ai/icon.png) |
| llama.cpp | `llama-cpp` | Current icon from [ggml-org/llama.brand](https://github.com/ggml-org/llama.brand) (CC BY-NC + identification grant) |
| Klaviyo AI | `klaviyo-ai` | Parent-brand Klaviyo mark from [klaviyo.com](https://www.klaviyo.com) icons |
| Gong AI | `gong-ai` | Parent-brand Gong mark from [gong.io](https://www.gong.io) favicon SVG |
| Gorgias AI | `gorgias-ai` | Parent-brand Gorgias symbol from official style ZIP |
| Productboard AI | `productboard-ai` | Parent-brand vessel mark from [productboard.com media kit](https://www.productboard.com/media-kit/) |

## Unresolved / monogram fallbacks

These still need official or library marks:

- **Gamma** (`gamma`) — Renders monogram “Ga”. No verified mark in Simple Icons or LOGO_ASSETS.
- **Jasper** (`jasper`) — Renders monogram “Ja”. No verified mark in Simple Icons or LOGO_ASSETS.

### Deferred (no suitable compact verified mark yet)

- **Jasper** (`jasper`) — Official brand kit only publishes wide wordmarks; site favicon is a low-res “j” monogram, not suitable for tool chips.
- **Gamma** (`gamma`) — Only a 32×32 favicon “G” was obtainable from gamma.app without third-party directories; left as monogram rather than upscaling unverified artwork.

## Full catalog

| Tool | ID | Logo source | Status | Notes |
|------|----|-------------|--------|-------|
| ChatGPT | `chatgpt` | LOGO_ASSETS:openai.svg | Verified maintained library | Embedded SVG/PNG asset |
| Claude | `claude` | Simple Icons (claude) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Gemini | `gemini` | LOGO_ASSETS:gemini-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Perplexity | `perplexity` | Simple Icons (perplexity) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Microsoft Copilot | `copilot` | LOGO_ASSETS:copilot-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Grok | `grok` | LOGO_ASSETS:grok.svg | Verified maintained library | Embedded SVG/PNG asset |
| Meta AI | `meta-ai` | Simple Icons (metaai) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| DeepSeek | `deepseek-chat` | Simple Icons (deepseek) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Le Chat | `le-chat` | Simple Icons (mistralai) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Kimi | `kimi` | Simple Icons (kimi) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Qwen Chat | `qwen-chat` | Simple Icons (qwen) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Z.ai | `glm-chat` | https://z-cdn.chatglm.cn/z-ai/static/logo.svg (official Z.ai / chat.z.ai favicon) | Verified official | Trademark of Zhipu AI / Z.ai. Used for product identification only. |
| Poe | `poe` | Simple Icons (poe) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Cursor | `cursor` | Simple Icons (cursor) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Claude Code | `claude-code` | https://github.com/lobehub/lobe-icons (claudecode-color.svg); mark aligns with code.claude.com branding | Verified maintained library | MIT (lobehub/lobe-icons); Anthropic trademark. |
| GitHub Copilot | `github-copilot` | Simple Icons (githubcopilot) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Codex | `codex` | LOGO_ASSETS:codex-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Lovable | `lovable` | LOGO_ASSETS:lovable-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Windsurf | `windsurf` | Simple Icons (windsurf) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Replit | `replit` | Simple Icons (replit) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| v0 | `v0` | Simple Icons (v0) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Bolt.new | `bolt` | Simple Icons (stackblitz) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Gemini CLI | `gemini-cli` | Simple Icons (googlegemini) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Zed | `zed` | Simple Icons (zedindustries) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Cline | `cline` | Simple Icons (cline) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| OpenCode | `opencode` | Simple Icons (opencode) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| JetBrains AI | `jetbrains-ai` | Simple Icons (jetbrains) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Warp | `warp` | Simple Icons (warp) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Claude Design | `claude-design` | Simple Icons (claude) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Midjourney | `midjourney` | LOGO_ASSETS:midjourney.svg | Verified maintained library | Embedded SVG/PNG asset |
| Runway | `runway` | LOGO_ASSETS:runway.svg | Verified maintained library | Embedded SVG/PNG asset |
| ElevenLabs | `elevenlabs` | Simple Icons (elevenlabs) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Suno | `suno` | Simple Icons (suno) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Adobe Firefly | `firefly` | LOGO_ASSETS:adobefirefly-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Sora | `sora` | LOGO_ASSETS:sora-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Veo | `veo` | Simple Icons (google) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Krea | `krea` | LOGO_ASSETS:krea.svg | Verified maintained library | Embedded SVG/PNG asset |
| Ideogram | `ideogram` | LOGO_ASSETS:ideogram.svg | Verified maintained library | Embedded SVG/PNG asset |
| Stable Diffusion | `stable-diffusion` | LOGO_ASSETS:stability-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Kling | `kling` | LOGO_ASSETS:kling-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| HeyGen | `heygen` | https://www.heygen.com/brand-kit (heygen-symbol-blue from official brand kit ZIP) | Verified official | Trademark of HeyGen. Used for product identification only. |
| Canva Magic Studio | `canva-ai` | https://github.com/simple-icons/simple-icons/blob/11.14.0/icons/canva.svg | Verified maintained library | CC0 Simple Icons path; Canva trademark. |
| Figma Make | `figma-make` | LOGO_ASSETS:figma-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Figma AI | `figma-ai` | LOGO_ASSETS:figma-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| CapCut | `capcut` | LOGO_ASSETS:capcut.svg | Verified maintained library | Embedded SVG/PNG asset |
| Descript | `descript` | https://static-cdn.descript.com/web/icons/favicon.svg (official Descript site; 2026 red mark) | Verified official | Trademark of Descript. Used for product identification only. |
| OpusClip | `opusclip` | https://media.opus.pro/ (Avatar_B from official OpusClip media kit) | Verified official | Trademark of OpusClip. Used for product identification only. |
| VEED | `veed` | Simple Icons (veed) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Synthesia | `synthesia` | https://www.synthesia.io/newsroom (official site apple-touch / webclip mark) | Verified official | Trademark of Synthesia. Used for product identification only. |
| Adobe Premiere Pro | `premiere-pro` | https://github.com/lobehub/lobe-icons (@lobehub/icons-static-svg 1.95.1) | Parent-brand fallback | MIT (lobehub/lobe-icons); Adobe trademark. |
| n8n | `n8n` | Simple Icons (n8n) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Zapier | `zapier` | Simple Icons (zapier) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Make | `make` | Simple Icons (make) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| LangChain | `langchain` | Simple Icons (langchain) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| CrewAI | `crewai` | Simple Icons (crewai) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Dify | `dify` | Simple Icons (dify) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Langflow | `langflow` | Simple Icons (langflow) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| MCP | `mcp` | Simple Icons (modelcontextprotocol) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| OpenAI Agents SDK | `openai-agents` | LOGO_ASSETS:openai.svg | Verified maintained library | Embedded SVG/PNG asset |
| IFTTT | `ifttt` | Simple Icons (ifttt) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| NotebookLM | `notebooklm` | Simple Icons (notebooklm) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Notion AI | `notion-ai` | Simple Icons (notion) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Granola | `granola` | https://www.granola.ai/favicon/favicon.svg (official Granola site; 2026 spiral mark) | Verified official | Trademark of Granola. Used for product identification only. |
| DeepL | `deepl` | Simple Icons (deepl) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Elicit | `elicit` | https://elicit.com (official apple-touch-icon for elicit.com research product) | Verified official | Trademark of Elicit. Used for product identification only. |
| Gamma | `gamma` | no iconSlug / provider icon | Monogram fallback | Renders monogram “Ga”. No verified mark in Simple Icons or LOGO_ASSETS. |
| Grammarly | `grammarly` | Simple Icons (grammarly) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Raycast AI | `raycast-ai` | Simple Icons (raycast) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Kagi Assistant | `kagi` | Simple Icons (kagi) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Otter.ai | `otter` | https://otter.ai/media-kit (symbol extracted from official blue-vertical.svg) | Verified official | Trademark of Otter.ai. Used for product identification only. |
| Fathom | `fathom` | Simple Icons (fathom) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Fireflies.ai | `fireflies` | https://fireflies.ai/icon.png (official Fireflies.ai site icon) | Verified official | Trademark of Fireflies.ai. Used for product identification only. |
| Ollama | `ollama` | Simple Icons (ollama) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| LM Studio | `lm-studio` | Simple Icons (lmstudio) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Hugging Face | `hugging-face` | Simple Icons (huggingface) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| OpenRouter | `openrouter` | Simple Icons (openrouter) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| vLLM | `vllm` | Simple Icons (vllm) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| llama.cpp | `llama-cpp` | https://github.com/ggml-org/llama.brand/blob/master/logo/svg/icon/icon-light-bg.svg | Verified official | CC BY-NC 4.0 with ggml-org commercial identification grant (BRAND-USAGE.md). Trademark of ggml-org. |
| Open WebUI | `open-webui` | LOGO_ASSETS:openwebui.svg | Verified maintained library | Embedded SVG/PNG asset |
| Groq | `groq` | LOGO_ASSETS:groq.svg | Verified maintained library | Embedded SVG/PNG asset |
| Together AI | `together` | LOGO_ASSETS:together-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Replicate | `replicate` | Simple Icons (replicate) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Modal | `modal` | Simple Icons (modal) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| NVIDIA NIM | `nvidia-nim` | Simple Icons (nvidia) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Workers AI | `workers-ai` | Simple Icons (cloudflare) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Amazon Bedrock | `bedrock` | LOGO_ASSETS:bedrock-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| HubSpot Breeze | `hubspot-breeze` | Simple Icons (hubspot) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Klaviyo AI | `klaviyo-ai` | https://www.klaviyo.com/icons/icon-256x256.png (official Klaviyo site; parent-brand for Klaviyo AI) | Parent-brand fallback | Trademark of Klaviyo. Used for product identification only. |
| Jasper | `jasper` | no iconSlug / provider icon | Monogram fallback | Renders monogram “Ja”. No verified mark in Simple Icons or LOGO_ASSETS. |
| Salesforce Agentforce | `salesforce-agentforce` | Salesforce brand cloud mark (parent-brand fallback for Agentforce) | Parent-brand fallback | Trademark of Salesforce, Inc. Used for product identification only. |
| Gong AI | `gong-ai` | https://www.gong.io/marketing-assets/favicon.svg (official Gong site; parent-brand for Gong AI) | Parent-brand fallback | Trademark of Gong. Used for product identification only. |
| Shopify Sidekick | `shopify-sidekick` | Simple Icons (shopify) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Gorgias AI | `gorgias-ai` | https://www.gorgias.com/about-us/style (Symbol - Dark from official brand asset ZIP; parent-brand for Gorgias AI) | Parent-brand fallback | Trademark of Gorgias. Used for product identification only. |
| Atlassian Rovo | `atlassian-rovo` | Simple Icons (atlassian) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Productboard AI | `productboard-ai` | https://www.productboard.com/media-kit/ (official vessel logomark; parent-brand for Productboard AI) | Parent-brand fallback | Trademark of Productboard. Used for product identification only. |
| Asana AI Studio | `asana-ai` | Simple Icons (asana) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Microsoft 365 Copilot | `m365-copilot` | LOGO_ASSETS:copilot-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| Intercom Fin | `intercom-fin` | Simple Icons (intercom) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Slack AI | `slack-ai` | https://commons.wikimedia.org/wiki/File:Slack_icon_2019.svg | Parent-brand fallback | Trademark of Salesforce/Slack. Used for product identification only. |
| Zoom AI Companion | `zoom-ai` | Simple Icons (zoom) | Verified maintained library | CC0 Simple Icons path; brand trademark of the respective owner. |
| Gemini for Google Workspace | `gemini-workspace` | LOGO_ASSETS:gemini-color.svg | Verified maintained library | Embedded SVG/PNG asset |
| OpenClaw | `openclaw` | https://github.com/openclaw/openclaw/blob/main/apps/linux/src-tauri/icons/icon.svg | Verified official | Official OpenClaw application icon (repository asset) |
| Hermes Agent | `hermes-agent` | https://github.com/NousResearch/hermes-agent/blob/main/apps/bootstrap-installer/src-tauri/icons/icon.icon/Assets/art-light.png | Verified official | Official Hermes Agent desktop artwork (repository asset) |

## Trademark note

All third-party logos remain trademarks of their respective owners. StackFlex embeds them only for product identification in user-generated stack profiles. Do not treat embedded assets as a grant of brand usage rights beyond that context.
