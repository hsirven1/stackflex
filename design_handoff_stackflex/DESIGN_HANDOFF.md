# StackFlex / Bright Future: design handoff

Final approved direction: **StackFlex Bright Future** (latest version of `reference/StackFlex Bright Future.dc.html`). Earlier explorations (Playful Editorial, Precision Tech, Directions v1/v2, App Screens) are superseded. Don't use them.

## 1. What's in this folder

```
design_handoff_stackflex/
├─ DESIGN_HANDOFF.md                 ← this file
├─ screenshots/                      ← final approved design, exported from the reference file
│  ├─ 01-landing-1440x900.png            + 01-landing-2880x1800@2x.png
│  ├─ 02-questionnaire-1440x900.png      + 02-questionnaire-2880x1800@2x.png
│  ├─ 03-results-1440x900.png            + 03-results-2880x1800@2x.png
│  ├─ 04-cards-closeup@2x.png            light/dark main card, light/dark board, small sizes, inline badges
│  └─ 05-identity-board@2x.png           colors, type, components, tool-option states (rest / hover / picked)
├─ reference/                        ← design source of truth (open the .html in a browser, keep support.js next to it)
│  ├─ StackFlex Bright Future.dc.html   1a Landing · 1b Questionnaire · 1c Results · 1d Card close-up · 1e Identity board
│  └─ support.js
└─ cursor/                           ← copy into your Next.js project (paths mirror a src/ app)
   ├─ tailwind.stackflex.preset.js      Tailwind v3 only
   ├─ public/stackflex/mark.svg, mark-dark.svg
   └─ src/
      ├─ styles/stackflex.css           Tailwind v4 @theme tokens + base
      ├─ lib/stackflex/fonts.ts         next/font setup
      ├─ lib/stackflex/tools.ts         Tool type, example stack, Build options, color helpers
      └─ components/stackflex/
         ├─ StackCard.tsx               the card (all sizes, light/dark, holo)
         ├─ StackBoard.tsx              main 2×2 + 5 board: square / banner / tray
         ├─ ShareArt.tsx                SocialCardArt, BannerArt (published artwork)
         ├─ Brand.tsx                   Mark, Wordmark
         ├─ Controls.tsx                PrimaryButton, SecondaryButton, TextButton, ModelPill, StepIndicator, ToolOption, MoreToolsOption
         ├─ LandingScreen.tsx
         ├─ QuestionnaireScreen.tsx
         └─ ResultsScreen.tsx
```

The `.tsx` files are a faithful React/Tailwind translation of the mocks, written for you to merge into your own app. They hold no data fetching and no routing: wire the callbacks (`onNext`, `onShare`, …) and the questionnaire config to your existing flow. Don't change the product flow.

## 2. Files to transfer into your Cursor project

1. `cursor/src/components/stackflex/*` → `src/components/stackflex/`
2. `cursor/src/lib/stackflex/*` → `src/lib/stackflex/`
3. `cursor/public/stackflex/*` → `public/stackflex/`
4. Styles:
   - **Tailwind v4:** copy `cursor/src/styles/stackflex.css`, then add `@import "../styles/stackflex.css";` after `@import "tailwindcss";` in `app/globals.css`.
   - **Tailwind v3:** copy `cursor/tailwind.stackflex.preset.js` to the project root, add `presets: [require("./tailwind.stackflex.preset.js")]`, and paste the `@layer base` block from `stackflex.css` into `globals.css`.
5. Fonts: in `app/layout.tsx`, import `{ funnelDisplay, funnelSans }` from `@/lib/stackflex/fonts` and set `<html className={`${funnelDisplay.variable} ${funnelSans.variable}`}>`.
6. Optional: put `reference/` in the repo (for example `docs/design/`) so Cursor can read the source design.

The imports use the `@/` alias for `src/`. Adjust them if your alias differs. Requirements: React 18+, Next 13.4+ (App Router), and browsers with container queries (cqw units) and `mix-blend-mode`.

