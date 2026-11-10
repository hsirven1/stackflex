# stackflex-results-final

The final StackFlex Results page, direction B "Profile studio". The AI profile card (hero) and the LinkedIn banner (1584×396) are generated from one `AIProfile` and shown on one shared stage.

- `components/`: `AIProfileResults` (the page), `AIProfileCard`, `LinkedInBanner`, `BannerProfilePreview`, `BannerViewer`, `StyleSymbol`, `StackFlexMark`, `CardThemeSwitch`
- `lib/`: types and working-style tokens (including the Orchestrator alias)
- `styles/profile-results.css`: the reveal animations, the stage surfaces and export safety
- `examples/`: sample profiles, including edge cases, and a preview page. Never import these in production.
- `previews/`: reference screenshots

Start with `CURSOR_HANDOFF.md`.
