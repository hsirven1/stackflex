/**
 * Curated multi-tool activity suggestions.
 * Shown only when every listed tool ID is present in the user's stack.
 * Labels describe complementary use — not product integrations or workflows.
 */
export type MultiToolSuggestion = {
  /** Stable activity id for selection/persistence keys. */
  id: string;
  label: string;
  toolIds: string[];
  /** Higher = preferred in the unified ranking. */
  priority: number;
  /** Rough domain for variety balancing. */
  domain:
    | "build"
    | "write"
    | "research"
    | "create"
    | "automate"
    | "productivity";
};

export const MULTI_TOOL_SUGGESTIONS: MultiToolSuggestion[] = [
  {
    id: "multi-build-fullstack",
    label: "Build full-stack applications",
    toolIds: ["claude-code", "cursor"],
    priority: 100,
    domain: "build",
  },
  {
    id: "multi-prototype-product",
    label: "Prototype product ideas",
    toolIds: ["chatgpt", "cursor"],
    priority: 96,
    domain: "build",
  },
  {
    id: "multi-brainstorm-product",
    label: "Brainstorm product ideas",
    toolIds: ["chatgpt", "claude"],
    priority: 94,
    domain: "write",
  },
  {
    id: "multi-research-summarize",
    label: "Research and summarize information",
    toolIds: ["claude", "perplexity"],
    priority: 90,
    domain: "research",
  },
  {
    id: "multi-analyze-docs",
    label: "Analyze documents and data",
    toolIds: ["chatgpt", "claude"],
    priority: 88,
    domain: "research",
  },
  {
    id: "multi-write-refine",
    label: "Draft and refine professional writing",
    toolIds: ["chatgpt", "claude"],
    priority: 86,
    domain: "write",
  },
  {
    id: "multi-design-iterate",
    label: "Iterate on design concepts",
    toolIds: ["chatgpt", "canva-ai"],
    priority: 84,
    domain: "create",
  },
  {
    id: "multi-marketing-content",
    label: "Draft marketing content",
    toolIds: ["chatgpt", "hubspot-breeze"],
    priority: 82,
    domain: "write",
  },
  {
    id: "multi-code-review",
    label: "Review and improve code",
    toolIds: ["claude", "cursor"],
    priority: 80,
    domain: "build",
  },
  {
    id: "multi-automate-ops",
    label: "Automate recurring workflows",
    toolIds: ["chatgpt", "n8n"],
    priority: 78,
    domain: "automate",
  },
  {
    id: "multi-commerce-ops",
    label: "Plan store and catalog updates",
    toolIds: ["chatgpt", "shopify-sidekick"],
    priority: 76,
    domain: "productivity",
  },
  {
    id: "multi-project-docs",
    label: "Organize project notes and docs",
    toolIds: ["claude", "notion-ai"],
    priority: 74,
    domain: "productivity",
  },
];
