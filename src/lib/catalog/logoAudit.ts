import { catalog } from "./adapter";
import { TOOLS } from "./data/tools";
import { getLogo, type Logo } from "./icons";
import { LOGO_ASSETS } from "./logos";
import type { CatalogTool } from "./types";

function toolIconSlug(tool: CatalogTool): string | undefined {
  return tool.iconSlug ?? catalog.provider(tool.providerId)?.iconSlug;
}

export type LogoAuditStatus =
  | "Verified official"
  | "Verified maintained library"
  | "Parent-brand fallback"
  | "Monogram fallback"
  | "Missing"
  | "Needs review";

export type LogoAuditRow = {
  tool: CatalogTool;
  id: string;
  name: string;
  category: string;
  iconSlug: string | undefined;
  logo: Logo | undefined;
  source: string;
  status: LogoAuditStatus;
  notes: string;
};

function classify(tool: CatalogTool): Omit<LogoAuditRow, "tool"> {
  const slug = toolIconSlug(tool);
  const logo = getLogo(slug);
  const category = tool.categories[0] ?? "—";
  const asset = slug ? LOGO_ASSETS[slug] : undefined;

  if (!logo) {
    return {
      id: tool.id,
      name: tool.name,
      category,
      iconSlug: slug,
      logo: undefined,
      source: slug ? `unresolved slug "${slug}"` : "no iconSlug / provider icon",
      status: "Monogram fallback",
      notes: `Renders monogram “${tool.monogram ?? tool.name.slice(0, 2)}”. No verified mark in Simple Icons or LOGO_ASSETS.`,
    };
  }

  if (asset) {
    const provenance = asset.provenance;
    const status: LogoAuditStatus =
      provenance === "verified-official"
        ? "Verified official"
        : provenance === "verified-library"
          ? "Verified maintained library"
          : provenance === "parent-brand"
            ? "Parent-brand fallback"
            : provenance === "needs-review"
              ? "Needs review"
              : // Existing lobehub embeds without explicit provenance
                "Verified maintained library";
    return {
      id: tool.id,
      name: tool.name,
      category,
      iconSlug: slug,
      logo,
      source: asset.source ?? `LOGO_ASSETS:${asset.file}`,
      status,
      notes: asset.license ?? (logo.kind === "image" ? "Embedded SVG/PNG asset" : ""),
    };
  }

  // Simple Icons path
  return {
    id: tool.id,
    name: tool.name,
    category,
    iconSlug: slug,
    logo,
    source: `Simple Icons (${slug})`,
    status: "Verified maintained library",
    notes: "CC0 Simple Icons path; brand trademark of the respective owner.",
  };
}

/** Full catalog logo audit — stays synchronized with TOOLS. */
export function auditAllToolLogos(): LogoAuditRow[] {
  return TOOLS.map((tool) => ({ tool, ...classify(tool) }));
}

export function auditSummary(rows: LogoAuditRow[] = auditAllToolLogos()) {
  const counts: Record<LogoAuditStatus, number> = {
    "Verified official": 0,
    "Verified maintained library": 0,
    "Parent-brand fallback": 0,
    "Monogram fallback": 0,
    Missing: 0,
    "Needs review": 0,
  };
  for (const r of rows) counts[r.status] += 1;
  return { total: rows.length, counts };
}
