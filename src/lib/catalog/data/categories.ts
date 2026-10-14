import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  {
    id: "daily",
    name: "Daily AI",
    shortName: "Daily AI",
    cardLabel: "Daily",
    description: "The assistant you open first.",
    quickPicks: ["chatgpt", "claude", "gemini", "perplexity", "grok", "deepseek-chat", "copilot", "meta-ai"],
  },
  {
    id: "coding",
    name: "Coding & Building",
    shortName: "Coding",
    cardLabel: "Build",
    description: "Editors, agents and app builders.",
    quickPicks: ["cursor", "claude-code", "github-copilot", "codex", "windsurf", "lovable", "v0", "replit"],
  },
  {
    id: "creative",
    name: "Creative AI",
    shortName: "Creative",
    cardLabel: "Create",
    description: "Image, video, voice and music.",
    quickPicks: ["midjourney", "runway", "elevenlabs", "suno", "firefly", "sora", "veo", "kling"],
  },
  {
    id: "automation",
    name: "Automation & Agents",
    shortName: "Automation",
    cardLabel: "Automate",
    description: "Workflows and agent frameworks.",
    quickPicks: ["n8n", "zapier", "make", "langchain", "crewai", "mcp", "dify"],
  },
  {
    id: "research",
    name: "Research & Productivity",
    shortName: "Research",
    cardLabel: "Research",
    description: "Notes, reading, writing and meetings.",
    quickPicks: ["notebooklm", "notion-ai", "granola", "deepl", "gamma", "grammarly", "elicit"],
  },
  {
    id: "local",
    name: "Local & Infrastructure",
    shortName: "Local",
    cardLabel: "Local",
    description: "Run, host and route models.",
    quickPicks: ["ollama", "lm-studio", "hugging-face", "openrouter", "vllm", "groq", "llama-cpp", "open-webui"],
  },
];
