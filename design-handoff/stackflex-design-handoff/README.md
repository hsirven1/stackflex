# StackFlex design handoff: personal AI profile (final)

This package brings the approved **personal AI profile** design into the existing StackFlex Next.js + Tailwind app. The profile uses horizontal cards, AI Apps / AI-Powered Software sections, "How I use AI" with tool tags, the Results page preview and the landing showcase.

It is a **visual layer only**. It doesn't fetch, store or decide anything. Map your existing state into the props described below.

Approved source: `reference/source/StackFlex Compact Cards.dc.html`, Direction C (hybrid). Open it in a browser with `support.js` next to it.

**Hybrid rule:** the public page, the Results preview and the landing showcase use the **horizontal card** (`StackCardRow`). The Social Post and Banner images keep the **square card** (`StackCard`), which is unchanged.

---

## 1. Package contents

```
stackflex-design-handoff/
├─ README.md                         ← this file
├─ cursor/                           ← copy into your project (paths mirror src/)
│  ├─ public/stackflex/
│  │  ├─ mark.svg, mark-dark.svg                     (existing)
│  │  └─ icons/ai-apps.svg, ai-software.svg          NEW (section icons, placeholders)
│  └─ src/
│     ├─ styles/
│     │  ├─ stackflex.css                            existing tokens (colors, fonts)
│     │  ├─ stackflex-card.css                       existing square card
│     │  └─ stackflex-profile.css                    NEW: horizontal card, tags, grids, states
│     ├─ lib/stackflex/
│     │  ├─ tools.ts                                 existing Tool type + helpers (unchanged)
│     │  ├─ profile.ts                               NEW: ProfileData / ProfileTool / Activity view models + helpers
│     │  ├─ mock-profile.ts                          NEW: MOCK DATA ONLY (landing, stories, screenshots)
│     │  ├─ demo.ts, fonts.ts                        existing
│     ├─ components/stackflex/
│     │  ├─ StackCard.tsx, StackBoard.tsx, ShareArt.tsx, Brand.tsx, Controls.tsx   existing (unchanged)
│     │  ├─ LandingScreen.tsx, QuestionnaireScreen.tsx, ResultsScreen.tsx        existing reference screens
│     │  └─ profile/                                 NEW
│     │     ├─ StackCardRow.tsx        horizontal collectible card
│     │     ├─ ToolTag.tsx             tiny tag for activities
│     │     ├─ SectionIcons.tsx        AI Apps (purple) / AI-Powered Software (blue)
│     │     ├─ StackSections.tsx       "My AI Stack" + 2 subsections
│     │     ├─ HowIUseAI.tsx           activities (rows ≥640px, stacked below)
│     │     ├─ ProfileIdentity.tsx     avatar + name + title
│     │     ├─ PersonalProfile.tsx     the whole profile, variants page / preview / showcase
│     │     ├─ BrowserFrame.tsx        minimal browser chrome
│     │     ├─ ResultsPagePreview.tsx  Results "Your page" canvas + Edit profile chip + empty states
│     │     ├─ LinkField.tsx           LinkField, PreviewButton, YourPageHeader, displayUrl()
│     │     ├─ LandingProfileShowcase.tsx  landing hero mock (profile + square social post)
│     │     └─ index.ts
│     └─ app-examples/s/[slug]/page.example.tsx      wiring example for the public route (rename/adapt)
├─ docs/                              earlier specs still valid: card system, exports, Results v3
│  ├─ DESIGN_HANDOFF_v2.md, CHANGELOG_v2.md, EXPORT_SPEC.md, RESULTS_V3.md
└─ reference/
   ├─ screenshots/
   │  01-profile-desktop-8-tools   02-profile-mobile-390    03-results-page-preview
   │  04-how-i-use-ai              05-profile-15-tools      06-profile-3-tools
   │  07-row-card-spec-and-tags    08-landing-showcase-1440x900   09-comparison-square-horizontal-hybrid
   │  results-v3/ (Results page layout: link field, Share elsewhere tabs, mobile)
   ├─ cards/                          square card system (exports)
   └─ source/                         design files (Compact Cards, Results v3, Card System) + support.js
```

## 2. New vs modified

