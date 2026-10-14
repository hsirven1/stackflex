// StackFlex tool data + card color helpers.
// Logos: Simple Icons CDN (https://simpleicons.org, CC0 icon data; logos remain trademarks of their owners).
// Tools without a Simple Icons entry use a monogram until you add an official SVG via `logoSrc`.

export type Tool = {
  id: string;
  name: string;
  version?: string;      // model / version, optional ("Opus 4.6")
  category: string;      // "Daily" | "Build" | "Automate" | "Create" | "Local" | ...
  aura: string;          // 6-digit hex, the tool's card color
  slug?: string;         // Simple Icons slug
  logoSrc?: string;      // local/official SVG, overrides slug
  monogram?: string;     // fallback when no logo
  models?: string[];     // optional model choices shown in the questionnaire
};

export const simpleIcon = (slug: string, color?: string) =>
  "https://cdn.simpleicons.org/" + slug + (color ? "/" + color : "");

export const logoFor = (t: Tool) => t.logoSrc ?? (t.slug ? simpleIcon(t.slug) : undefined);

// Exact alpha suffixes from the approved design.
export const cardColors = (aura: string) => ({
  tint: aura + "55",      // light card bottom tint (~33%)
  halo: aura + "48",      // light coin ring (~28%)
  tintDark: aura + "2E",  // dark card bottom tint (~18%)
  haloDark: aura + "66",  // dark coin ring (~40%)
});

// Example stack used in every approved mock (main card first).
export const EXAMPLE_STACK: Tool[] = [
  { id: "claude", name: "Claude", version: "Opus 4.6", category: "Daily", slug: "claude", aura: "#FF8A5B" },
  { id: "cursor", name: "Cursor", category: "Build", slug: "cursor", aura: "#6C7BFF" },
  { id: "claude-code", name: "Claude Code", version: "Opus 4.6", category: "Build", slug: "claude", aura: "#FFB06B",
    models: ["Opus 4.6", "Sonnet 4.5", "Haiku 4.5"] },
  { id: "n8n", name: "n8n", category: "Automate", slug: "n8n", aura: "#FF5C8A" },
  { id: "midjourney", name: "Midjourney", version: "V7", category: "Create", monogram: "M", aura: "#A88BFF" },
  { id: "ollama", name: "Ollama", version: "Qwen 3", category: "Local", slug: "ollama", aura: "#3FCB91" },
];

// Step 2 ("Build") options, in the approved order.
// TODO: aura colors marked NEUTRAL were not defined in the design. Pick one per tool from its brand color.
const NEUTRAL = "#A8A59C";
export const BUILD_OPTIONS: Tool[] = [
  EXAMPLE_STACK[1],
  EXAMPLE_STACK[2],
  { id: "codex", name: "Codex", category: "Build", monogram: "C", aura: NEUTRAL },
  { id: "lovable", name: "Lovable", category: "Build", monogram: "L", aura: NEUTRAL },
  { id: "github-copilot", name: "GitHub Copilot", category: "Build", slug: "githubcopilot", aura: NEUTRAL },
  { id: "windsurf", name: "Windsurf", category: "Build", monogram: "W", aura: NEUTRAL },
  { id: "replit", name: "Replit", category: "Build", slug: "replit", aura: NEUTRAL },
  { id: "v0", name: "v0", category: "Build", monogram: "v0", aura: NEUTRAL },
];

export const stackHeadline = (tools: Tool[]) =>
  tools.map((t) => (t.version ? t.name + " " + t.version : t.name)).join(" · ");
