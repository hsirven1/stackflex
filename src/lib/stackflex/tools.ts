import { catalog } from "@/lib/catalog/adapter";
import type { CatalogTool, CategoryId } from "@/lib/catalog/types";
import { itemLabel, itemModelLabel, monogramFor, toolIconSlug } from "@/lib/selection/derive";
import type { SelectedItem, StackState } from "@/lib/selection/types";

/** Render-ready card data. Cards never read the catalog or the store directly. */
export type Tool = {
  id: string;
  name: string;
  /** Model / version, e.g. "Opus 4.6". */
  version?: string;
  /** Category pill text, e.g. "Build". */
  category: string;
  /** 6-digit hex card color. */
  aura: string;
  /** Simple Icons slug from the catalog; tools without one show `monogram`. */
  iconSlug?: string;
  monogram: string;
};

/** Card color for tools without an approved aura (catalog gaps and custom tools). */
export const NEUTRAL_AURA = "#A8A59C";

// Exact alpha suffixes from the approved design.
export const cardColors = (aura: string) => ({
  tint: aura + "55",
  halo: aura + "48",
  tintDark: aura + "2E",
  haloDark: aura + "66",
});

/** The card already shows the tool name, so "Midjourney V7" on Midjourney reads "V7". */
function cardVersion(name: string, model: string | undefined): string | undefined {
  if (!model) return undefined;
  const prefix = name + " ";
  return model.toLowerCase().startsWith(prefix.toLowerCase()) ? model.slice(prefix.length) : model;
}

export function toolFromItem(item: SelectedItem): Tool {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  const name = itemLabel(item);
  const categoryId = item.categoryId ?? tool?.categories[0];
  return {
    id: item.id,
    name,
    version: cardVersion(name, itemModelLabel(item)),
    category: (categoryId && catalog.category(categoryId)?.cardLabel) || "Custom",
    aura: tool?.aura ?? NEUTRAL_AURA,
    iconSlug: toolIconSlug(tool),
    monogram: name.length <= 2 ? name : monogramFor(name),
  };
}

/** A catalog tool shown as a questionnaire option (no model chosen yet). */
export function toolFromCatalog(tool: CatalogTool, categoryId: CategoryId): Tool {
  return toolFromItem({ id: tool.id, toolId: tool.id, categoryId, showVersion: false });
}

/** Board order: the main pick first, then the rest in the order they were picked. */
export function stackTools(state: Pick<StackState, "items" | "primaryId">): Tool[] {
  const main = state.items.find((i) => i.id === state.primaryId) ?? state.items[0];
  if (!main) return [];
  return [main, ...state.items.filter((i) => i !== main)].map(toolFromItem);
}

export const stackHeadline = (tools: Tool[]) =>
  tools.map((t) => (t.version ? t.name + " " + t.version : t.name)).join(" · ");