| File | Status | Notes |
|---|---|---|
| `profile/*` | **New** | All profile components |
| `styles/stackflex-profile.css` | **New** | Import after `stackflex-card.css` |
| `lib/stackflex/profile.ts` | **New** | View-model types and helpers |
| `lib/stackflex/mock-profile.ts` | **New** | Mock data, never imported by production routes |
| `public/stackflex/icons/*` | **New** | Section icons |
| `StackCard`, `StackBoard`, `ShareArt`, `tools.ts` | Unchanged | Square cards and exports stay as they are |
| Your public profile route | **Modify** | Render `<PersonalProfile variant="page">` |
| Your Results page | **Modify** | Replace the square-grid page preview with `<ResultsPagePreview>`; use `<YourPageHeader>` for the title row |
| Your landing hero | **Modify** | Replace the profile mock with `<LandingProfileShowcase>` |

## 3. Component hierarchy

```
PersonalProfile (variant: page | preview | showcase)
├─ ProfileIdentity          avatar · name · title
├─ StackSections            "My AI Stack"       (hidden when no tools, unless emptyState is passed)
│  ├─ Sub "AI Apps"               AiAppsIcon + count + grid of StackCardRow
│  └─ Sub "AI-Powered Software"   AiSoftwareIcon + count + grid of StackCardRow
├─ HowIUseAI                "How I use AI"      (hidden when no activities, unless emptyState is passed)
│  └─ row: title + ToolTag[]
└─ footer "Made with StackFlex"   (page only)

ResultsPagePreview → BrowserFrame → [Edit profile chip] + PersonalProfile(preview)
YourPageHeader     → "Your page" · Public · LinkField(Copy link) · PreviewButton
LandingProfileShowcase → BrowserFrame → PersonalProfile(showcase) + SocialCardArt (square cards)
```

## 4. Props and data

```ts
// lib/stackflex/tools.ts (existing)
type Tool = { id; name; version?; category; aura; slug?; logoSrc?; monogram?; models? };

// lib/stackflex/profile.ts (new)
type ToolSection  = "apps" | "software";
type ProfileTool  = Tool & { section: ToolSection };
type ProfileIdentity = { name: string; title?: string; avatarSrc?: string };
type Activity     = { id: string; title: string; toolIds: string[] };     // selected activities only
type ProfileData  = { identity: ProfileIdentity; tools: ProfileTool[]; mainToolId?: string; activities: Activity[] };
```

- **Main** = `mainToolId` if set, otherwise the first tool. Any tool can be Main.
- **`section`** comes from your tool catalog (whatever already decides whether a tool is an app or software).
- **Version** is the user's selected model. If there's none, the model line is left out.
- **Activity tags** resolve `toolIds` against the selected tools; unknown ids are ignored.
- **Category** goes through the existing `categoryLabel()`.

**Write one adapter.** Don't change your store:

```ts
// e.g. src/lib/stackflex/adapters.ts (you write this, from your existing state)
export function toProfileData(state: YourAppState): ProfileData {
  return {
    identity: { name: state.profile.name, title: state.profile.title, avatarSrc: state.profile.photo },
    tools: state.selectedTools.map((s) => ({ ...catalog[s.toolId], version: s.model, section: catalog[s.toolId].section })),
    mainToolId: state.mainToolId,
    activities: state.selectedActivities.map((a) => ({ id: a.id, title: a.label, toolIds: a.toolIds })),
  };
}
```

**Component props**
- `PersonalProfile`: `data`, `variant`, `showActivities?`, `showFooter?`, `onToolClick?`, `emptyTools?`, `emptyActivities?`.
- `ResultsPagePreview`:
  - `data`
  - `onEditProfile` (wire to the **existing** profile editor)
  - `onAddTools?`, `onAddActivities?`, `onToolClick?`
- `YourPageHeader` / `LinkField`:
  - `url`: the **real** snapshot URL. It is middle-truncated for display and copied in full.
  - `onCopy(url)`: your existing copy function, keeping its toasts and analytics.
- `PreviewButton`: `url` (opens in a new tab).
- `LandingProfileShowcase`: `data` (= `MOCK_PROFILE_SHOWCASE`) and `socialTools` (6 tools for the square post).
- `StackCardRow`: `tool`, `main?`, `size` (`auto | md | preview | sm`), `href?`, `onClick?`.
- `ToolTag`: `tool`, `onClick?`.

**Mock vs real.** Only the landing page imports `mock-profile.ts`. The public route and the Results page receive real `ProfileData` via your adapter.

## 5. Visual spec (exact values)

