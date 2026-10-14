import { CATEGORIES } from "./data/categories";
import { MODELS } from "./data/models";
import { PROVIDERS } from "./data/providers";
import { TOOLS } from "./data/tools";
import type {
  CatalogModel,
  CatalogTool,
  Category,
  CategoryId,
  Provider,
  SearchResult,
} from "./types";

export interface SearchOptions {
  limit?: number;
  /** Boost results from this category without excluding others. */
  preferCategory?: CategoryId;
  includeModels?: boolean;
}

/**
 * Read interface between the UI and catalog data. The local adapter is synchronous; a remote
 * adapter (e.g. OpenRouter live model search) can implement `searchRemote` and merge results.
 */
export interface CatalogAdapter {
  readonly id: string;
  categories(): Category[];
  category(id: CategoryId): Category | undefined;
  tool(id: string): CatalogTool | undefined;
  model(id: string): CatalogModel | undefined;
  provider(id: string): Provider | undefined;
  toolsInCategory(id: CategoryId): CatalogTool[];
  modelsForTool(toolId: string): CatalogModel[];
  search(query: string, options?: SearchOptions): SearchResult[];
  searchRemote?(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
  /** Exact name/alias match, used to avoid creating custom duplicates of catalog tools. */
  resolveToolByName(name: string): CatalogTool | undefined;
  /**
   * Human label for a model selection. `hostProviderId` enables short names ("Opus 4.5" inside
   * Claude). `customVersion` formats a user-entered version not in the catalog.
   */
  formatModel(
    modelId: string,
    versionId?: string,
    hostProviderId?: string,
    customVersion?: string,
  ): string | undefined;
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textScore(query: string, candidate: string): number {
  const c = normalize(candidate);
  if (!c) return 0;
  if (c === query) return 100;
  if (c.startsWith(query)) return 75;
  if (c.split(" ").some((word) => word.startsWith(query))) return 60;
  if (c.replace(/ /g, "").includes(query.replace(/ /g, ""))) return 40;
  return 0;
}

function bestScore(query: string, candidates: (string | undefined)[], weight = 1): number {
  let best = 0;
  for (const candidate of candidates) {
    if (!candidate) continue;
    best = Math.max(best, textScore(query, candidate) * weight);
  }
  return best;
}

export function createLocalCatalog(data: {
  categories: Category[];
  tools: CatalogTool[];
  models: CatalogModel[];
  providers: Provider[];
}): CatalogAdapter {
  const toolById = new Map(data.tools.map((t) => [t.id, t]));
  const modelById = new Map(data.models.map((m) => [m.id, m]));
  const providerById = new Map(data.providers.map((p) => [p.id, p]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));

  function formatModel(modelId: string, versionId?: string, hostProviderId?: string, customVersion?: string) {
    const model = modelById.get(modelId);
    if (!model) return undefined;
    const useShort = hostProviderId === model.providerId;
    const label =
      customVersion?.trim() || (versionId ? model.versions.find((v) => v.id === versionId)?.label : undefined);
    if (!label) return useShort && model.shortName ? model.shortName : model.name;
    const template = useShort
      ? (model.shortFormat ?? model.format ?? `${model.shortName ?? model.name} {v}`)
      : (model.format ?? `${model.name} {v}`);
    return template.replace("{v}", label);
  }

  return {
    id: "local",
    categories: () => data.categories,
    category: (id) => categoryById.get(id),
    tool: (id) => toolById.get(id),
    model: (id) => modelById.get(id),
    provider: (id) => providerById.get(id),
    toolsInCategory: (id) => data.tools.filter((t) => t.categories.includes(id)),
    modelsForTool(toolId) {
      const tool = toolById.get(toolId);
      return (tool?.modelIds ?? [])
        .map((id) => modelById.get(id))
        .filter((m): m is CatalogModel => Boolean(m));
    },
    resolveToolByName(name) {
      const q = normalize(name);
      if (!q) return undefined;
      return data.tools.find(
        (t) => normalize(t.name) === q || t.aliases?.some((a) => normalize(a) === q),
      );
    },
    formatModel,
    search(query, options = {}) {
      const q = normalize(query);
      if (!q) return [];
      const { limit = 8, preferCategory, includeModels = true } = options;
      const results: SearchResult[] = [];

      for (const tool of data.tools) {
        const provider = providerById.get(tool.providerId);
        let score = Math.max(
          bestScore(q, [tool.name]),
          bestScore(q, tool.aliases ?? [], 0.85),
          bestScore(q, [provider?.name], 0.5),
          bestScore(q, [tool.descriptor], 0.3),
        );
        if (score <= 0) continue;
        if (preferCategory && tool.categories.includes(preferCategory)) score += 8;
        results.push({ kind: "tool", tool, score });
      }

      if (includeModels) {
        for (const model of data.models) {
          const familyScore = Math.max(
            bestScore(q, [model.name, model.shortName], 0.9),
            bestScore(q, model.aliases ?? [], 0.8),
          );
          let matchedVersion: string | undefined;
          let versionScore = 0;
          for (const version of model.versions) {
            if (!q.includes(normalize(version.label))) continue;
            const full = formatModel(model.id, version.id) ?? "";
            const short = formatModel(model.id, version.id, model.providerId) ?? "";
            const s = bestScore(q, [full, short], 0.95);
            if (s > versionScore) {
              versionScore = s;
              matchedVersion = version.id;
            }
          }
          const useVersion = versionScore > familyScore;
          const score = useVersion ? versionScore : familyScore;
          if (score <= 0) continue;
          results.push({
            kind: "model",
            model,
            versionId: useVersion ? matchedVersion : undefined,
            score: score - 2,
          });
        }
      }

      return results.sort((a, b) => b.score - a.score).slice(0, limit);
    },
  };
}

export const catalog: CatalogAdapter = createLocalCatalog({
  categories: CATEGORIES,
  tools: TOOLS,
  models: MODELS,
  providers: PROVIDERS,
});
