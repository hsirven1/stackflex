// Landing page sample content. Marketing data only: never import into the Results page or exports.
// Logos: use the app's catalog paths (self-hosted). The simpleicons URLs below are placeholders.
import type { AIProfile, CardTool } from "@/components/stackflex/results";
import type { LandingSamples } from "../components/LandingShowcase";

const si = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
const t = (id: string, name: string, accent: string, extra: Partial<CardTool> = {}): CardTool => ({ id, name, accent, category: "Sample", ...extra });

const builder: AIProfile = {
  workingStyle: { id: "builder", title: "AI Builder", tagline: "Ships real products, with AI as a co-builder." },
  tools: [
    t("chatgpt", "ChatGPT", "#7FC4A8", { model: "GPT-5", monogram: "G" }),       // TODO official logo
    t("cursor", "Cursor", "#8F9BB3", { model: "Sonnet 4.5", logo: si("cursor") }),
    t("claude-code", "Claude Code", "#E5A36A", { model: "Opus 4.5", logo: si("claude") }),
    t("codex", "Codex", "#9AA8C8", { model: "GPT-5-Codex", monogram: "Cx" }),     // TODO official logo
    t("v0", "v0", "#A8A59C", { model: "Vercel", logo: si("vercel") }),
    t("perplexity", "Perplexity", "#6FB3B8", { model: "Sonar Pro", logo: si("perplexity") }),
  ],
};

const strategist: AIProfile = {
  workingStyle: { id: "strategist", title: "AI Strategist", tagline: "Sees the bigger picture and moves first." },
  tools: [
    t("claude", "Claude", "#E08A66", { model: "Opus 4.5", logo: si("claude") }),
    t("perplexity", "Perplexity", "#6FB3B8", { model: "Sonar Pro", logo: si("perplexity") }),
    t("notion-ai", "Notion AI", "#A8A59C", { logo: si("notion") }),
    t("gemini", "Gemini", "#8FA8E0", { model: "3 Pro", logo: si("googlegemini") }),
  ],
};

const orchestrator: AIProfile = {
  workingStyle: { id: "orchestrator", title: "AI Orchestrator", tagline: "Connects models and agents into systems that run on their own." },
  tools: [
    t("n8n", "n8n", "#EE8AA3", { logo: si("n8n") }),
    t("zapier", "Zapier", "#F2A27A", { logo: si("zapier") }),
    t("make", "Make", "#B49BE6", { logo: si("make") }),
    t("claude", "Claude", "#E08A66", { model: "Opus 4.5", logo: si("claude") }),
  ],
};

export const LANDING_SAMPLES: LandingSamples = {
  main: builder,
  altLeft: strategist,
  altRight: orchestrator,
  person: { name: "Alex Morgan", headline: "Product Manager at Northwind", meta: "Paris, France · 500+ connections", initials: "AM" },
};