**Prompt to give Cursor:** *"Read docs/design/DESIGN_HANDOFF.md and src/components/stackflex/*. Replace the visuals of our landing, questionnaire and results pages with these components. Keep our existing routes, state, questionnaire steps and data. Do not restyle or simplify the components."*

## 3. Component hierarchy

```
app/layout.tsx                      fonts (lib/stackflex/fonts.ts) + stackflex.css
│
├─ LandingScreen
│  ├─ Wordmark → Mark
│  ├─ PrimaryButton (lg)
│  ├─ LinkedInPostMock (internal)    → SocialCardArt → StackBoard[square] → StackCard[main | standard]
│  └─ LinkedInProfileMock (internal) → BannerArt     → StackBoard[banner] → StackCard[main | compact] + Mark tile
│
├─ QuestionnaireScreen               (client: local or controlled `stack`)
│  ├─ Wordmark, StepIndicator, TextButton (Exit)
│  ├─ ToolOption × n + MoreToolsOption
│  ├─ ModelPill × n (+ ghost "Other")
│  ├─ TextButton (Back, Skip), PrimaryButton (md, Next)
│  └─ StackBoard[tray] → StackCard[main | compact] + EmptySlot + "+" tile
│
└─ ResultsScreen
   ├─ Wordmark, TextButton (Start over)
   ├─ "+ Add" + SecondaryButton (sm, Edit stack)
   ├─ StackBoard[square] → StackCard[main | standard]
   └─ Share: SocialCardArt · BannerArt (light 4:1) · BannerArt (dark 3:1) · README badges · headline text

Data: lib/stackflex/tools.ts → Tool, EXAMPLE_STACK, BUILD_OPTIONS, cardColors(), logoFor(), stackHeadline()
```

The building blocks are `StackCard` → `StackBoard` → `SocialCardArt` / `BannerArt`. The screens only compose them. Never restyle a card inside a screen: change `StackCard` so the app and the exports stay identical.

## 4. Status

| Component | Status |
|---|---|
| StackCard (main / standard / compact / icon, light / dark, holo) | Complete, matches 1d |
| StackBoard (square / banner / tray) | Complete |
| SocialCardArt, BannerArt | Complete (rendering only, no export pipeline) |
| Mark, Wordmark | Complete |
| PrimaryButton, SecondaryButton, TextButton, ModelPill, StepIndicator | Complete |
| ToolOption (rest / hover / picked), MoreToolsOption | Complete, matches 1e |
| LandingScreen | Complete at desktop; mobile is a proposal |
| QuestionnaireScreen | Layout and selection complete for one step; your step config must be wired in |
| ResultsScreen | Layout complete; share and download callbacks are stubs |

The code has not been compiled inside a Next.js project yet. Expect minor type or lint fixes (for example the `<img>` lint rule).

## 5. Design tokens

### Color (about 90% white and ink)
| Token | Hex | Use |
|---|---|---|
| sf-ink | `#0B0B0C` | Type, primary button, banner mark tile |
| sf-blue (Ultramarine) | `#3A2EFF` | Action, selection, current step, "Main" label, "stack." in the headline |
| sf-lime | `#D7FF3A` | Check badge and button arrow coin **only**; "Main" label on dark cards |
| white | `#FFFFFF` | All page backgrounds (no gray panels) |
| sf-paper (warm white) | `#FAF9F6` | Share gallery tiles only |
| sf-chip | `#F4F3EF` | Secondary button, unselected model pill |
| sf-line | `#ECEAE4` | Card border, upcoming step bar, rest ring |
| tray divider | `#EEECE6` | 1px top border of the questionnaire tray |
| sf-body | `#55534D` | Landing subhead |
| sf-muted | `#6F6D66` | Secondary text, Back/Skip/Exit, "Other" |
| sf-subtle | `#8C897F` | Hints, "+" tile glyph |
| sf-faint | `#A8A59C` | " / 6" |
| sf-ver | `#2A2925` | Version text on light cards |
| Dashed slot | `#DAD7CF` border, `#C9C6BD` number | Empty tray slots |
| "+" tile | `#F1EFE9` | Tray add tile |
| More tools ring | `#CFCBC1` dashed 1.5px | |
| LinkedIn | `#0A66C2` | "Post on LinkedIn" button, "in" badge |

