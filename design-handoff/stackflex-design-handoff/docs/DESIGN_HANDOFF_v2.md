# StackFlex design handoff v2

This package carries the latest approved StackFlex design into an **existing** Next.js / React / Tailwind app. What changed since v1 is listed in `CHANGELOG.md`. Export rules are in `EXPORT_SPEC.md`.

**Approved sources**
- Cards: `reference/source/StackFlex Card System.dc.html`, section 0.
- Results: `StackFlex Results v2.dc.html`, section 6.
- Landing: `StackFlex Bright Future.dc.html` 1a, plus the background from `StackFlex Landing Backgrounds.dc.html` 2b.
- Questionnaire: `StackFlex Bright Future.dc.html` 1b.
- Every other section in those files is an earlier exploration. Don't implement them.

## 1. Package

```
stackflex-design-handoff-v2/
├─ DESIGN_HANDOFF.md      this file
├─ CHANGELOG.md           v1 → v2, props migrations, open items
├─ EXPORT_SPEC.md         export formats, themes, rendering rules
├─ reference/
│  ├─ cards/              final card renders (source of truth for card appearance)
│  │  01-collection-150px · 02-results-panel-92px · 03-three-tool-stack · 04-social-card
│  │  05-linkedin-banner · 06-tool-counts-1-to-6 · 07-card-spec
│  ├─ screens/            approved layouts (cards inside them are the previous style; see CHANGELOG open item 1)
│  │  01-landing · 02-questionnaire · 03-results-top · 04-results-scrolled · 05-results-social-closeup · 06-results-mobile
│  └─ source/             design files (open in a browser; keep support.js next to them)
└─ cursor/
   ├─ tailwind.stackflex.preset.js           Tailwind v3 only
   ├─ public/stackflex/mark.svg, mark-dark.svg
   └─ src/
      ├─ styles/stackflex.css                tokens (Tailwind v4 @theme) + base
      ├─ styles/stackflex-card.css           THE card (all sizes)
      ├─ lib/stackflex/fonts.ts              Funnel Display + Funnel Sans (next/font)
      ├─ lib/stackflex/tools.ts              Tool type, cardColors(), categoryLabel(), logoFor(), stackHeadline()
      ├─ lib/stackflex/demo.ts               example stack (landing only) + example Build options
      └─ components/stackflex/
         ├─ StackCard.tsx      StackCard + StackChip     (single card implementation)
         ├─ StackBoard.tsx     grid / row / tray layouts
         ├─ ShareArt.tsx       SocialCardArt, BannerArt  (export artwork)
         ├─ Brand.tsx          Mark, Wordmark
         ├─ Controls.tsx       PrimaryButton, SecondaryButton, TextButton, TextAction, ModelPill, StepIndicator,
         │                     ToolOption, MoreToolsOption, ThemeSwitch, LinkedInIcon, XIcon
         ├─ LandingScreen.tsx
         ├─ QuestionnaireScreen.tsx
         └─ ResultsScreen.tsx
```

## 2. Card system (final)

**One rule:** Main = expressive holographic. Secondary = calm pearl with a subtle tool accent. All cards in a stack are the same size. Any tool can be Main (the first in the stack); Main is a material, never a size or a color.

**Card**
- Square, `aspect-ratio: 1`, `container-type: inline-size`. Every value scales with the card width (`cqw`).
- Radius `clamp(12px,13cqw,30px)`, 1px border `#ECEAE4`, padding `clamp(8px,7.5cqw,16px)`.

**Secondary surface**
- Pearl: `linear-gradient(165deg,#FFFFFF 0%,#F7F5F1 60%,#F0EDE7 100%)`.
- Tool wash: `linear-gradient(180deg, transparent 32%, aura+42)`.
- Reflection: 118°, white .35, fringes .05.

**Main surface**
- Pearl, plus a top tint `aura+38` fading out by 40%. Border `aura+66`. Shadow `0 16px 34px -22px rgba(60,40,140,.38)`.
- Foil: `conic-gradient(from 210deg at 62% 38%, …)`, multiply, opacity .55.
- Glow: `radial-gradient(95% 70% at 15% 100%, aura+80, transparent 72%)`.
- Reflections: 118° white .9 with fringes .28, plus a second streak .55.
- Indicator: blue `#3A2EFF` ✦ badge on the logo circle, top right. Size `clamp(13px,10cqw,22px)`, with a 2px white ring.

