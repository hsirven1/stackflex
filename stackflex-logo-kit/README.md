# StackFlex: remaining 16 logo sources

This package contains a verified-source inventory, an automatic download script for directly linked assets, and a copy of the Z.ai vector from the Lobe Icons repository.

**Important:** This is a *source and acquisition kit*, not a complete ready-to-publish set of 16 logos. The execution environment could not download external logo media or ZIP archives. Do not describe these unresolved files as acquired or verified.

## Run on your own machine or in Cursor

```bash
cd stackflex-logo-kit
python3 download_logo_assets.py
```

The script downloads available direct links into `downloads/`. The rest require manual selection from the linked brand kits or directories. Some downloadable items are archives or full wordmarks, not icon-ready assets. Do not auto-integrate.

## Catalog

| Product | Status | Source page | Notes |
|---|---|---|---|
| Z.ai | downloadable | https://github.com/lobehub/lobe-icons/blob/master/packages/static-svg/icons/zai.svg | Lobe Icons implementation, not Z.ai's own asset kit. |
| HeyGen | downloadable-archive | https://www.heygen.com/brand-kit | Select the symbol from the ZIP. Read HeyGen's trademark usage guidelines. |
| Descript | manual-review | https://feedback.descript.com/changelog | Descript changed from blue to red branding in February 2026; ensure the new mark is used. |
| OpusClip | downloadable-review | https://media.opus.pro/ | Official media kit icon variant named Icon_W; verify visibility and suitability on the chosen background. |
| Synthesia | manual-download | https://www.synthesia.io/newsroom | Newsroom links to an official media pack on Google Drive. |
| Granola | manual-review | https://asvg.app/icons/granola | Granola rebranded February 2026. Compare against granola.ai and its current product icon; do not use the pre-2026 mark. |
| Elicit | manual-review | https://brandfetch.com/elicit.com | This means the AI research product at elicit.com. Do not use unrelated elicittechnology.com logos. |
| Gamma | manual-review | https://brandfetch.com/gamma.app | This means Gamma presentation tool at gamma.app. Do not use unrelated gammaai.jp logos. |
| Otter.ai | downloadable | https://otter.ai/media-kit | Official blue vertical SVG. Review whether an icon-only Otter variant is available for narrow circles. |
| Fireflies.ai | manual-review | https://brandfetch.com/fireflies.ai | Use the current Fireflies.ai symbol if its source can be validated. |
| llama.cpp | downloadable-review | https://github.com/ggml-org/llama.brand | Direct SVG is an older project mark; compare with the newer llama.brand repository. Newer branding is under CC BY-NC 4.0 and separate BRAND-USAGE.md terms. |
| Klaviyo AI | manual-review | https://brandfetch.com/klaviyo.com | Corporate Klaviyo symbol is acceptable only as a clearly identified parent-brand fallback; not a distinct AI-product mark. |
| Jasper | downloadable | https://www.jasper.ai/brand | Official Jasper SVG wordmark; look for a compact icon if necessary. |
| Gong AI | manual-review | https://brandfetch.com/gong.io | Gong corporate symbol is a fallback unless there is a distinct Gong AI product mark. |
| Gorgias AI | downloadable-archive | https://www.gorgias.com/about-us/style | Select official Gorgias symbol from archive. Parent-brand fallback rather than distinct Gorgias AI identity. |
| Productboard AI | downloadable-archive | https://www.productboard.com/media-kit/ | Official Productboard vessel icon; parent-brand fallback for Productboard AI. |

## Integration QA

1. Choose product-specific symbols, where available, instead of wordmarks scaled to tiny circles.
2. Confirm current branding against the official company site and brand guidelines, especially Descript (2026 rebrand) and Granola (2026 rebrand).
3. Check commercial/trademark usage and don't imply endorsement. The newer llama.brand project has CC BY-NC 4.0 assets plus a separate brand usage policy.
4. Do not use logos from similarly named unrelated companies.
5. Use official local files in `public/logos/` and the existing resolver, then test light/dark and PNG exports.
6. Preserve the source URL and status in `docs/tool-logo-audit.md`.