**Tool colors.** Each tool has one `aura` hex. Derived colors use exact alpha suffixes (`cardColors()` in tools.ts):
- light tint: aura + `55`
- light ring: aura + `48`
- dark tint: aura + `2E`
- dark ring: aura + `66`

| Tool | Aura |
|---|---|
| Claude | `#FF8A5B` |
| Cursor | `#6C7BFF` |
| Claude Code | `#FFB06B` |
| n8n | `#FF5C8A` |
| Midjourney | `#A88BFF` |
| Ollama | `#3FCB91` |

Tools not in the example stack have no approved aura yet (they are marked TODO in tools.ts).

### Gradients (the only ones in the product)
- **Card body:** `linear-gradient(180deg, #FFFFFF 30%, tint), #FFFFFF`. Dark: `#121216` and dark tint.
- **Holo, main card light:** `HOLO.conicLight` with `mix-blend-mode: multiply` at opacity .42, plus `HOLO.streakMainLight`.
- **Holo, main card dark:** `HOLO.conicDark` with `screen` at opacity .6, plus `HOLO.streakMainDark`.
- **Streak, standard/compact cards:** `HOLO.streakSmallLight` / `HOLO.streakSmallDark`. Icon-size cards have no streak.
- **Share artwork glow:** `radial-gradient(closest-side, rgba(58,46,255,.10), transparent)` rising from below. The X header (dark) uses .35.
- **Avatar placeholder (mock only):** `linear-gradient(140deg, #FFC9A8, #B9A8FF)`.

Exact strings are in `StackCard.tsx → HOLO`.

### Typography
Fonts are **Funnel Display** (headlines, card names, wordmark) and **Funnel Sans** (UI). Both come from Google Fonts under the OFL and are variable 300–800.

| Role | Font / weight | Size / line-height / tracking |
|---|---|---|
| Landing H1 | Display 500 | 116 / 0.92 / −0.055em |
| Question | Display 500 | 80 / 1 / −0.05em |
| Results H1 | Display 500 | 48 / 1 / −0.05em |
| Section ("Share it") | Display 500 | 28 / −0.035em |
| Tray title | Display 500 | 26 / −0.035em |
| Wordmark | Display 600 | 22 / −0.035em |
| Landing subhead | Sans 400 | 26 / 1.35 / −0.01em, sf-body |
| Eyebrow (step name) | Sans 500 | 17, sf-blue |
| Model row lead | Sans 400 | 18, sf-muted |
| Buttons | Sans 600 | 18 (lg) / 17 (md) / 16 / 15 / 14 |
| Tool label | Sans 500 (600 + blue when picked) | 16 |
| Hints | Sans 400 | 14–15 |

Card text is in container units, relative to card width:

| Card | Name | Version | Category pill |
|---|---|---|---|
| Main | Display 600, 10.8cqw, −0.035em | Sans 500, 6.6cqw | 4.2cqw |
| Standard | Display 600, 9.9cqw, −0.02em, truncates | Sans 500, 9.2cqw, sits under the name | 7.1cqw |

The category pill is Sans 600, uppercase, +0.07em, with a white 85% background and a 1px rgba(11,11,12,.06) ring. It is the only all-caps element, approved in the final round (the identity board text saying "no all-caps" is older).