**Category header (every card, every size)**
- Centered band, height `clamp(20px,13.3cqw,27.6px)`.
- Background white .7 (.28 on Main), 1px bottom line.
- Type: Funnel Sans 600, `clamp(9px,5.8cqw,12px)`, uppercase, +0.14em (+0.10em compact).

**Logo circle:** `34cqw` (32cqw compact), white, ring `clamp(2.5px,2.5cqw,5px)` in `aura+99`. Logo at 50% (54% compact).

**Type**
- Name: Funnel Display 600, `clamp(12.5px,10.5cqw,24px)`, −0.025em.
- Version: Funnel Sans 500, `clamp(10.5px,7.8cqw,15px)`, `#55534D`. The line is always reserved.

**Compact (<120px):** proportions only; nothing is hidden. Never render a card under 88px on screen; use `StackChip` instead (logo circle, name, CATEGORY).

**Tool accents (`aura`)**

| Tool | Accent |
|---|---|
| Claude | `#E08A66` |
| Cursor | `#8F9BB3` |
| Claude Code | `#E5A36A` |
| n8n | `#EE8AA3` |
| Midjourney | `#A79BD6` |
| Ollama | `#A3B8AE` |

For new tools: take the brand hue at about OKLCH L 0.74 / C 0.10. Monochrome brands use C 0.03 and a cool hue. Store the value with the tool, never compute it at runtime.

**Layouts (`StackBoard`)**
- `grid`: 1 tool = one card at 64% width · 2–4 = 2 columns · 5–6 = 3 columns · last row centered.
- `row`: banners.
- `tray`: questionnaire, 88px cards plus a "+" tile.
- More than 6 tools: show the first 6, and show "+N" in the tray.

Measured card sizes: Results panel 184 / 141 / 92px (1 / 2–4 / 5–6 tools) · social card preview 104px · LinkedIn banner at 804px display 92px.

## 3. Other tokens (unchanged from v1)

**Colors**

| Token | Value |
|---|---|
| ink | `#0B0B0C` |
| ultramarine (action, selection) | `#3A2EFF` |
| lime (checks, arrow coin) | `#D7FF3A` |
| paper (panels) | `#FAF9F6` |
| chip | `#F4F3EF` |
| line | `#ECEAE4` |
| hairline divider | `#EEECE6` |
| body | `#55534D` |
| muted | `#6F6D66` |
| subtle | `#8C897F` |
| faint | `#A8A59C` |
| LinkedIn | `#0A66C2` |

**Type**
- Funnel Display for headlines and card names; Funnel Sans for the UI (Google Fonts, OFL).
- Landing H1 116/0.92 −0.055em · Question 80/1 −0.05em · Results "Share it" 32 · format titles 26 · panel title 22.

**Breakpoints:** Tailwind defaults. Desktop composition from `lg` (1024).

## 4. Screens

**Results (section 6)**
- Desktop:
  - Grid `320px | 1fr`, gap 48, page padding 64.
  - The panel is `sticky; top:24px`, on `#FAF9F6`, radius 24, padding 16.
  - The right column has a 1px `#EEECE6` left border, padding-left 60, max-width 820.
- Each format follows the same order: title (and size) → Theme switch → preview → one black primary "Download image" → quiet text actions.
- **Social card:** a 400px preview with controls in a column beside it. Below `md` they stack.
- Mobile (<1024):
  - Stacked, with no sticky behavior.
  - Social actions sit in a 2-column grid.
  - The Download button takes the full width on banners.

**Landing:** unchanged composition, plus the approved grid background. The example stack comes from `demo.ts` on purpose.

**Questionnaire:** unchanged, except the live tray is now a row of 88px equal cards.

## 5. Integrating into the existing app

Your app already has: the landing page, questionnaire, tool selection, model/version customization, results, the stack editor, export generation and localStorage persistence. **Keep all logic and state.** Replace visuals only.

**Use directly (copy)**
- `stackflex-card.css`, `stackflex.css`, `fonts.ts`
- `StackCard.tsx`, `StackBoard.tsx`, `ShareArt.tsx`, `Brand.tsx`
- `public/stackflex/*`

**Merge (keep yours, take the new parts)**
- `tools.ts`: add `cardColors`, `categoryLabel`, the `aura` field and the six accents to **your** tool catalog. Don't replace your types. Map your category ids to the six short labels.
- `Controls.tsx`: add `ThemeSwitch`, `TextAction`, `LinkedInIcon`, `XIcon`, and the `size="sm"`/`icon` options on `PrimaryButton`.

