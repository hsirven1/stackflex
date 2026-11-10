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
  /** Card header text, e.g. "Build". */
  category: string;
  /** 6-digit hex card color. */
  aura: string;
  /** Simple Icons slug from the catalog; tools without one show `monogram`. */
  iconSlug?: string;
  monogram: string;
  /** True when the catalog marks this as business-platform AI (AI at Work). */
  atWork?: boolean;
  /** Parent platform label when representing an AI feature inside a product. */
  parentPlatform?: string;
  /** Explicitly selected capability labels (never inferred). */
  capabilityLabels?: string[];
};

/** Card color for tools without an approved aura (catalog gaps and custom tools). */
export const NEUTRAL_AURA = "#A8A59C";

// `aura` is the tool's curated accent, stored in the catalog (brand hue at about OKLCH L 0.74 / C 0.10;
// monochrome brands C 0.03, cool hue). Never the raw brand color, never computed at runtime.
export const cardColors = (aura: string) => ({
  /** Secondary card wash (~26%), rising from 32% of the height. */
  tint: aura + "42",
  /** Logo coin ring (60%). */
  ring: aura + "99",
  /** Main card corner glow (50%). */
  glow: aura + "80",
  /** Main card top tint (~22%). */
  top: aura + "38",
  /** Main card border (40%). */
  edge: aura + "66",
});

const SHORT_CATEGORY: Record<string, string> = {
  "Daily AI": "Daily",
  "Coding & Building": "Build",
  "Creative AI": "Create",
  "Automation & Agents": "Automate",
  "Research & Productivity": "Research",
  "Local & Infrastructure": "Local",
};
/** Card header label (uppercased by CSS). Catalog `cardLabel`s are already short and pass through. */
export const categoryLabel = (category: string) => SHORT_CATEGORY[category] ?? category;

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
  const capabilityLabels =
    item.capabilities
      ?.map((id) => tool?.aiCapabilities?.find((c) => c.id === id)?.label)
      .filter((label): label is string => Boolean(label)) ?? undefined;
  return {
    id: item.id,
    name,
    version: cardVersion(name, itemModelLabel(item)),
    category: (categoryId && catalog.category(categoryId)?.cardLabel) || "Custom",
    aura: tool?.aura ?? NEUTRAL_AURA,
    iconSlug: toolIconSlug(tool),
    monogram: tool?.monogram ?? (name.length <= 2 ? name : monogramFor(name)),
    atWork: tool?.toolType === "business-ai",
    parentPlatform: tool?.parentPlatform,
    ...(capabilityLabels && capabilityLabels.length > 0 ? { capabilityLabels } : {}),
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
