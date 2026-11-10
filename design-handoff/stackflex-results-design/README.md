# StackFlex Results / AI working-style reveal: implementation export

This folder is the code export of the approved Reveal page. The page structure is:

1. Header
2. "Meet your AI working style." and its subtitle
3. Dark/Light switch
4. Working-style card
5. "Download card" and "Copy profile link"
6. "How we got this"
7. "Your AI toolkit"

**Approved card:** Premium Holographic (look `holo`), in **Dark** (default) or **Light**, chosen by the user. The Artifact look (`artifact`) is also implemented because it was approved as an alternate. You choose which one ships.

**Design source:** `StackFlex Working Style.dc.html`
- Section 3 is the assembled export reference.
- Section 2 is the approved card iterations.
- Section 1 is the original page layout.

## Contents

```
stackflex-results-design/
├─ README.md
├─ CURSOR_HANDOFF.md            integration instructions (read this first)
├─ components/
│  ├─ AIProfileResults.tsx      page entry point (client component)
│  ├─ AIProfileCard.tsx         the 4:5 card (presentational, forwardRef for export)
│  ├─ StyleSymbol.tsx           7 geometric symbols (inline SVG, no assets)
│  ├─ CardThemeSwitch.tsx       Dark / Light segmented switch
│  ├─ StackFlexMark.tsx         brand mark (same as the existing Brand.tsx Mark)
│  └─ index.ts
├─ lib/
│  ├─ types.ts                  AIProfile, CardTool, CardTheme, CardLook
│  └─ working-styles.ts         style → colors map, toStyleId(), preview copy
├─ styles/profile-results.css   background grid, reveal animation, reduced motion, export freeze
├─ examples/
│  ├─ sample-profile.ts         SAMPLE data only (7 styles, 1 to 15 tools, missing logo)
│  ├─ PreviewPage.example.tsx   visual QA page
│  └─ CardExportFrame.example.tsx  1080×1350 render target for the existing exporter
└─ previews/
   ├─ desktop-1440.png
   ├─ mobile-390@2x.png
   ├─ card-holo-dark-1296x1620.png
   └─ card-looks-and-themes@2x.png
```

## Assets

All visuals are code:
- the symbols are inline SVG
- the gradients, foil and reflections are CSS
- the brand mark is a component

Tool logos come from your existing catalog (`logo` URL). The samples use the Simple Icons CDN.

**Fonts:** Funnel Display and Funnel Sans (Google Fonts, OFL). They are already loaded in the app through `next/font` (`--font-display`, `--font-sans`), so no font files are bundled.

## Dependencies

- React 18+ and Next.js 13.4+ (App Router), with Tailwind for the page layout. No new packages.
- Browser features: CSS container queries (`cqw`), `mix-blend-mode`, `conic-gradient`, `background-clip: text`.

## Quick start

1. Copy `components/`, `lib/` and `styles/` under e.g. `src/components/stackflex/results/`. See `CURSOR_HANDOFF.md` before touching existing files.
2. Import `styles/profile-results.css` once.
3. Render the page:

```tsx
<AIProfileResults
  profile={toAIProfile(existingState)}
  onDownloadCard={({ node, theme, look }) => existingExport(node, { theme, look })}
  onCopyProfileLink={existingCopyLink}
  onEditStack={openExistingStackEditor}
  toolkit={<StackSections tools={…} variant="page" />}
/>
```

The page has not been compiled in this environment. The Cursor checklist in `CURSOR_HANDOFF.md` §10 lists what to verify.
