# StackFlex Results v3: "Your page" hero + "Share elsewhere"

Visual reference:
- `reference/results-v3/*.png`
- Source design file: `reference/source/StackFlex Results v3.dc.html`. Open it in a browser; the approved concept is 1a, its states are 1c–1e.

This **replaces** the Results layout (left sticky panel, vertical list of formats). It does not change cards, product logic or URLs.

## Hierarchy
1. **Header:** StackFlex wordmark · "✎ Edit stack" (chip) · "Start over" (text). The row of stack icons is removed.
2. **Left (≈60%): Your page.** A title row, then one canvas: the public page itself.
3. **Right (520px at 1440, 460px at 1280): Share elsewhere.** Three tabs (Banner · Post · Bio). Only one preview is shown at a time, with its controls right under it.
4. The two columns are separated by a 1px `#EEECE6` hairline. No gray wells, no nested cards.

## "Your page" title row
- Left: "Your page" (Funnel Display 500, 26px, −0.035em) and a green dot `#3FB27F` with "Public" (12.5px).
- Right: **link field + Preview button**, aligned right.
  - **Link field:** read-only, 46px tall, max-width 420, `#FAF9F6` background, `inset 0 0 0 1px #E6E3DC`, radius 13, padding-left 14.
    - Inside, on the left: the compact URL. `stackflex.app` is in ink (500), followed by a middle-truncated path in `#8C897F`, for example `/s/v2-nZHB…wNsv`. The full real snapshot URL is copied.
    - Inside, on the right: **Copy link**, a 36px ink button (radius 9) with a lime `#D7FF3A` coin holding the copy icon. It is the ONLY ink+lime button. After a click it turns lime with "✓ Copied" for 2s.
  - **Preview ↗:** 46px, white, `inset 0 0 0 1px #D6D3CA`, radius 13, 14/600. It opens the public page in a new tab (this replaces "Open").
- **Edit profile** moved: it is now a small chip (30px, white, 1px #E6E3DC ring, "✎ Edit profile", 12.5/600) in the top-right corner of the page canvas, next to the photo, name and title it edits.
- Mobile: the field is full width (with Copy link inside), and Preview is a full-width button below it.

## Page canvas
- Radius 20, `box-shadow: 0 0 0 1px #ECEAE4, 0 30px 60px -42px rgba(11,11,12,.28)`, white.
- Browser bar: 34px, 3 dots `#E6E3DC`, "stackflex.app" centered (11.5px, `#A8A59C`).
- Body: centered vertically, with 2 very faint glows (blue `rgba(58,46,255,.07)` at the top, peach `rgba(255,170,130,.09)` bottom right).
- Content: avatar (84 / 72 laptop / 64 mobile), name (Display 500, 36 / 32 / 28), title (16px, `#6F6D66`), then the cards, then "Made with StackFlex" (11.5px).
- Removed: the "COLLECTION" eyebrow, the "My AI Stack" heading, the outer section card, the gray well and the separate URL field.
- **Cards:** `StackCard`, fixed width 104px at desktop, 96px at laptop and mobile, gap ≈ 9.6% of the card.
  - At most 5 per row on desktop, 3 on mobile. Incomplete rows are centered. Cards never stretch.
  - Count rule: 1–5 tools = one row · 6 = 3+3 · 7–10 = 5 columns.
  - **All** selected tools are shown on the page.

## Share elsewhere
**Tabs:** 3 tiles, height 60, radius 14, gap 8.
- Active: white with a `0 0 0 1.5px #0B0B0C` ring. Inactive: `#F6F5F1`.
- Each tile holds a tiny drawing of its format (banner with avatar, square post, text lines), the name (14/600) and a sub-label (11.5px `#8C897F`).

**Banner tab**
- Preview: a LinkedIn (or X) profile mock. Cover = real banner art scaled to the column width, avatar overlapping the cover (15% of the width), name and title.
- Controls: `LinkedIn | X` and `Light | Dark` segmented switches (bg `#F1EFEA`, active white).
- Then "Featuring 6 of 9 · **Choose tools**" (blue link) on the left, and "Copy image" (text) plus "↓ Download" (small ink, 40px) on the right.

**Post tab**
- Preview: a LinkedIn post mock (avatar, name, title · 2h, one-line caption, the real square image, Like/Comment/Repost/Send).
- Max width 360; the image is the 400px art scaled.
- Controls: featuring + Light/Dark, then Copy image + Download.

**Bio tab**
- Controls: `Headline | About` switch, a "Style: With emojis ▾" dropdown (Minimal / With emojis / Bold) and a title field (bg `#F6F5F1`).
- Preview: a LinkedIn About block, then **Copy for LinkedIn** (ink).
- The old "Copy my stack" section is merged here.

**Previews always use the export components** (`SocialCardArt`, `BannerArt`) rendered at their design size and then scaled with CSS `transform`, so the preview = the export.

## Responsive
- **1440:** padding 56, column gap 56, right column 520, cards 104.
- **1280:** padding 40, right column 460, cards 96, avatar 72.
- **< 1024 (mobile):** one column:
  1. header: wordmark + Edit stack
  2. "Your page" and the canvas (3 columns, cards 96)
  3. the URL, centered
  4. Link field, full width, with Copy link inside
  5. Preview ↗, full width (Edit profile is the chip inside the canvas)
  6. a hairline
  7. "Share elsewhere": 3 tiles (72px, icon above the label), the preview at full width, the switches, featuring, then Copy image | Download (48px)
- Nothing is sticky on mobile.

## Out of scope / to keep
- Keep all existing features: Edit stack, Edit profile, snapshot links, Copy link, Preview (open page), LinkedIn/X, Light/Dark, featured tools picker, Download, Copy image, Bio/About generation, model names and categories.
- The "Generate my AI Portfolio" promo banner is not on this screen. Keep it elsewhere, or confirm it should be removed.
- ChatGPT and Midjourney need official SVG logos (for now they show a monogram).
