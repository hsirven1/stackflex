import { catalog } from "@/lib/catalog/adapter";
import { toolIconSlug, monogramFor } from "@/lib/selection/derive";
import type { AIProfile, CardTool } from "@/components/stackflex/results/lib/types";
import { logoDataUrl } from "./logoDataUrl";

/**
 * Display-only samples for the landing hero.
 * Never written to selection/profile stores or localStorage.
 */
function sampleCardTool(toolId: string): CardTool {
  const tool = catalog.tool(toolId);
  if (!tool) {
    return {
      id: toolId,
      name: toolId,
      category: "Custom",
      monogram: monogramFor(toolId),
    };
  }
  const categoryId = tool.categories[0];
  const category =
    (categoryId && catalog.category(categoryId)?.cardLabel) || tool.descriptor || "AI";
  const logo = logoDataUrl(toolIconSlug(tool));
  return {
    id: tool.id,
    name: tool.name,
    category,
    ...(logo ? { logo } : {}),
    monogram: monogramFor(tool.name),
    accent: tool.aura,
  };
}

function sampleProfile(
  id: string,
  title: string,
  tagline: string,
  toolIds: string[],
): AIProfile {
  const tools = toolIds.map(sampleCardTool);
  return {
    workingStyle: { id, title, tagline },
    tools,
    toolCount: tools.length,
    categoryCount: new Set(tools.map((t) => t.category)).size,
  };
}

/** Front card of the landing deck — AI Builder with six realistic tools. */
export const LANDING_SAMPLE_PROFILE: AIProfile = {
  role: "Product Manager",
  ...sampleProfile("builder", "AI Builder", "Builds applications and prototypes with AI.", [
    "chatgpt",
    "cursor",
    "claude-code",
    "codex",
    "lovable",
    "replit",
  ]),
};

/** Cards fanned behind the hero. Left is Creative; right is Strategist. */
export const LANDING_DECK_BACK: AIProfile[] = [
  sampleProfile("creative", "AI Creative", "Creates visual, audio, and written work with AI.", [
    "figma-ai",
    "midjourney",
    "runway",
    "firefly",
  ]),
  sampleProfile("strategist", "AI Strategist", "Applies AI to decisions and day-to-day professional work.", [
    "claude",
    "perplexity",
    "notion-ai",
  ]),
];
