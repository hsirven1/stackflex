import { catalog } from "@/lib/catalog/adapter";
import type { CatalogTool } from "@/lib/catalog/types";

/**
 * Curated discovery list for the All picker view.
 * Stable canonical IDs only — no fabricated rankings. Order is editorial.
 */
export const POPULAR_TOOL_IDS = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
  "copilot",
  "canva-ai",
  "notion-ai",
  "hubspot-breeze",
  "atlassian-rovo",
  "cursor",
  "claude-code",
  "shopify-sidekick",
] as const;

const POPULAR_ID_SET = new Set<string>(POPULAR_TOOL_IDS);

export function isPopularToolId(id: string): boolean {
  return POPULAR_ID_SET.has(id);
}

/** Tools from the curated list that exist in the live catalog, in editorial order. */
export function popularCatalogTools(): CatalogTool[] {
  const out: CatalogTool[] = [];
  for (const id of POPULAR_TOOL_IDS) {
    const tool = catalog.tool(id);
    if (tool) out.push(tool);
  }
  return out;
}