### Radius
- Main card: 10cqw (32px at 316px)
- Standard card: 13.2cqw (20px at 152px)
- Compact card: 21cqw
- Pills and buttons: fully round
- Tool coin: circle
- Gallery tile: 24 (social panel) / 18 (format tiles)
- Tray empty slot: 14 (main slot 22)
- Step bar: 3
- LinkedIn mocks: 14

### Shadows
| Element | Shadow |
|---|---|
| Main card (light) | `0 24px 48px -30px rgba(11,11,12,.32)` |
| Coin, main | `0 0 0 2.2cqw ring, 0 18px 36px -14px rgba(11,11,12,.25)` |
| Coin, standard | `0 0 0 2.6cqw ring, 0 8px 16px -8px rgba(11,11,12,.2)` |
| Tool option, rest | `0 0 0 1px #ECEAE4, 0 8px 20px -10px rgba(11,11,12,.16)` |
| Tool option, hover | `0 0 0 1px #D6D3CA, 0 16px 30px -12px rgba(11,11,12,.22)`, plus translateY(−3px) |
| Tool option, picked | `0 0 0 2px #3A2EFF, 0 14px 30px -12px rgba(58,46,255,.45)` |
| LinkedIn post mock | `0 1px 2px rgba(11,11,12,.06), 0 40px 80px -40px rgba(11,11,12,.28)` |
| LinkedIn profile mock | `… 0 40px 80px -36px rgba(11,11,12,.32)` |
| Social preview (results) | `0 20px 40px -24px rgba(11,11,12,.3)` |

### Spacing (desktop 1440)
- Page side padding: 96 (landing), 120 (questionnaire, results). Header height 88.
- Questionnaire:
  - Body padding-top 36.
  - Eyebrow → question 10; question → options 48; options → model row 40.
  - Option column 120 wide, gap 14; 9 options spread with `justify-between`.
  - Tray height 240, gap 56: title block 200 wide, board 480 wide (5 columns, gap 9), hint max-width 260.
- Results:
  - Grid `480px | 1fr`, gap 72; title → board 28; board gap 12.
  - Share column: padding-top 12, gap 20. Social panel padding 24, gap 28, preview 232. Format grid 2×2, gap 20, tile min-height 96.
- Landing (absolute positions inside 1440×900):
  - Hero text: left 96, top 228, width 620, gap 32.
  - LinkedIn post: left 940, top 48, width 400.
  - LinkedIn profile: left 720, top 520, width 600. It overlaps the bottom of the post on purpose.

## 6. The card system (1d)
- **Coin:** the official logo on a white circle with a ring in the tool's tint. The circle stays white on dark cards so every logo reads.
- **Tint:** each card fades from white (or `#121216`) into the tool's tint at the bottom, the same direction on every card.
- **Holo:** only the main card gets the iridescent foil. Standard cards get one light streak. Dark cards shine more than light ones; that balance is approved, so keep it.
- **Text:** category pill top-left; "Main" (blue, or lime on dark) top-right, on the main card only.
  - Main: name + version on one baseline at the bottom.
  - Standard: name, then version below.
  - Compact: name only, centered.
- **Variants:**
  - `main`: the 2×2 cell.
  - `standard`: Results board, social card.
  - `compact`: banner, tray.
  - `icon`: tiny thumbnails.
- **Board:** the main pick is 2×2, with 5 cards around it. Layouts:
  - `square`: 3 columns. Results, square social card.
  - `banner`: 5 columns × 2 rows, main left, others two per column, StackFlex mark tile last. LinkedIn banner, X header.
  - `tray`: 5 columns × 2 rows. Picks, numbered dashed empty slots, "+" tile.

## 7. Screens

### 1a Landing
- Header: Wordmark left, "Build my stack →" (16/500) right.
- H1 "Show off your AI **stack.**" ("stack." in ultramarine), subhead "Your tools. Your models. Your flex.", PrimaryButton lg "Build my stack".
- Hero showcase:
  - An illustrative LinkedIn post whose image is exactly `SocialCardArt` (no title, no link, no caption).
  - An illustrative LinkedIn profile whose banner is exactly `BannerArt`, overlapping the post's lower part.
  - Both sit upright, not rotated.
