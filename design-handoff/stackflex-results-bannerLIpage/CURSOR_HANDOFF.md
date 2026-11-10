# CURSOR_HANDOFF: StackFlex Results, direction B "Profile studio"

Design source: `StackFlex Results Directions.dc.html` → **2b** (desktop, approved), **2d** (mobile + banner viewer), **2e** (assets and edge cases), **2f** (interactions, reveal, responsive, safe zones).
This package replaces `stackflex-results-design/` and the earlier draft of `stackflex-results-final/`. Previews: `previews/*.png`.

> **Inspect the project first.** Find the Results route, any existing `AIProfileResults` integration, the PNG exporter, the share/copy-link helper, the classifier (including the new "Orchestrator" style), `Brand.tsx` and `fonts.ts`. Report before changing anything. Don't touch onboarding, the classifier, the catalog or other pages. Stop and report conflicts.

## 1. What changed

| File | Change |
|---|---|
| `components/AIProfileResults.tsx` | **Rewritten** for direction B: short title, both assets on one shared stage, each download directly under its asset. The toolkit section, "How we got this" and the copy-link row are gone from this page. |
| `components/AIProfileCard.tsx` | Footer is **StackFlex only** again (no name/role). A single tool now spans the full row. Artwork and type are unchanged. |
| `components/LinkedInBanner.tsx` | No name/role. The tool stack is the hero (3×2 card-style cells, same look as the card). The working style is a small header. New `animate` prop for the secondary reveal. A single tool spans 2 columns; 7+ tools → 5 + "+N more". |
| `components/BannerProfilePreview.tsx` | "On profile" view. Neutral placeholder bars instead of name/role. |
| `components/BannerViewer.tsx` | **New.** Mobile full-screen viewer ("View larger"), banner rotated 90°, with its own download button. |
| `lib/working-styles.ts` | `toStyleId("AI Orchestrator")` → `operator` visuals (alias) until Orchestrator gets its own symbol. |
| `lib/types.ts` | `name` / `role` stay in the type but are **not displayed** anywhere. |
| `styles/profile-results.css` | Adds `.sfr-banner-in`, `.sfr-sheen-late`, `.sfr-stage`, `.sfr-stage-dots`, `.sfr-grid-top`. |
| `examples/sample-profile.ts` | Adds `SAMPLE_STRATEGIST_ONE` (1 tool) and `SAMPLE_ORCHESTRATOR` (9 tools, long names, no-logo tools). |

## 2. Props to connect

| Prop | Required | Connect to |
|---|---|---|
| `profile` | yes | Existing adapter → `AIProfile`. Keep the tool order: `tools[0]` is Main (✦). Title and tagline come from the classifier. |
| `onDownloadCard({node, theme, look})` | yes | Existing exporter → **1080×1350** PNG, `stackflex-card-{slug}.png`. Await it. |
| `onDownloadBanner({node, theme, look})` | yes | Same exporter → **exactly 1584×396**, `pixelRatio = 1584 / node.offsetWidth`, `stackflex-linkedin-banner-{slug}.png`. |
| `onShareCard({node, theme, look})` | no | If `navigator.canShare({ files })`: export the card and share the PNG, return `"shared"`. Otherwise copy the existing public profile URL and return `"copied"` (the button shows "Link copied"). Omitted → Share hidden. |
| `onCustomize` | no | Existing stack/profile editor. Both assets re-render from the new profile on return. |
| `theme` / `onThemeChange` | no | Persist in the existing localStorage layer. One theme drives both assets and both exports. |
| `avatarUrl` | no | Only for the "On profile" preview. |

The download buttons show "Saving…" while the promise runs, then "Saved ✓" for 1.6s.

## 3. Layout (match 2b / 2d)

| | <768 | 768–1023 | 1024–1279 | ≥1280 |
|---|---|---|---|---|
| Gutters | 16 | 40 | 40 | container 1280 (80 at 1440) |
| Title | 30px + mobile theme toggle | 40px + supporting line | same | same |
| Theme toggle | next to title (dots only) | header, with labels | header | header |
| Stage | r24, p 16/12, stacked | r32, p32, stacked; card centered at 400 | 2 cols: 380 / 1fr, gap 48 | 2 cols: 420 / 1fr, gap 64, p 36/48 |
| Banner switch | "View larger" → `BannerViewer` | Banner / On profile | same | same |
| Banner slot | natural height | fixed 300px | fixed 300px | fixed 300px |