**Horizontal card (`.sf-row`)**
- **Size:** `md` = minimum 216 × 72, logo circle 42, name 15. It grows when the name wraps; names never truncate.
- **Box:** radius 16, padding 10/14/10/13, gap 12, border 1px `#ECEAE4`.
- **Secondary surface:** pearl `linear-gradient(165deg,#FFF,#F8F7F3 60%,#F3F1EC)` plus a tool tint from the left at 15%, and a faint 105° reflection.
- **Main:**
  - Border: tool color at 40%. Shadow `0 12px 26px -20px rgba(60,40,140,.4)`.
  - Holographic layers: conic foil at 28% 50% (multiply, .45), a corner glow at 44%, and a bright streak.
  - Blue `#3A2EFF` ✦ badge on the logo circle, and "· Main" after the category.
- **Logo circle:** white, ring 3px in the tool color at 60%, logo at 52%, monogram fallback.
- **Text:**
  - Category: 9.5px, 600, caps, +0.12em, `#8C897F`.
  - Name: Funnel Display 600, 15/1.12, −0.025em.
  - Model: 12.5px, 500, `#55534D`.
- **Other sizes:**
  - `preview`: logo circle 38, name 14, min-height 66.
  - `sm`: logo circle 36, name 14, min-height 64.
  - `auto`: `sm` below 640px, `md` from 640px.
- **States:**
  - Hover (only when interactive): −2px lift, border `#D6D3CA`, shadow `0 10px 22px -16px rgba(11,11,12,.25)`.
  - Active: back to 0.
  - Focus: 2px `#3A2EFF` outline, offset 2.

**Tool tag (`.sf-tag`)**
- 28px pill, padding 0 10 0 4, white with an inset 1px `#E6E3DC` ring.
- 20px logo circle with a 1.5px ring in the tool color at 60%.
- Name 12.5/600 `#2A2925`. Hover ring `#CFCBC1`.

**Grids (left aligned, never centered or stretched)**
- **Page:** below 640px, 2 fluid columns with gap 8. From 640px, `repeat(auto-fill, 216px)` with gap 10. At max-width 894 that gives 4 columns.
- **Preview:** 3 fluid columns, gap 8 (808px canvas).
- **Showcase:** 2 fluid columns, gap 8.

**Page layout**
- **Order:** identity → My AI Stack → How I use AI → footer. Empty sections are hidden.
- **Spacing:** sections gap 52 (36 mobile); stack title → subsection 22 (18); subsection head → grid 12.
- **Subsection head:** 22px icon, label 15/600, count 13 `#A8A59C`.
- **Headings** (Funnel Display 500, −0.035em): page 24 (22 mobile) · preview 20 · showcase 18.
- **Identity:**
  - Avatar: 88 (64 mobile) · 68 preview · 60 showcase, with a 4px white ring and a shadow.
  - Name: Display 500, 40 (28) · 30 · 26, −0.045em.
  - Title: 17 (14.5) · 15 · 14, `#6F6D66`.
- **Page container:** max-width 1200, padding 72/79 desktop and 32/16 mobile. A faint blue glow sits top right.

**How I use AI**
- **From 640px:** rows, with a title column of 280 (page) / 240 (preview) / 210 (showcase) and gap 24. Rows have 14px vertical padding and a 1px `#EEECE6` divider between them.
- **Below 640px:** the title sits above its tags (gap 8), with 20px between activities.
- **Title:** 16/600 (15 mobile).
- Works from 2 to 12 activities.

**Results preview**
- `BrowserFrame`: radius 20, ring `#ECEAE4`, shadow `0 30px 60px -42px rgba(11,11,12,.28)`, bar 34px.
- Body padding 36/44/32.
- "✎ Edit profile" chip: 30px, at top 12, right 14.
- Empty states (preview only):
  - no tools → a dashed "+ Add your first tool" tile
  - no activities → a blue "+ Add how you use AI" link

**Link field (Results title row):** see `docs/RESULTS_V3.md`.
- 46px field, `#FAF9F6`, inset ring `#E6E3DC`, radius 13, containing Copy link (ink + lime coin; lime "✓ Copied" for 2s).
- "Preview ↗" is an outlined 46px button beside it.

**Landing:** `LandingProfileShowcase` positions at 1440×900:
- profile mock: left 770, top 120, width 580
- square post: 248px, left 1150, top 612

**Tokens:** existing `stackflex.css`: ink `#0B0B0C`, blue `#3A2EFF`, lime `#D7FF3A`, paper `#FAF9F6`, line `#ECEAE4`, body `#55534D`, muted `#6F6D66`, subtle `#8C897F`, faint `#A8A59C`, ver `#2A2925`. Fonts are Funnel Display / Funnel Sans (`fonts.ts`).

