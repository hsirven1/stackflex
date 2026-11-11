# StackFlex V0.1

Show off your AI stack. Pick your tools, optionally drill into exact models and versions, and export a LinkedIn banner, X header, square social card, transparent website badges, a copyable LinkedIn/X bio, or a plain-text resume snippet. No signup; selections are saved in `localStorage`.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```

## Architecture

```
src/
  app/                     layout (fonts), page (header + app shell), globals.css
  lib/
    view.ts                builder/results view state in the URL hash (#results)
    catalog/
      types.ts             Provider, CatalogTool, CatalogModel, Category, SearchResult
      data/                curated snapshot: providers, tools, models (+versions), categories
      adapter.ts           CatalogAdapter interface + local implementation (search, formatModel)
      openrouter.ts        groundwork for live OpenRouter model search (not wired, no network)
      icons.ts             Simple Icons registry (explicit imports, tree-shaken)
    selection/
      types.ts             SelectedItem, StackState, BadgeData, MAX_BADGES
      store.ts             localStorage-backed external store (useSyncExternalStore) + actions
      derive.ts            state -> render-ready BadgeData (category order, attribution)
      bio.ts               LinkedIn / X bio generation within character limits
      resume.ts            plain-text "AI Tools & Technologies" resume line
    export/
      presets.ts           export formats, pixel sizes, badge areas clear of profile photos
      download.ts          html-to-image PNG export at exact pixel dimensions
    integrations/          Vercel Web Analytics product-event helpers (page views via root layout)
    themes.ts              Light / Dark / Monochrome render tokens + icon contrast logic
  components/
    badges/                Badge (the single badge component), metrics, FitText, BrandGlyph
    renderer/              Wide (LinkedIn banner, X header) / Square / Strip compositions, ScaledStage
    guided/                GuidedBuilder (default six-step questionnaire, stack below the question), ToolTile, steps
    loadout/               LoadoutCards: the square stack cards shared by the questionnaire and results
    builder/               BuilderView (full editor page), CategoryGrid (six cards), LoadoutDock (sticky inventory)
    results/               ResultsView: LoadoutHero (LoadoutCards + Edit), AssetCard gallery (per-asset theme + download),
                           PreviewMockups (LinkedIn / X profile, social post; never exported), ResumeSnippet,
                           EditLoadoutDrawer (left drawer editing a draft)
    selector/              CategoryCard (quick picks, fixed-height ModelStrip), AnchoredPanel ("See more" and
                           model details, one at a time), ToolPill, InlineModelPicker
    preview/               BioPanel, Segmented
    app/                   StackFlexApp shell (guide / edit / results via URL hash), NoticeToast
```

Key rules:

- Renderers only receive `BadgeData`; model names and versions are formatted by the catalog adapter.
- Every badge in a composition is sized by `badgeMetrics(height)`: identical width, radius, icon tile and type scale.
- Each export format is its own fixed-pixel composition. The preview scales the node visually; export captures it at native size.
- One badge per underlying selection (selection id = catalog tool id). Max 6 badges.

## Updating the catalog

Edit `src/lib/catalog/data/*`. Add model versions to `models.ts`; tools reference models by id via `modelIds`. Icons resolve through `iconSlug` (Simple Icons slug) on the tool, falling back to the provider's slug, then to a neutral monogram.