At 1440×900 both assets and both downloads are visible without scrolling. Never shrink the card below 342px to fit.

## 4. Hierarchy rules

- Exactly one lime element: the Download card arrow. Download banner is an outline pill. Share is a quiet outline.
- No captions, scores, tool lists or explanatory copy beyond the one supporting line and the one upload hint.
- The banner preview *is* the export node (scaled), so preview and file always match.

## 5. Reveal

- Keep the existing card reveal (`sfr-card-in`, `sfr-sheen`, `sfr-rise`).
- The banner enters at +450ms: fade + 12px rise over 360ms, then one sheen sweep at +700ms (`animate` on `LinkedInBanner`).
- Everything is clickable from 0ms. Plays once per mount; don't key components on theme. Reduced motion: 200ms fade for both.
- `[data-sf-export]` freezes both assets at their final frame.

## 6. Banner safe zones

- All content sits at x 33%→96.4%, y 11%→89%.
- The bottom-left ~30% is covered by the profile photo on desktop and in the app, so it's decoration only.
- The outer 3.6% may be cropped.

## 7. Export notes

- Wait for `document.fonts.ready` and for the logos to load. Logos need CORS (`crossOrigin="anonymous"` is set), so self-host them if the canvas taints.
- Server export: screenshot `[data-sf-card]` at 1080×1350 and `[data-sf-banner]` at 1584×396.
- Don't use Satori or `@vercel/og`: they don't support conic-gradient, blend modes, background-clip text or container units.

## 8. Known gaps

- **Orchestrator** reuses the Operator symbol and colors. It needs its own symbol and `STYLE_TOKENS` entry.
- ChatGPT and Microsoft 365 Copilot have no logo yet, so they render as monograms. Add official assets to the catalog.
- **Not compiled or run.** Expect small TS/lint fixes (React 19 `useRef` typing, the `<img>` rule, `textWrap` typing).

## 9. Acceptance checklist

- [ ] At 1440×900, the title, both assets and both download buttons are visible with no scroll.
- [ ] Card export is 1080×1350; banner export is exactly 1584×396; the foil is visible in both, and both follow the theme.
- [ ] The Banner / On profile switch causes no layout shift, and Download banner still works in On profile.
- [ ] Mobile: no horizontal overflow, tap targets ≥44, View larger opens the viewer, and Escape / ✕ close it.
- [ ] 1 tool, 6 tools and 9 tools (long names) all render cleanly in both themes (see `PreviewPage.example.tsx`).
- [ ] No sample data in production.
- [ ] Typecheck and build pass.

## Prompt for Cursor Agent

```
Read stackflex-results-final/CURSOR_HANDOFF.md and look at stackflex-results-final/previews/*.png.
First inspect our project (Results route, existing AIProfileResults integration, PNG exporter, share/copy-link helper, classifier incl. "Orchestrator", Brand.tsx, fonts.ts) and report what you found before changing anything.
Then:
1. Add/upgrade the files under src/components/stackflex/results/ from stackflex-results-final/ (components, lib, styles). Import styles/profile-results.css once.
2. Keep our to-ai-profile adapter; name/role are no longer displayed, don't map them specially.
3. In the Results route render <AIProfileResults> with: onDownloadCard (1080×1350) and onDownloadBanner (exactly 1584×396) on our existing exporter; onShareCard using navigator.share with the card PNG when supported, else copy our public profile URL and return "copied"; onCustomize → our stack editor; theme persisted in localStorage.
4. Don't touch onboarding, the classifier, the catalog, auth or other pages. Don't restyle the components. Don't import examples/ in production.
5. Run typecheck and build, add a dev preview route from examples/PreviewPage.example.tsx, list modified files, and report anything that didn't map cleanly.
```
