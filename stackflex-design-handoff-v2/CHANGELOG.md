# CHANGELOG: StackFlex design handoff v1 → v2

v1 = `design_handoff_stackflex/` (first export: Bright Future screens, 2×2 Main board).
v2 = this package (final card system, latest Results layout, landing background).

Legend: **Props migration** = Cursor must update call sites. **Data** = new data required.

---

## 1. AI Stack card: new component (breaking)

**What changed visually**
- All cards in a stack are the same size; the oversized 2×2 Main card is gone.
- **Main card:** pearl base with:
  - a multicolor holographic foil (conic gradient, multiply blend, .55)
  - a tool-color top tint (22%)
  - a large tool-color corner glow (50%)
  - a tool-color border (40%)
  - two bright reflection streaks
  - a blue ✦ badge on the logo circle
- **Secondary cards:**
  - Pearl off-white base, with the tool color as a wash rising from 32% of the height (≈26%).
  - The logo ring is in the tool color at 60%.
  - The reflection streak is barely visible (.35).
- **Category label:** a centered header band at the top of **every** card, at every size. In v1 the label was a top-left pill and was hidden on small cards.
- The Main indicator moved from the "Main" text (top right) to the ✦ badge on the logo circle.
- **Compact cards (under 120px):** same content with tuned proportions. Minimum on-screen size is 88px.
- The dark card variant was removed. Dark export backgrounds now use the same light cards.
- Tool accent colors were re-curated (see tokens).

**Components:** `StackCard.tsx` rewritten. New `StackChip` (inside StackCard.tsx) for anything under 88px.

**CSS / tokens**
- New `src/styles/stackflex-card.css`. It holds all card styling and sizes from the card's width (`cqw`, container queries).
- `tools.ts → cardColors()` now returns `tint (+42) · ring (+99) · glow (+80) · top (+38) · edge (+66)`. v1 returned `tint · halo · tintDark · haloDark`.
- New `categoryLabel()` maps long category names to DAILY / BUILD / CREATE / AUTOMATE / RESEARCH / LOCAL.
- Tool `aura` values changed:

| Tool | v1 | v2 |
|---|---|---|
| Claude | `#FF8A5B` | `#E08A66` |
| Cursor | `#6C7BFF` | `#8F9BB3` |
| Claude Code | `#FFB06B` | `#E5A36A` |
| n8n | `#FF5C8A` | `#EE8AA3` |
| Midjourney | `#A88BFF` | `#A79BD6` |
| Ollama | `#3FCB91` | `#A3B8AE` |

**Props migration: yes.** `variant`, `theme`, `showCategory`, `showVersion`, `showMainLabel` and `fill` were removed. The new API is `<StackCard tool main? highlight? className? style? />`. Size comes from the parent width only.

**Data:** every tool needs `category` and a curated `aura`. `version` stays optional.

## 2. Stack layouts (breaking)

**What changed visually**
- `grid`: 1 tool = one card at 64% width · 2–4 tools = 2 columns · 5–6 tools = 3 columns · incomplete rows centered.
- `row`: banners, equal cards in one row.
- `tray`: questionnaire, 88px cards in one row, numbered empty slots, "+" tile.

**Components:** `StackBoard.tsx` rewritten.

**Props migration: yes.** Layout `square` → `grid` and `banner` → `row`. `theme` was removed. `gap` is now a CSS length string. New helper: `columnsFor(n)`.

## 3. Export artwork

**What changed visually**
- Social card: equal grid at 82% width, StackFlex mark bottom right.
- Banners: one row of cards starting at 23.4% of the width, clear of the profile photo.
- Light / Dark / Mono themes on all three images (Mono = grayscale).

**Components:** `ShareArt.tsx`. `SocialCardArt` and `BannerArt` take `theme: "light" | "dark" | "mono"`.

**Props migration:** add `theme` where you render them. `BannerArt` also accepts `mono`.

**Rendering pipeline:** must support `conic-gradient`, `mix-blend-mode`, container queries and `filter`. Use a real browser (Playwright/Puppeteer, or `html-to-image`); Satori/`@vercel/og` are not supported. See `EXPORT_SPEC.md`.

## 4. Results page (layout change)

