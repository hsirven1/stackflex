import { catalog } from "@/lib/catalog/adapter";
import { monogramFor, toolIconSlug } from "@/lib/selection/derive";
import type { AIProfile, CardTool } from "@/components/stackflex/results/lib/types";
import { logoDataUrl } from "@/lib/stackflex/logoDataUrl";
import type { LandingSamples } from "./LandingShowcase";

/**
 * Display-only landing samples (Claude Design handoff).
 * Never written to selection/profile stores or localStorage.
 * Never imported by Results or export paths.
 */
function sampleCardTool(toolId: string, model?: string): CardTool {
  const tool = catalog.tool(toolId);
  if (!tool) {
    return {
      id: toolId,
      name: toolId,
      category: "Custom",
      monogram: monogramFor(toolId),
      ...(model ? { model } : {}),
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
    monogram: tool.monogram ?? monogramFor(tool.name),
    accent: tool.aura,
    ...(model ? { model } : {}),
  };
}

function sampleProfile(
  id: string,
  title: string,
  tagline: string,
  tools: Array<{ id: string; model?: string }>,
): AIProfile {
  const mapped = tools.map((t) => sampleCardTool(t.id, t.model));
  return {
    workingStyle: { id, title, tagline },
    tools: mapped,
    toolCount: mapped.length,
    categoryCount: new Set(mapped.map((t) => t.category)).size,
  };
}

const builder: AIProfile = sampleProfile(
  "builder",
  "AI Builder",
  "Ships real products, with AI as a co-builder.",
  [
    { id: "chatgpt", model: "GPT-5" },
    { id: "cursor", model: "Sonnet 4.5" },
    { id: "claude-code", model: "Opus 4.5" },
    { id: "codex", model: "GPT-5-Codex" },
    { id: "v0", model: "Vercel" },
    { id: "perplexity", model: "Sonar Pro" },
  ],
);

const strategist: AIProfile = sampleProfile(
  "strategist",
  "AI Strategist",
  "Sees the bigger picture and moves first.",
  [
    { id: "claude", model: "Opus 4.5" },
    { id: "perplexity", model: "Sonar Pro" },
    { id: "notion-ai" },
    { id: "gemini", model: "3 Pro" },
  ],
);

const orchestrator: AIProfile = sampleProfile(
  "orchestrator",
  "AI Orchestrator",
  "Connects models and agents into systems that run on their own.",
  [
    { id: "n8n" },
    { id: "zapier" },
    { id: "make" },
    { id: "claude", model: "Opus 4.5" },
  ],
);

export const LANDING_SAMPLES: LandingSamples = {
  main: builder,
  altLeft: strategist,
  altRight: orchestrator,
  person: {
    name: "Alex Morgan",
    headline: "Product Manager at Northwind",
    meta: "Paris, France · 500+ connections",
    initials: "AM",
  },
};
