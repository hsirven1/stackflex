# StackFlex: export spec (badges and images)

Every exported image uses the **same components as the app**: `StackCard`, `StackBoard`, `SocialCardArt` and `BannerArt`, styled by `stackflex-card.css`. Never redraw a card for an export.

## 1. Formats

| Format | File | Size (px) | Component | Cards |
|---|---|---|---|---|
| Social card | `stackflex-social-{theme}.png` | 1080 × 1080 | `SocialCardArt` | `grid`, 82% of the width, gap 2cqw |
| LinkedIn banner | `stackflex-linkedin-banner.png` | 1584 × 396 | `BannerArt` ratio `4 / 1` | `row`, starts at 23.4% of the width (clear of the profile photo), gap 1cqw |
| X header | `stackflex-x-header.png` | 1500 × 500 | `BannerArt` ratio `3 / 1`, theme `dark` | `row`, same rule |
| Single card | `stackflex-{toolId}.png` | 600 × 600 | `StackCard` alone, on a transparent background | 1 card, `main` when it's the first tool |
| Website badge | `stackflex-badge.svg` + HTML snippet | height 40 | `StackChip` row | chips: logo circle, name, CATEGORY |
| GitHub README | `stackflex-readme.svg` + Markdown | width 800, height auto | `StackChip` list | same chips |

Every PNG is also exported at **2×** (for example 2160 × 2160) for sharp display.

## 2. Themes (social card, banner, header)

- **Light:** white background with a faint blue glow. This is the default.
- **Dark:** `#0B0B0C` background, with **the same light cards**. The card style never changes with the theme.
- **Mono:** Light theme with `filter: grayscale(1)` applied to the image only.

## 3. Rules that must not change

1. All cards in a stack are the same size, and the first tool is Main (holographic foil plus the ✦ badge on its logo).
2. The category is always visible, centered at the top of the card, on every format.
3. Cards are at least 88px wide when viewed at real display size: about 92px on a desktop LinkedIn profile, and 104px for the social card in the in-app preview.
4. Exports have no fake UI (no LinkedIn or X frame, no fictional name). Mockups exist only in the app.
5. Version / model text: keep the line, even when it's empty.
6. Stacks of more than 6 tools: show the first 6, and add a "+N" in the app only, not in the image.

## 4. Rendering

- Use a **real browser renderer**: Playwright or Puppeteer, server side (for example `/api/export?format=social&theme=light&stack=…`), or `html-to-image` on the client.
- Satori / `@vercel/og` are **not supported**: they handle neither `conic-gradient`, `mix-blend-mode` nor `cqw`, so the holographic foil would be lost.
- Render at the exact export size: wrap the component in a box of fixed `width` × `height`, with `deviceScaleFactor: 2` for the 2× version.
- Wait for fonts (`document.fonts.ready`) and logos (all `img` loaded) before capturing.
- Logos: self-host them (`simple-icons` npm package, or official SVGs in `public/logos/`). Never call the CDN at render time.

## 5. Text exports (website badge, README)

- HTML badge: `<a href="{profile link}"><img src="{badge.svg}" alt="My AI stack: Claude, Cursor, …" height="40"></a>`
- README: `![My AI stack](stackflex-readme.svg)` followed by a plain text list (name, model, category) for accessibility.
- The SVGs embed their fonts (subset of Funnel Sans / Funnel Display) or are converted to paths, so GitHub displays them correctly.

## 6. Files in the package

- `cursor/src/styles/stackflex-card.css`: the card.
- `cursor/src/components/stackflex/StackCard.tsx`: `StackCard` and `StackChip`.
- `cursor/src/components/stackflex/StackBoard.tsx`: the `grid` / `row` / `tray` layouts.
- `cursor/src/components/stackflex/ShareArt.tsx`: `SocialCardArt` and `BannerArt`.
- `cursor/src/lib/stackflex/tools.ts`: tool colors (`aura`) and `categoryLabel()`.
- `reference/StackFlex Card System.dc.html`: section 0 is the visual reference.
