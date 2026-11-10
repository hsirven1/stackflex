import { getLogo } from "@/lib/catalog/icons";
import { resolveIconColor, THEMES } from "@/lib/themes";

/**
 * Data-URL logo for surfaces that need an `<img src>` (e.g. Claude Design AIProfileCard).
 * Uses the same catalog assets as ToolLogo — no CDN at render or export time.
 */
export function logoDataUrl(iconSlug: string | undefined): string | undefined {
  const logo = getLogo(iconSlug);
  if (!logo) return undefined;
  if (logo.kind === "image") return logo.src;
  const fill = resolveIconColor(THEMES.light, logo.hex);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${fill}" d="${logo.path}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