- The whole page is white; there is no gray side panel.

### 1b Questionnaire (one question per screen, 6 steps)
- Header: Wordmark, centered StepIndicator ("2 / 6"), "Exit".
- Eyebrow = step name (blue), then the question.
- Options are coins without boxes, ending with a "More tools" dashed coin that opens the full tool list.
- Model row (optional): "{Tool} with" plus ModelPills plus "Other". It follows the most recently picked tool that has models.
- Actions: Back · Skip · Next.
- Live tray: the board builds as you pick, and the newest card gets a 2px ultramarine outline (offset 3).
- Hint: "Your first pick is the main card. Drag any card onto it to swap." Drag-to-swap is a required behavior; it isn't implemented in the reference code (use your DnD lib, e.g. dnd-kit).
- Only step 2 copy is in the mocks. Keep your existing six steps, questions and categories.

### 1c Results
- Left column:
  - "Your AI stack" with "+ Add" (text) and "Edit stack" (SecondaryButton sm).
  - Square board.
- Right column, "Share it" with "All formats →":
  - **Social card** panel: preview, "Post on LinkedIn" (LinkedIn blue), "Post on X" (ink), then Download · Copy caption · Light · Dark.
  - 2×2 formats: LinkedIn banner 1584×396 · X header 1500×500 · GitHub README badges (Markdown, SVG) · Headline, bio, resume (copy text).

### More than six tools
The board shows the first 6 tools; the main card is the first. The approved note says extra picks appear as a "+N" next to the board title, but this was **not drawn**. `overflowCount()` is provided. In the tray, the "+" tile shows "+N".

## 8. Interactions & motion
| Interaction | Behavior |
|---|---|
| Tool option hover | Lift 3px, darker ring. 150ms ease-out (duration not specified in the mocks) |
| Tool picked | Blue 2px ring, lime ✓ badge (26px, 3px white border, top-right), label turns blue 600 |
| Tool picked motion | Approved: the card flies into the next open tray slot (240ms), then its tint fades in. Implement with Framer Motion `layoutId` or FLIP |
| Model pill | Selected = blue/white 600, others chip/ink 500. Single select per tool. "Other" opens a free-text input (not designed) |
| PrimaryButton hover | Arrow coin nudges 2px right (not in the mocks; minimal suggestion) |
| Focus | 2px ultramarine ring, 2px offset on all controls (accessibility; not in the mocks) |
| Step indicator | Done = ink, current = blue, upcoming = line |

## 9. Responsive
Only **desktop 1440×900** was designed and approved. The components scale internally (cqw), and the screens include a stacked fallback below `lg`. **That mobile layout is a proposal, not an approved design. Review it on real devices before shipping.**

Breakpoints are the Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). The desktop composition applies from `lg`, with 120px side padding from `xl`.

| | Mobile (<768) | Tablet (768–1023) | Desktop (≥1024) |
|---|---|---|---|
| Side padding | 20 | 40 | 96 / 120 (xl) |
| Landing H1 | 56 | 88 | 116 |
| Landing showcase | Below the CTA, post full width, profile overlapping 80px | Same | Absolute composition |
| Question | 44 | 64 | 80 |
| Tool options | 3-column grid | 5-column grid | Single row |
| Step indicator | Under the header, above the eyebrow | In the header | In the header |
| Tray | Stacked below content | Stacked | 240px bar |
| Results | One column: board, then share | One column | 480 / 1fr |

Keep tap targets ≥44px (model pills 44, coins 88, buttons 44–64).

