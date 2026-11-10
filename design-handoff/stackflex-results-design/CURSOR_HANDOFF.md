# CURSOR_HANDOFF: StackFlex Results / AI working-style reveal

> **Before modifying anything, inspect the current project.**
> - Find the existing Results page, the tool catalog, the working-style classifier, the image export, `components/stackflex/Brand.tsx` (Mark), `lib/stackflex/fonts.ts` and the profile components (`StackSections`, `StackCardRow`).
> - **Do not overwrite existing files.** Add the new files in a new folder, then wire them in.
> - If something here conflicts with the app, stop and report it.

## 1. Entry point

`components/AIProfileResults.tsx` is a client component. Render it from the existing Results route in place of the current results content, keeping the route, guards and data loading as they are.

## 2. Presentational vs connected

| Component | Kind | Notes |
|---|---|---|
| `AIProfileCard` | Presentational | No state. `forwardRef` → the 4:5 card node. Used on the page **and** for export. |
| `StyleSymbol` | Presentational | Picks one of 7 SVGs by style id. |
| `CardThemeSwitch` | Presentational | Controlled (`value`, `onChange`). |
| `StackFlexMark` | Presentational | Replace with the existing `Mark` from `Brand.tsx` if present (same drawing). |
| `AIProfileResults` | Layout + light UI state | Holds only: local theme (if uncontrolled), "Copied" feedback for 2s, and the card ref. Everything else comes from props. |

## 3. Props to connect to existing data

Write one adapter. Don't change the store.

```ts
// e.g. src/lib/stackflex/to-ai-profile.ts
import type { AIProfile } from "@/components/stackflex/results/lib/types";
export function toAIProfile(state: ExistingState): AIProfile {
  return {
    workingStyle: {
      id: state.workingStyle.id,           // any form: "builder", "AI Builder", "ai_builder" → toStyleId()
      title: state.workingStyle.title,     // from the classifier, e.g. "AI Builder"
      tagline: state.workingStyle.tagline, // from the classifier
    },
    tools: state.selectedTools.map((s) => ({
      id: s.toolId,
      name: catalog[s.toolId].name,
      model: s.model,                       // selected model/version, optional
      category: catalog[s.toolId].category,
      logo: catalog[s.toolId].logoSrc ?? simpleIconUrl(catalog[s.toolId].slug), // optional
      accent: catalog[s.toolId].aura,       // existing tool color; optional
    })),                                     // keep the user's order: tools[0] = Main (✦)
    toolCount: state.selectedTools.length,
    categoryCount: countDistinctCategories(state.selectedTools),
  };
}
```

- `name` and `role` exist in the type but **are not shown on the approved card**; they were removed during review. Don't add them back.
- Copy (title and tagline) must come from the classifier. `PREVIEW_COPY` in `working-styles.ts` is sample copy only.

## 4. Callbacks to connect

| Prop | UI | Expected behavior | If omitted |
|---|---|---|---|
| `onDownloadCard({node, theme, look})` **required** | "Download card" | Call the **existing** PNG export with the card node (or with `theme`/`look` for a server render, see §7). Set `downloading` while it runs. | n/a |
| `onCopyProfileLink()` | "Copy profile link" | Copy the existing public snapshot URL with the existing helper (keep its toast/analytics). The button shows "✓ Copied" for 2s. | Button hidden (e.g. no public link yet) |
| `onEditStack()` | Header "Edit stack" | Open the existing stack editor or route. | Link hidden |
| `onThemeChange(theme)` + `theme` | Dark / Light switch | Persist with the existing localStorage layer if wanted. | Local state, default dark |
| `howDerived` (ReactNode) | "How we got this" | Short explanation from the classifier. | Hidden |
| `toolkit` (ReactNode) | "Your AI toolkit" | Pass the **existing** `<StackSections variant="page" …/>` (horizontal cards). Don't rebuild it. | Section hidden |
| `header` (ReactNode) | Header | Pass the app header if the app already has one. | Minimal built-in header |

- **Not in the approved design:** "Edit role" and links to the secondary exports. No dead buttons were added for them. Keep the existing navigation to banners and posts where it is today.

## 5. Styles and assets to import

- `styles/profile-results.css`: import once, e.g. in `app/globals.css`, after the existing StackFlex CSS.
- Fonts come from the existing `next/font` setup (`--font-display`, `--font-sans`). If those variables have other names, map them in the CSS or update `AIProfileCard.tsx`.
- No image assets are required. Tool logos come from your catalog.

## 6. Working-style variants

