import type { CatalogAdapter } from "./adapter";
import type { CatalogModel, SearchResult } from "./types";

/**
 * Hybrid catalog: StackFlex owns the curated tool list and the consumer-facing model families in
 * `data/models.ts`. OpenRouter (GET https://openrouter.ai/api/v1/models) and similar provider APIs
 * list API-accessible models; they do not equal ChatGPT / Claude / Gemini app offerings.
 *
 * This module maps OpenRouter ids onto curated families via `openRouterIds`. Live search is opt-in:
 * wrap the local catalog with `withOpenRouterSearch` and merge `searchRemote` behind a debounce.
 * The questionnaire never calls the network on every render; if a remote fetch fails, the curated
 * list remains the last-known-good source of truth.
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
  "z-ai": "zhipu",
  zhipuai: "zhipu",
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
