// SAMPLE DATA, for previews/Storybook only. Never import from production routes.
import type { AIProfile, CardTool } from "../lib/types";
import { PREVIEW_COPY } from "../lib/working-styles";

const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;

const T: Record<string, CardTool> = {
  claude:     { id: "claude", name: "Claude", model: "Opus 4.5", category: "Daily", logo: si("claude"), accent: "#E08A66" },
  claudeCode: { id: "claude-code", name: "Claude Code", model: "Opus 4.5", category: "Build", logo: si("claude"), accent: "#E5A36A" },
  cursor:     { id: "cursor", name: "Cursor", model: "Sonnet 4.5", category: "Build", logo: si("cursor"), accent: "#8F9BB3" },
  copilot:    { id: "github-copilot", name: "GitHub Copilot", model: "GPT-5", category: "Build", logo: si("githubcopilot"), accent: "#9AA3B8" },
  replit:     { id: "replit", name: "Replit", model: "Agent 3", category: "Build", logo: si("replit"), accent: "#F2A06B" },
  v0:         { id: "v0", name: "v0", category: "Build", logo: si("vercel"), accent: "#A8A59C" },
  n8n:        { id: "n8n", name: "n8n", category: "Automate", logo: si("n8n"), accent: "#EE8AA3" },
  zapier:     { id: "zapier", name: "Zapier", category: "Automate", logo: si("zapier"), accent: "#F2A27A" },
  make:       { id: "make", name: "Make", category: "Automate", logo: si("make"), accent: "#B49BE6" },
  notion:     { id: "notion-ai", name: "Notion AI", category: "Work", logo: si("notion"), accent: "#A8A59C" },
  perplexity: { id: "perplexity", name: "Perplexity", model: "Sonar Pro", category: "Research", logo: si("perplexity"), accent: "#6FB3B8" },
  gemini:     { id: "gemini", name: "Gemini", model: "3 Pro", category: "Research", logo: si("googlegemini"), accent: "#8FA8E0" },
  figma:      { id: "figma-make", name: "Figma Make", category: "Create", logo: si("figma"), accent: "#B79BE0" },
  framer:     { id: "framer-ai", name: "Framer AI", category: "Create", logo: si("framer"), accent: "#8FA3D6" },
  linear:     { id: "linear", name: "Linear", category: "Work", logo: si("linear"), accent: "#A3A8E0" },
  midjourney: { id: "midjourney", name: "Midjourney", model: "V7", category: "Create", accent: "#A79BD6" }, // no logo → monogram
};

const make = (id: keyof typeof PREVIEW_COPY, tools: CardTool[]): AIProfile => ({
  workingStyle: { id, ...PREVIEW_COPY[id] },
  tools,
});

export const SAMPLE_BUILDER = make("builder", [T.claudeCode, T.cursor, T.copilot, T.replit, T.v0, T.n8n]);
export const SAMPLE_STRATEGIST = make("strategist", [T.claude, T.perplexity, T.gemini, T.notion, T.linear]);
export const SAMPLE_CREATIVE = make("creative", [T.figma, T.framer, T.claude, T.gemini, T.notion, T.midjourney]);
export const SAMPLE_OPERATOR = make("operator", [T.n8n, T.zapier, T.make, T.claude, T.notion, T.linear]);
/** Stress test: 15 tools (card shows 5 + "+10 more"), a long tagline, and a tool without logo. */
export const SAMPLE_MANY = {
  ...make("generalist", Object.values(T).slice(0, 15)),
  workingStyle: { id: "generalist", title: "AI Generalist", tagline: "Picks the right model for every job, from research and writing to prototypes, automations and late-night side projects." },
};
export const SAMPLE_ONE_TOOL = make("specialist", [T.midjourney]);