**Adapt (use as a visual reference; wire to your existing state)**
- `ResultsScreen.tsx`:
  - Port the layout and sections into your results page.
  - Connect `onDownload`, `onCopy`, `onShareDevice`, `onPost`, `onOpenProfile` and `onAddTool`/`onEditStack` to your existing export, share and editor code.
  - Persist the per-format theme with your localStorage layer.
- `QuestionnaireScreen.tsx`: only replace your live-stack preview with `<StackBoard layout="tray">`. Keep your steps, selection and model logic.
- `LandingScreen.tsx`: add the grid background layer, and make your hero use `SocialCardArt` / `BannerArt`.

**Single card rule.** Search the app for any other card or tile used to show a tool in a stack (results, questionnaire, editor, exports, previews). Replace every one with `StackCard`, and remove the old implementations.

**Exports.** Render images from `SocialCardArt` / `BannerArt` / `StackCard` with a real browser at the exact sizes in `EXPORT_SPEC.md`. If your current pipeline uses Satori/`@vercel/og` or canvas drawing, it must change: the foil needs `conic-gradient`, `mix-blend-mode` and container queries. Wait for `document.fonts.ready` and logo images before capturing.

## 6. Validation status

**Checked in the design files**
- Card renders at 150 / 141 / 104 / 92px.
- 1–6 tool layouts (`reference/cards/06`).
- Main foil on Claude (the code applies it to whatever tool is first).
- Category header present on every card.
- The names "Claude Code" and "Midjourney" fit at 92px.

**Checked in the code by reading it**
- No remaining `square`/`banner` layouts, `variant`, `tintDark`/`haloDark` or 2×2 Main cell.
- All screens and exports render cards through `StackCard`.
- No demo data in the Results or Questionnaire components.

**Not checked**
- The TypeScript has not been compiled and nothing has run in Next.js or a browser.
- The X header has not been checked at real size.
- Exports have not been rendered with Playwright.
- Expect small fixes.

## 7. Cursor Agent prompt

```
Read docs/design/DESIGN_HANDOFF.md, docs/design/CHANGELOG.md and docs/design/EXPORT_SPEC.md, then the files in src/components/stackflex, src/lib/stackflex and src/styles from the handoff.

Goal: apply StackFlex design v2 to our EXISTING app without losing any functionality (landing, questionnaire, tool selection, model/version editing, results, stack editor, export generation, localStorage persistence).

1. Add stackflex-card.css (import it in globals.css after stackflex.css). Add StackCard.tsx, StackBoard.tsx, ShareArt.tsx and Brand.tsx as shared components.
2. Merge tools.ts into our tool model: add the aura field (use the 6 accent values given; for other tools, propose a curated value following the rule in §2 and list them for me), cardColors() and categoryLabel(). Map our categories to DAILY/BUILD/CREATE/AUTOMATE/RESEARCH/LOCAL.
3. Find EVERY component that renders a tool card or tile in a stack (results, questionnaire preview, editor, exports, landing) and replace it with StackCard / StackBoard. Delete the old card implementations. The first tool in the stack is main.
4. Results: rework our results page to match ResultsScreen.tsx and reference/screens/03–06: 320px sticky panel on the left (desktop only), one column of formats on the right, a ThemeSwitch per image format, one primary Download button per format, quiet text actions. Wire everything to our existing export, copy and share functions and our localStorage. Don't add automatic image attachment for LinkedIn/X.
5. Questionnaire: replace only the live stack preview with <StackBoard layout="tray">. Landing: add the grid background and make sure the hero uses SocialCardArt/BannerArt.
6. Exports: produce the images from SocialCardArt/BannerArt/StackCard with our browser rendering pipeline at the sizes in EXPORT_SPEC.md (Light/Dark/Mono). If we use Satori or canvas, tell me before changing it.
7. Don't change any other page, route, state or behavior. Then run the build and the type check, and give me the list of modified files and anything that remains unclear.
```

## 8. Next steps in Cursor

1. In your project, copy `cursor/src/styles/*`, `cursor/src/components/stackflex/*`, `cursor/src/lib/stackflex/*` and `cursor/public/stackflex/*`. If any of these files already exist in your project, let Cursor merge them; don't overwrite them blindly.
2. Copy `DESIGN_HANDOFF.md`, `CHANGELOG.md`, `EXPORT_SPEC.md` and `reference/` into `docs/design/`.
3. Paste the prompt from §7 into Cursor Agent.
4. Check visually against `reference/cards/` and `reference/screens/`.