## 10. Required assets
- **Fonts:** Funnel Display, Funnel Sans (Google Fonts, SIL OFL 1.1), loaded through `next/font/google`.
- **StackFlex mark:** `public/stackflex/mark.svg` (on light) and `mark-dark.svg` (on ink), also available as the `<Mark>` component. Blue square 16 (r5) plus lime square 11 (r4), with a 2px cut-out ring.
- **Tool logos:** Simple Icons CDN (`https://cdn.simpleicons.org/{slug}`). Slugs used: `claude`, `cursor`, `n8n`, `ollama`, `githubcopilot`, `replit`. You can also self-host them via `npm i simple-icons`.
  - Logos are trademarks of their owners; display them unmodified and in full color.
  - **No Simple Icons logo was used for:** Codex, Lovable, Windsurf, v0 and Midjourney. They show monograms. Get their official SVGs from each company's brand or press page and set `logoSrc`.
- **Glyphs:** "→" and "✓" are text characters. There are no icon libraries and no other custom SVGs.
- **LinkedIn/X UI on the landing page:** illustrative mockups built from simple shapes and the system font. No third-party screenshots.

## 11. Exports (LinkedIn, X, GitHub)
- Render the export images from the same `SocialCardArt` / `BannerArt` components so exports match the app.
- Use a headless browser screenshot (Playwright/Puppeteer) or `html-to-image` on the client.
- **Do not use `@vercel/og`/Satori.** It does not support conic gradients, `mix-blend-mode` or container units, so the holo foil and scaling would be lost.
- Square post at 1080×1080 is recommended (not fixed in the mocks); banners at 1584×396 and 1500×500.

## 12. Interactions not implemented
These are part of the product flow, but the reference code only exposes callbacks or nothing at all:
- **Drag a card onto the main card to swap** (questionnaire tray, promised by the hint text). Not implemented.
- **Pick → fly into the tray (240ms) → tint fade-in.** Approved motion, not implemented.
- **"More tools" picker.** `onMoreTools` callback only; the picker UI is not designed.
- **"Other" model input.** The pill is rendered with no handler; the UI is not designed.
- **Next / Back / Skip / Exit / Start over / Edit stack / + Add / All formats.** Callbacks only; wire them to your router and state.
- **Post on LinkedIn / Post on X / Download / Copy caption / Copy README / Copy headline.** Callbacks only; there is no export or share pipeline (see §11).
- **Light · Dark toggle on the social card.** The toggle exists, but `SocialCardArt` is light-only; a dark square card is not designed.
- **"+N" overflow label** next to the Results title for stacks larger than six. Only `overflowCount()` exists.

## 13. Known limitations
- **Desktop only.** Only 1440×900 is designed and approved. The mobile and tablet layouts in code are proposals.
- **Mock vs code on the Results page.** In `03-results` the LinkedIn and X thumbnails show an older one-row layout, and the social preview still has a "My AI stack" title. The code uses the later approved artwork everywhere: the two-row banner and the social card without a title or link, as on the landing page.
- **Landing header overlap.** At exactly 1440 the LinkedIn post (top 48) slightly covers the header link "Build my stack →" (visible in `01-landing`). That is how the approved mock looks. If you'd rather keep the link clear, it needs a design decision, not a silent fix.
- **Logos.** Codex, Lovable, Windsurf, v0 and Midjourney show monograms until you add their official SVGs. Simple Icons is loaded from a CDN; self-host it for production and for exports.
- **Aura colors** for tools outside the example stack are not defined (TODO in `tools.ts`).
- **Not designed:** empty, loading and error states; hover states for buttons other than the tool option. The focus ring and the PrimaryButton arrow nudge in the code are minimal suggestions.
- **Questionnaire copy.** Only step 2 is drawn. Keep your existing six steps and questions.
- **Identity board wording.** It still says "no all-caps", but the uppercase category pill was approved later and is the only exception.
- **Exports.** The holo layers need a real browser renderer; Satori or `@vercel/og` will drop them.
- **Browser support.** Container query units and `mix-blend-mode` are required (all current evergreen browsers).
