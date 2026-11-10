// MOCK DATA ONLY: used by the landing showcase, Storybook and screenshots.
// Never import this from the public profile route or the Results page.
import type { ProfileData, ProfileTool } from "./profile";

const t = (o: ProfileTool) => o;

export const MOCK_TOOLS: ProfileTool[] = [
  t({ id: "claude", name: "Claude", version: "Opus 4.5", category: "Daily", aura: "#E08A66", slug: "claude", section: "apps" }),
  t({ id: "chatgpt", name: "ChatGPT", version: "GPT-5", category: "Daily", aura: "#8FB3A3", monogram: "G", section: "apps" }),
  t({ id: "gemini", name: "Gemini", version: "3 Pro", category: "Research", aura: "#8FA8E0", slug: "googlegemini", section: "apps" }),
  t({ id: "perplexity", name: "Perplexity", version: "Sonar Pro", category: "Research", aura: "#6FB3B8", slug: "perplexity", section: "apps" }),
  t({ id: "midjourney", name: "Midjourney", version: "V7", category: "Create", aura: "#A79BD6", monogram: "M", section: "apps" }),
  t({ id: "meta-ai", name: "Meta AI", version: "Llama 4 Scout", category: "Daily", aura: "#8FA3D6", slug: "meta", section: "apps" }),
  t({ id: "le-chat", name: "Le Chat", version: "Mistral Large 2", category: "Daily", aura: "#E8A27C", monogram: "L", section: "apps" }),
  t({ id: "deepseek", name: "DeepSeek", version: "V3.2", category: "Research", aura: "#8C9FD9", monogram: "D", section: "apps" }),
  t({ id: "cursor", name: "Cursor", version: "Claude Sonnet 4.5", category: "Build", aura: "#8F9BB3", slug: "cursor", section: "software" }),
  t({ id: "claude-code", name: "Claude Code", version: "Opus 4.5", category: "Build", aura: "#E5A36A", slug: "claude", section: "software" }),
  t({ id: "n8n", name: "n8n", category: "Automate", aura: "#EE8AA3", slug: "n8n", section: "software" }),
  t({ id: "notion-ai", name: "Notion AI", category: "Work", aura: "#A8A59C", slug: "notion", section: "software" }),
  t({ id: "figma-make", name: "Figma Make", category: "Create", aura: "#B79BE0", slug: "figma", section: "software" }),
  t({ id: "github-copilot", name: "GitHub Copilot", version: "GPT-5", category: "Build", aura: "#9AA3B8", slug: "githubcopilot", section: "software" }),
  t({ id: "ollama", name: "Ollama", version: "Qwen 3", category: "Local", aura: "#A3B8AE", slug: "ollama", section: "software" }),
];

const pick = (...ids: string[]) => ids.map((id) => MOCK_TOOLS.find((x) => x.id === id)!);

export const MOCK_ACTIVITIES = [
  { id: "a1", title: "Brainstorm product ideas", toolIds: ["claude", "chatgpt", "perplexity"] },
  { id: "a2", title: "Build full-stack applications", toolIds: ["claude-code", "cursor", "chatgpt"] },
  { id: "a3", title: "Analyze customer feedback", toolIds: ["claude", "notion-ai", "gemini"] },
  { id: "a4", title: "Automate marketing outreach", toolIds: ["n8n", "chatgpt"] },
  { id: "a5", title: "Create presentation visuals", toolIds: ["midjourney", "figma-make"] },
];

const identity = { name: "Maya Chen", title: "Product Designer at Northbeam" };

/** 8 tools (5 apps + 3 software), 4 activities: the approved desktop reference (1d). */
export const MOCK_PROFILE_8: ProfileData = {
  identity,
  tools: pick("claude", "chatgpt", "gemini", "perplexity", "midjourney", "cursor", "claude-code", "n8n"),
  activities: MOCK_ACTIVITIES.slice(0, 4),
};
/** 15 tools, 5 activities (1e). */
export const MOCK_PROFILE_15: ProfileData = { identity, tools: MOCK_TOOLS, activities: MOCK_ACTIVITIES };
/** 3 tools, 2 activities (1f). */
export const MOCK_PROFILE_3: ProfileData = { identity, tools: pick("claude", "gemini", "cursor"), activities: MOCK_ACTIVITIES.slice(0, 2) };
/** Landing showcase (1i): 4 apps + 2 software, no activities. */
export const MOCK_PROFILE_SHOWCASE: ProfileData = {
  identity,
  tools: pick("claude", "chatgpt", "gemini", "perplexity", "cursor", "claude-code"),
  activities: [],
};