**What changed visually**
- **Left panel:** "My AI stack" is a 320px, **sticky** panel (top 24px, desktop only), on warm white, with the equal grid plus "+ Add tool" and "Edit stack".
- **Divider:** a hairline separates the panel from the sharing workspace.
- **Right column:** one 820px column of sections separated by hairlines, with no nested gray boxes. Order: Social card → LinkedIn banner → X header → Badges → Text.
- **Social card:**
  - It shows the actual export image (400px), with no LinkedIn post mock by default.
  - Controls sit beside it: Theme switch, "Download image", then quiet text actions (Copy caption · Share via device · Post on LinkedIn · Post on X) and a one-line note that posting opens a new tab.
  - "Preview on LinkedIn" is optional.
- **Banners:** shown on a minimal profile mock. Under the preview, one row: Theme (left), "Open … profile" and "Download image" (right).
- **Badges:** chips, plus "Copy HTML" / "Copy Markdown".
- **Text:** rows (label · text · Copy).
- **Mobile:** stacked, nothing sticky.

**Components:** `ResultsScreen.tsx` rewritten. New in `Controls.tsx`: `ThemeSwitch`, `TextAction`, `LinkedInIcon`, `XIcon`, and `PrimaryButton` with `size="sm"` and an `icon` prop.

**Props migration: yes.**
- `stack` and `caption` are now required.
- New optional props: `person`, `headline`, `resume`, `captions`, `themes`/`onThemeChange`, `onDownload(format, theme)`, `onCopy(format, text)`, `onShareDevice`, `onPost`, `onOpenProfile`, `onPreviewLinkedIn`, `onAddTool`, `onEditStack`.
- Removed: `onAllFormats`, `socialTheme`/`onSocialThemeChange`.

**Interaction:** posting **does not** attach the image automatically. It opens the platform; the user attaches the downloaded file.

**Data:** a per-format theme, which can be persisted in your existing localStorage. Optional profile name, title, handle and avatar for the previews.

## 5. Landing page

**What changed visually**
- The approved 48px blueprint grid background (option 2b), with four filled cells (desktop).
- The example stack renders with the new cards automatically.

**Components:** `LandingScreen.tsx`. The grid layer was added; the composition is unchanged.

**Props migration:** none.

## 6. Questionnaire

**What changed visually:** the live tray now uses the `tray` layout (88px equal cards in one row). The rest of the screen is unchanged.

**Components:** `QuestionnaireScreen.tsx`. Only the board call and the tray spacing changed.

**Props migration: yes.** `options` is required: pass your tool catalog. The default stack is now empty.

## 7. Data and demo split

- `EXAMPLE_STACK` and `BUILD_OPTIONS` moved from `tools.ts` to the new `lib/stackflex/demo.ts`. Only the landing example imports it.
- Production components no longer default to demo data.

## 8. Reference files

- New: `reference/cards/` (final card renders: 150px collection, 92px panel, 1–6 tool counts, 3-tool stack, social card, LinkedIn banner, spec).
- New: `reference/screens/` (landing, questionnaire, results top/scrolled/close-up/mobile).
- New: `reference/source/` (the design files that open in a browser).
- The v1 `screenshots/` folder is not included; it's superseded.

---

## Open items and ambiguities

1. **Screen screenshots show older cards.** The landing, questionnaire and results renders were made before the final card pass, so the cards inside them are the previous style. **Layout comes from `reference/screens/`, card appearance from `reference/cards/`.** In code, every screen already uses the new `StackCard`.
2. **Results v2 contains several explorations (sections 1–6).** Only **section 6** (6a–6d) is treated as final. Sections 1–5 are superseded, including the side-by-side social/banner layout of section 4.
3. **X header at real size** has not been checked with the new cards. It uses the same `row` rule; at 600px display width the cards may land just under 88px.
4. **Not designed:** the "+N" overflow label (more than 6 tools), the "Other" model input, the "More tools" picker, the "Preview on LinkedIn" modal, and empty, loading and error states.
5. **Drag a card onto the Main card to swap** is a required behavior but is not implemented.
6. **Pick motion** (fly into the tray, then the tint fades in) is not implemented.
7. **Tool accent colors** exist only for the six example tools. Every other tool needs a curated `aura` (rule in DESIGN_HANDOFF §2).
8. **StackFlex mark in exports** uses a fixed 12px size. At 1080px it will look small compared with the design (about 32px). Scale it with the export size.
9. **Not compiled.** None of this code has been type-checked or run in a Next.js project. Expect small TypeScript and lint fixes.