- **One template.** `toStyleId(workingStyle.id)` returns one of 7 ids; unknown ids fall back to `generalist`.
- **Per-style changes** come from `STYLE_TOKENS`:
  - the symbol (`StyleSymbol`)
  - the two colors `c1`/`c2`, used for the symbol gradient and glow
  - the light-theme title gradient end color
- **Constant across styles:** layout, sizes, foil, the tools grid and the footer.
- **Tools:** 2-column grid, at most 6 cells. Above 6, it shows 5 cells plus "+N more". Tools without a logo show a monogram, and long names and models truncate with an ellipsis.
- **Tagline:** above 80 characters, it drops from 15 to 13px (sizes at 432 width).

## 7. Connect the card to the existing PNG export

The card is fully self-contained:
- 4:5 aspect ratio
- every size in `cqw` relative to its own width
- no hover states, no page positioning

Choose the option that matches the current exporter.

- **Client (`html-to-image` / similar):** use the `node` passed to `onDownloadCard`. For the reference 1080 × 1350 output, either use `pixelRatio = 1080 / node.offsetWidth`, or mount `<AIProfileCard width={1080} elevated={false} animate={false} />` inside an offscreen `<div data-sf-export>` and capture that. `data-sf-export` freezes the animation at its final frame.
- **Server (Playwright / Puppeteer):** add a render route like `examples/CardExportFrame.example.tsx`, then screenshot `[data-sf-card]` at 1080 × 1350, with `deviceScaleFactor` 2 for 2160 × 2700.

**Don't use Satori / `@vercel/og`:** they drop `conic-gradient`, `mix-blend-mode`, `background-clip:text` and container units.

Wait for `document.fonts.ready` and for the logos to load. External logos need CORS (`crossOrigin="anonymous"` is already set), so self-host them if the exporter taints the canvas.

## 8. Responsive behavior

The page has two layouts: under `md` (768px) is mobile, from `md` up is desktop.

| | Mobile (<768) | Desktop (≥768) |
|---|---|---|
| Header | 56px tall, 16px side padding | 72px tall, 64px side padding |
| Headline | 32px, left aligned | 52px, centered |
| Card | Full width minus 32 (358 at 390) | 432 × 540 |
| Buttons | Stacked, full width | In a row, centered |
| Toolkit | Container from `StackSections` (2 columns) | max-width 894 |

Keep the card inside a width-constrained parent; never stretch it beyond 432 on the page.

## 9. Dependencies

There are none to add. The page uses React, Next.js and Tailwind, which the app already has.

## 10. Known limitations and checklist

- **Not compiled or run.** Expect small TS/lint fixes (`useRef` typing with React 19, `<img>` lint rule, the `textWrap` style typing).
- **Reveal animation:** it is CSS-only, under 0.8s, and plays on mount. If the page re-mounts (for example on a theme switch with a `key` change), it replays. Don't key the card on theme. Reduced motion falls back to a 200ms fade.
- **`specialist`** uses c1 `#0B0B0C`, so its glow is barely visible on the dark card; this is as designed in the symbol study.
- **Copy:** the `researcher` and `specialist` taglines in `PREVIEW_COPY` were not reviewed in the final pass.
- **Previews:** the desktop preview's toolkit shows 8 tools while the card shows the 6 sample builder tools; that's sample data only.
- **Checklist for Cursor:**
  - [ ] Adapter written and shown to the user.
  - [ ] No sample data imported in production.
  - [ ] Existing export produces 1080 × 1350 with the foil visible.
  - [ ] Copy link uses the real snapshot URL.
  - [ ] Toolkit uses the existing `StackSections`.
  - [ ] Typecheck and build pass.
  - [ ] Compare against `previews/`.

## Prompt to paste into Cursor Agent

```
Read stackflex-results-design/CURSOR_HANDOFF.md and README.md, and look at previews/*.png.
First inspect our project: Results route, tool catalog, working-style classifier, image export, Brand.tsx, fonts.ts, StackSections. Report what you found before changing anything.
Then:
1. Add the files under src/components/stackflex/results/ (no overwrites). Import styles/profile-results.css in globals.css.
2. Write src/lib/stackflex/to-ai-profile.ts mapping our state to AIProfile (keep tool order; tools[0] is Main). Show me the mapping.
3. Render <AIProfileResults> in our existing Results route. Connect: onDownloadCard → our existing PNG export (1080×1350, see §7), onCopyProfileLink → our existing copy helper with the real snapshot URL, onEditStack → our stack editor, toolkit → our existing <StackSections variant="page">, theme → our localStorage if available.
4. Don't change the classifier, catalog, onboarding, auth or other pages. Don't restyle the components. Don't import examples/ in production code.
5. Run typecheck and build, list modified files, and tell me anything that didn't map cleanly.
```
