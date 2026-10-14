import type { CatalogAdapter } from "./adapter";
import type { CatalogModel, SearchResult } from "./types";

/**
 * Groundwork for live model search via OpenRouter's public model list
 * (GET https://openrouter.ai/api/v1/models). Not wired into the UI in V0.1: no network
 * calls are made. To enable, wrap the local catalog with `withOpenRouterSearch` and have the
 * search UI merge `searchRemote` results behind a debounce.
 */

export interface OpenRouterModel {
  id: string; // e.g. "anthropic/claude-opus-4.1"
  name: string; // e.g. "Anthropic: Claude Opus 4.1"
  created?: number;
}

const OPENROUTER_PROVIDER_MAP: Record<string, string> = {
  anthropic: "anthropic",
  openai: "openai",
  google: "google",
  "meta-llama": "meta",
  mistralai: "mistral",
  "x-ai": "xai",
  deepseek: "deepseek",
  qwen: "alibaba",
  moonshotai: "moonshot",
  perplexity: "perplexity",
};

/** Map an OpenRouter model onto a catalog family + version, or a standalone model if unknown. */
export function mapOpenRouterModel(
  remote: OpenRouterModel,
  local: CatalogAdapter,
): { model: CatalogModel; versionId?: string } {
  for (const category of local.categories()) {
    for (const tool of local.toolsInCategory(category.id)) {
      for (const model of local.modelsForTool(tool.id)) {
        const index = model.openRouterIds?.indexOf(remote.id) ?? -1;
        if (index >= 0) return { model, versionId: model.versions[index]?.id };
      }
    }
  }
  const [vendor] = remote.id.split("/");
  const displayName = remote.name.includes(":") ? remote.name.split(":").slice(1).join(":").trim() : remote.name;
  return {
    model: {
      id: `openrouter:${remote.id}`,
      name: displayName,
      providerId: OPENROUTER_PROVIDER_MAP[vendor] ?? "openrouter",
      versions: [],
      defaultToolId: "openrouter",
      openRouterIds: [remote.id],
    },
  };
}

export function withOpenRouterSearch(
  local: CatalogAdapter,
  fetchModels: (signal?: AbortSignal) => Promise<OpenRouterModel[]>,
): CatalogAdapter {
  let cache: OpenRouterModel[] | null = null;
  return {
    ...local,
    id: "local+openrouter",
    async searchRemote(query, signal): Promise<SearchResult[]> {
      cache ??= await fetchModels(signal);
      const q = query.toLowerCase();
      return cache
        .filter((m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
        .slice(0, 10)
        .map((m) => {
          const { model, versionId } = mapOpenRouterModel(m, local);
          return { kind: "model" as const, model, versionId, score: 30 };
        });
    },
  };
}
