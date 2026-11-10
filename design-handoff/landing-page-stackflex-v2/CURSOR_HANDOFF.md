# CURSOR_HANDOFF: StackFlex landing hero v2 (card + LinkedIn banner)

Design source: `StackFlex Landing Hero.dc.html` → **1d** (desktop, approved), **1e** (mobile), **1f** (close-up), **1g** (notes). Previews: `previews/`.

> **Inspect the project first.** Find the landing route (`app/page.tsx` or similar), the current hero component, the existing landing background, and where `stackflex-results-final` was installed (expected `src/components/stackflex/results`). Report before changing anything. Only the hero changes: leave the other landing sections, onboarding and Results alone.

## Depends on

`stackflex-results-final` must already be integrated. This package **reuses** `AIProfileCard`, `LinkedInBanner`, `StackFlexMark` and the `AIProfile` type from it, unchanged. If your install path differs, fix the `@/components/stackflex/results` imports.

## Files

| File | Role |
|---|---|
| `components/LandingHero.tsx` | The hero section: logo, headline, subtitle, Start, showcase. Replaces the current hero. |
| `components/LandingShowcase.tsx` | Positions the assets only. Desktop: one 784×660 composition scaled as a unit. Mobile: a simplified 358-wide stack. |
| `components/ProfileFrame.tsx` | Minimal profile context around the banner (photo, name, headline, meta). No LinkedIn logo or UI. |
| `config/landing-samples.ts` | All sample content. Keep it out of the components. |
| `styles/landing.css` | Grid background and an optional entrance animation. |

## Composition (desktop, from back to front)

1. Alt card left: **AI Strategist, dark**, 290 wide, −8°, at (150, 300).
2. Alt card right: **AI Orchestrator, light**, 290 wide, 8°, at (500, 290).
3. Profile frame: 660 wide at (0, 0). It holds the **dark** banner, a 128px photo, the name, headline and meta line.
4. Main card: **AI Builder, light**, 330 wide at (352, 236), with a soft drop shadow.

Rules:
- The alt cards sit under the frame, so only their lower halves show.
- The main card covers only the frame's empty lower-right. It never covers the photo, the text or banner content.
- The main card and the banner use the **same profile** (`LANDING_SAMPLES.main`: AI Builder, six tools). Never mix profiles between them.

## Layout

| | <768 | 768–1023 | ≥1024 |
|---|---|---|---|
| Grid | stacked: copy, then showcase | stacked | 400 / 1fr (430 at ≥1280), centered vertically |
| Headline | 46px | 64px | 72px, line-height 0.96 |
| Subtitle | 17px | 21px | 21px |
| Start | 56 high | 64 high | 64 high |
| Showcase | 358×440, one alt card | 784×660, scaled to the column | same, max 784 |

- Nothing in the showcase may overlap the copy column.
- No horizontal overflow at 360px.

## Copy

- **Headline:** "Generate your **AI profile.**" (the second part in #3A2EFF)
- **Subtitle:** "Choose your AI tools and get a personalized profile card and LinkedIn banner."
- **CTA:** Start only. Nothing in the showcase is clickable.

## Accessibility and performance

- The showcase is `aria-hidden`; the subtitle carries the message.
- Both assets are pure CSS. Self-host the tool logos (replace the simpleicons placeholders with catalog paths).
- Set `animate` off on all cards (it's the default). Don't start the Results reveal here.
- The optional entrance lives in `styles/landing.css`: add `.sf-landing-anim`, and put `data-sf-alt` / `data-sf-frame` on the wrappers if you want it.

## Known gaps

- ChatGPT and Codex use monograms until official logos are added to the catalog.
- Orchestrator uses the Operator symbol (alias in `working-styles.ts`).
- **Not compiled.** Expect small fixes, for example the `scale(min(…))` container trick (fallback: measure the width with a ResizeObserver) and lint rules.

## Acceptance checklist

- [ ] At 1440×900, the headline, subtitle, Start, the light card and the full banner with name and photo are all visible with no scroll.
- [ ] The main card and the banner show the same style (AI Builder) and the same six tools.
- [ ] The main card is light, the banner is dark, and the alt cards are partly hidden under the frame.
- [ ] At 1024 and 1280 the composition scales cleanly. At 390 it matches 1e, with no overflow.
- [ ] No sample data imported outside the landing page. Typecheck and build pass.

## Prompt for Cursor Agent

```
Read landing-page-stackflex-v2/CURSOR_HANDOFF.md and look at landing-page-stackflex-v2/previews/*.png.
Inspect our project first (landing route, current hero, landing background, where stackflex-results-final is installed) and report before changing anything.
Then:
1. Copy components/, config/ and styles/ into src/components/stackflex/landing/ (styles imported once). Fix the @/components/stackflex/results import path if ours differs.
2. Replace the current hero on the landing page with <LandingHero startHref="<our onboarding route>" />. Keep every other landing section as is.
3. Replace the simpleicons logo placeholders in config/landing-samples.ts with our catalog's self-hosted logos.
4. Don't modify AIProfileCard, LinkedInBanner, onboarding or the Results page.
5. Run typecheck and build, check 390 / 1024 / 1440 widths, list modified files, and report anything that didn't map cleanly.
```