## 6. Responsive

| | <640 | 640–1023 | ≥1024 |
|---|---|---|---|
| Public page cards | 2 fluid columns, `sm` card | 216px tracks, `md` | 216px tracks (4 at 894 max) |
| Activities | Stacked | Rows | Rows |
| Results page | One column (see RESULTS_V3) | One column | Page canvas left, Share elsewhere right |
| Landing showcase | Render the profile mock + post stacked below the hero text (not designed) | Same | Absolute composition |

## 7. Dependencies
- React 18+, Next.js 13.4+ (App Router), Tailwind v3 or v4 (tokens from `stackflex.css` / `tailwind.stackflex.preset.js`).
- No new npm packages.
- Browser features: `color-mix()`, `mix-blend-mode`, `conic-gradient`.
- Logos: the Simple Icons CDN via the existing `logoFor()`. Self-host them for production and exports.

## 8. Integration steps
1. Copy `cursor/src/components/stackflex/profile/`, `cursor/src/lib/stackflex/profile.ts`, `cursor/src/lib/stackflex/mock-profile.ts`, `cursor/src/styles/stackflex-profile.css` and `cursor/public/stackflex/icons/`. **Don't overwrite** existing files that you've already modified (`tools.ts`, `StackCard.tsx`, …); they're included for reference.
2. In `globals.css`, import `stackflex-profile.css` after `stackflex-card.css`.
3. Write the `toProfileData()` adapter from your existing state (tools + models, section, main, profile, selected activities).
4. Public route: render `<PersonalProfile data={toProfileData(snapshot)} variant="page" />` (see `app-examples/`). Keep your snapshot URL decoding unchanged.
5. Results: replace the page preview with `<ResultsPagePreview data={…} onEditProfile={openExistingEditor} …/>` and the title row with `<YourPageHeader url={snapshotUrl} onCopy={existingCopy} />`. Leave the Share elsewhere tabs, exports and controls unchanged.
6. Landing: use `<LandingProfileShowcase data={MOCK_PROFILE_SHOWCASE} socialTools={…} />` inside the hero.
7. Swap in your existing purple and blue section icons in `SectionIcons.tsx` if you have them.
8. Run the type check and the build, then compare against `reference/screenshots/`.

## 9. Cursor Agent prompt

```
Read README.md in docs/design/stackflex-design-handoff and look at reference/screenshots/*.png.
Integrate the new personal AI profile design into our EXISTING app without changing business logic, URLs, data model, persistence or exports.

1. Add src/components/stackflex/profile/*, src/lib/stackflex/profile.ts, src/lib/stackflex/mock-profile.ts, src/styles/stackflex-profile.css (import it after stackflex-card.css) and public/stackflex/icons/*.
2. Write src/lib/stackflex/adapters.ts with toProfileData() that maps OUR state (selected tools + models, tool section app/software, main tool, profile name/title/photo, selected activities with their tools) to ProfileData. Show me the mapping before using it.
3. Public profile route: render <PersonalProfile variant="page"> with real data. Keep our snapshot decoding.
4. Results page: replace the square-card page preview with <ResultsPagePreview> (wire onEditProfile to our existing profile editor), and the title row with <YourPageHeader> (real snapshot URL, our existing copy function). Don't touch the Share elsewhere / export controls.
5. Landing hero: replace the profile mock with <LandingProfileShowcase data={MOCK_PROFILE_SHOWCASE}>. Mock data is allowed ONLY here.
6. Social Post and Banner exports keep the square StackCard. Don't change them.
7. Don't import mock-profile.ts anywhere except the landing page. Don't restyle the components.
Run the type check and the build, list the modified files, and anything that didn't map cleanly.
```

## 10. Known limitations
- **Not compiled:** none of this code has been compiled or run. Expect small TypeScript or lint fixes (for example `<img>` lint rules, and `useRef` typing under React 19).
- **Section icons:** the AI Apps and AI-Powered Software icons are placeholders matching the mock. Swap them for your own.
- **Missing logos:** ChatGPT, Midjourney, Le Chat and DeepSeek show monograms until you set `logoSrc` with official SVGs.
- **Landing showcase on mobile** is not designed; stack it under the hero text.
- **Activity limit:** tested visually from 2 to 5 activities and from 3 to 15 tools. 12 activities follow the same rows, but no screenshot shows it.
- **Results screenshots:** `results-v3/*.png` show the Results layout with the earlier square cards in the canvas. Use `03-results-page-preview` for the canvas content.
