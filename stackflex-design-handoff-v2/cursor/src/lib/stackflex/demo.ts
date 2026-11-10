// Demo fixtures used by the approved mocks and the landing page example.
// Do NOT import from questionnaire/results production paths: pass the user's real stack instead.
import type { Tool } from "./tools";

// Example stack used in every approved mock (Main first). Also the landing page example stack.
export const EXAMPLE_STACK: Tool[] = [
  { id: "claude", name: "Claude", version: "Opus 4.6", category: "Daily", slug: "claude", aura: "#E08A66" },
  { id: "cursor", name: "Cursor", category: "Build", slug: "cursor", aura: "#8F9BB3" },
  { id: "claude-code", name: "Claude Code", version: "Opus 4.6", category: "Build", slug: "claude", aura: "#E5A36A",
    models: ["Opus 4.6", "Sonnet 4.5", "Haiku 4.5"] },
  { id: "n8n", name: "n8n", category: "Automate", slug: "n8n", aura: "#EE8AA3" },
  { id: "midjourney", name: "Midjourney", version: "V7", category: "Create", monogram: "M", aura: "#A79BD6" },
  { id: "ollama", name: "Ollama", version: "Qwen 3", category: "Local", slug: "ollama", aura: "#A3B8AE" },
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

