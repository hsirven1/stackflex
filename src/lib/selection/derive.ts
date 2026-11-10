import { catalog, normalize } from "@/lib/catalog/adapter";
import type { CatalogTool, CategoryId } from "@/lib/catalog/types";
import type { BadgeData, SelectedItem, StackState } from "./types";

export function itemLabel(item: SelectedItem): string {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  return tool?.name ?? item.customName ?? "Untitled";
}

/** Stable key for a model (+ version) choice. */
export function modelRefKey(ref: { modelId: string; versionId?: string }): string {
  return ref.versionId ? `${ref.modelId}:${ref.versionId}` : ref.modelId;
}

/**
 * Normalized multi-model list for a selection.
 * Migrates legacy single `modelId` / `customModel` when `models` is absent.
 */
export function itemModels(item: SelectedItem): Array<{
  modelId?: string;
  versionId?: string;
  customVersion?: string;
  customModel?: string;
  key: string;
}> {
  if (item.models && item.models.length > 0) {
    return item.models.map((m) => ({
      modelId: m.modelId,
      versionId: m.versionId,
      customVersion: m.customVersion,
      key: modelRefKey(m),
    }));
  }
  if (item.modelId) {
    return [
      {
        modelId: item.modelId,
        versionId: item.versionId,
        customVersion: item.customVersion,
        key: modelRefKey({ modelId: item.modelId, versionId: item.versionId }),
      },
    ];
  }
  const custom = item.customModel?.trim();
  if (custom) return [{ customModel: custom, key: `custom:${custom}` }];
  return [];
}

/** All model labels for a tool, joined for profile lists (e.g. "Opus 4.6, Sonnet 4.5"). */
export function itemModelLabels(
  item: SelectedItem,
  options: { full?: boolean; separator?: string } = {},
): string | undefined {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  const sep = options.separator ?? ", ";
  const labels = itemModels(item)
    .map((m) => {
      if (m.modelId) {
        return catalog.formatModel(
          m.modelId,
          item.showVersion ? m.versionId : undefined,
          options.full ? undefined : tool?.providerId,
          item.showVersion ? m.customVersion : undefined,
        );
      }
      return m.customModel?.trim() || undefined;
    })
    .filter((l): l is string => Boolean(l));
  return labels.length ? labels.join(sep) : undefined;
}

/** Model label as shown on the badge, honoring the "show version" preference. */
export function itemModelLabel(item: SelectedItem, options: { full?: boolean } = {}): string | undefined {
  return itemModelLabels(item, { ...options, separator: ", " });
}

/** Provider attribution shown when no model is chosen. */
export function itemAttribution(item: SelectedItem): string {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  if (!tool) return "Custom tool";
  const provider = catalog.provider(tool.providerId);
  if (!provider) return tool.descriptor;
  const toolName = normalize(tool.name);
  const providerName = normalize(provider.name);
  if (toolName.includes(providerName) || providerName.includes(toolName)) return tool.descriptor;
  return provider.name;
}

export function toolIconSlug(tool: CatalogTool | undefined): string | undefined {
  if (!tool) return undefined;
  return tool.iconSlug ?? catalog.provider(tool.providerId)?.iconSlug;
}

export function monogramFor(label: string): string {
  const words = label
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

const CATEGORY_ORDER = catalog.categories().map((c) => c.id);

function categoryRank(item: SelectedItem): number {
  const rank = item.categoryId ? CATEGORY_ORDER.indexOf(item.categoryId) : -1;
  return rank < 0 ? CATEGORY_ORDER.length : rank;
}

/** Badge order: catalog category order, then selection order within a category. One badge per selection. */
export function orderedItems(state: Pick<StackState, "items">): SelectedItem[] {
  return state.items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => categoryRank(a.item) - categoryRank(b.item) || a.index - b.index)
    .map(({ item }) => item);
}

export function deriveBadges(state: Pick<StackState, "items" | "primaryId">): BadgeData[] {
  return orderedItems(state).map((item) => {
    const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
    const label = itemLabel(item);
    return {
      id: item.id,
      label,
      sublabel: itemModelLabel(item) ?? itemAttribution(item),
      iconSlug: toolIconSlug(tool),
      monogram: monogramFor(label),
      isPrimary: item.id === state.primaryId,
    };
  });
}

/** Full label of the primary selection, e.g. "Claude Opus 4.5". */
export function primaryModelLabel(state: Pick<StackState, "items" | "primaryId">): string | undefined {
  const item = state.items.find((i) => i.id === state.primaryId);
  if (!item) return undefined;
  return itemModelLabel(item, { full: true }) ?? itemLabel(item);
}

/** "Model" for first-party tools (Claude), "Preferred model" for multi-model tools (Cursor). */
export function modelFieldLabel(item: SelectedItem): string {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  if (!tool) return "Model";
  const models = catalog.modelsForTool(tool.id);
  return models.every((m) => m.providerId === tool.providerId) ? "Model" : "Preferred model";
}

/** Items owned by a category card: the card they were picked from. */
export function itemsInCategory(state: Pick<StackState, "items">, categoryId: CategoryId): SelectedItem[] {
  return state.items.filter((i) => i.categoryId === categoryId);
}

const MODEL_ON_DEMAND: CategoryId[] = ["automation", "research"];

/**
 * How prominently the builder offers model choice for an item:
 * - "inline": shown right under the tool choices (assistants, coding tools, local runtimes, creative models)
 * - "on-demand": only behind a small "+ model" link (workflow tools, custom tools)
 * - "none": the tool has no model catalog
 */
export function modelPickerMode(item: SelectedItem): "inline" | "on-demand" | "none" {
  if (!item.toolId) return "on-demand";
  const tool = catalog.tool(item.toolId);
  if (!tool || catalog.modelsForTool(tool.id).length === 0) return "none";
  return tool.categories.every((c) => MODEL_ON_DEMAND.includes(c)) ? "on-demand" : "inline";
}

/** Whether an item can carry a model selection (and therefore be the primary model). */
export function supportsModels(item: SelectedItem): boolean {
  if (!item.toolId) return true;
  return catalog.modelsForTool(item.toolId).length > 0;
}

export const EXAMPLE_STATE: Pick<StackState, "items" | "primaryId"> = {
  primaryId: "claude",
  items: [
    { id: "claude", toolId: "claude", categoryId: "daily", modelId: "claude-opus", versionId: "4.5", showVersion: true },
    { id: "cursor", toolId: "cursor", categoryId: "coding", modelId: "claude-sonnet", versionId: "4.5", showVersion: true },
    { id: "n8n", toolId: "n8n", categoryId: "automation", showVersion: true },
    { id: "midjourney", toolId: "midjourney", categoryId: "creative", modelId: "midjourney", versionId: "v7", showVersion: true },
    { id: "notebooklm", toolId: "notebooklm", categoryId: "research", showVersion: true },
    { id: "ollama", toolId: "ollama", categoryId: "local", modelId: "qwen", versionId: "3", showVersion: true },
  ],
};
