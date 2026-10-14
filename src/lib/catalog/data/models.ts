import type { CatalogModel } from "../types";

/**
 * Curated snapshot of popular model families. Versions live only here (or in a future
 * remote adapter) — rendering code formats them through the catalog adapter.
 */
export const MODELS: CatalogModel[] = [
  {
    id: "claude-opus",
    name: "Claude Opus",
    shortName: "Opus",
    providerId: "anthropic",
    defaultToolId: "claude",
    versions: [
      { id: "4.6", label: "4.6" },
      { id: "4.5", label: "4.5" },
      { id: "4.1", label: "4.1" },
      { id: "4", label: "4" },
    ],
    openRouterIds: [
      "anthropic/claude-opus-4.6",
      "anthropic/claude-opus-4.5",
      "anthropic/claude-opus-4.1",
      "anthropic/claude-opus-4",
    ],
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    shortName: "Sonnet",
    providerId: "anthropic",
    defaultToolId: "claude",
    versions: [
      { id: "4.6", label: "4.6" },
      { id: "4.5", label: "4.5" },
      { id: "4", label: "4" },
      { id: "3.7", label: "3.7" },
    ],
    openRouterIds: [
      "anthropic/claude-sonnet-4.6",
      "anthropic/claude-sonnet-4.5",
      "anthropic/claude-sonnet-4",
      "anthropic/claude-3.7-sonnet",
    ],
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku",
    shortName: "Haiku",
    providerId: "anthropic",
    defaultToolId: "claude",
    versions: [
      { id: "4.5", label: "4.5" },
      { id: "3.5", label: "3.5" },
    ],
  },
  {
    id: "gpt",
    name: "GPT",
    format: "GPT-{v}",
    providerId: "openai",
    defaultToolId: "chatgpt",
    aliases: ["gpt-5", "gpt5", "gpt-4o"],
    versions: [
      { id: "5.1", label: "5.1" },
      { id: "5", label: "5" },
      { id: "5-mini", label: "5 mini" },
      { id: "4.1", label: "4.1" },
      { id: "4o", label: "4o" },
    ],
    openRouterIds: ["openai/gpt-5.1", "openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-4.1", "openai/gpt-4o"],
  },
  {
    id: "openai-o",
    name: "OpenAI o-series",
    format: "OpenAI {v}",
    shortFormat: "{v}",
    providerId: "openai",
    defaultToolId: "chatgpt",
    aliases: ["o3", "o4-mini"],
    versions: [
      { id: "o3-pro", label: "o3-pro" },
      { id: "o3", label: "o3" },
      { id: "o4-mini", label: "o4-mini" },
    ],
  },
  {
    id: "gpt-codex",
    name: "GPT-Codex",
    format: "GPT-{v}",
    providerId: "openai",
    defaultToolId: "codex",
    versions: [
      { id: "5.1-codex", label: "5.1-Codex" },
      { id: "5-codex", label: "5-Codex" },
    ],
  },
  {
    id: "gpt-oss",
    name: "gpt-oss",
    format: "gpt-oss-{v}",
    providerId: "openai",
    defaultToolId: "ollama",
    versions: [
      { id: "120b", label: "120b" },
      { id: "20b", label: "20b" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    providerId: "google",
    defaultToolId: "gemini",
    versions: [
      { id: "3-pro", label: "3 Pro" },
      { id: "2.5-pro", label: "2.5 Pro" },
      { id: "2.5-flash", label: "2.5 Flash" },
    ],
    openRouterIds: ["google/gemini-3-pro-preview", "google/gemini-2.5-pro", "google/gemini-2.5-flash"],
  },
  {
    id: "gemma",
    name: "Gemma",
    providerId: "google",
    defaultToolId: "ollama",
    versions: [
      { id: "3", label: "3" },
      { id: "3n", label: "3n" },
    ],
  },
  {
    id: "grok",
    name: "Grok",
    providerId: "xai",
    defaultToolId: "grok",
    versions: [
      { id: "4", label: "4" },
      { id: "4-fast", label: "4 Fast" },
      { id: "3", label: "3" },
    ],
  },
  {
    id: "llama",
    name: "Llama",
    providerId: "meta",
    defaultToolId: "meta-ai",
    versions: [
      { id: "4-maverick", label: "4 Maverick" },
      { id: "4-scout", label: "4 Scout" },
      { id: "3.3-70b", label: "3.3 70B" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    providerId: "mistral",
    defaultToolId: "le-chat",
    versions: [
      { id: "medium-3", label: "Medium 3" },
      { id: "large-2", label: "Large 2" },
      { id: "small-3", label: "Small 3" },
    ],
  },
  {
    id: "codestral",
    name: "Codestral",
    providerId: "mistral",
    defaultToolId: "le-chat",
    versions: [{ id: "25.08", label: "25.08" }],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    providerId: "deepseek",
    defaultToolId: "deepseek-chat",
    versions: [
      { id: "v3.2", label: "V3.2" },
      { id: "v3.1", label: "V3.1" },
      { id: "r1", label: "R1" },
    ],
  },
  {
    id: "qwen",
    name: "Qwen",
    providerId: "alibaba",
    defaultToolId: "qwen-chat",
    versions: [
      { id: "3-max", label: "3 Max" },
      { id: "3", label: "3" },
      { id: "3-coder", label: "3 Coder" },
    ],
  },
  {
    id: "kimi",
    name: "Kimi",
    providerId: "moonshot",
    defaultToolId: "kimi",
    versions: [
      { id: "k2-thinking", label: "K2 Thinking" },
      { id: "k2", label: "K2" },
    ],
  },
  {
    id: "sonar",
    name: "Sonar",
    providerId: "perplexity",
    defaultToolId: "perplexity",
    versions: [
      { id: "pro", label: "Pro" },
      { id: "reasoning", label: "Reasoning" },
    ],
  },
  {
    id: "composer",
    name: "Composer",
    providerId: "anysphere",
    defaultToolId: "cursor",
    versions: [{ id: "1", label: "1" }],
  },
  {
    id: "swe",
    name: "SWE",
    format: "SWE-{v}",
    providerId: "cognition",
    defaultToolId: "windsurf",
    versions: [
      { id: "1.5", label: "1.5" },
      { id: "1", label: "1" },
    ],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    providerId: "midjourney",
    defaultToolId: "midjourney",
    versions: [
      { id: "v7", label: "V7" },
      { id: "v6.1", label: "V6.1" },
    ],
  },
  {
    id: "runway-gen",
    name: "Runway Gen",
    format: "Gen-{v}",
    shortFormat: "Gen-{v}",
    providerId: "runway",
    defaultToolId: "runway",
    versions: [
      { id: "4", label: "4" },
      { id: "3-alpha", label: "3 Alpha" },
    ],
  },
  {
    id: "eleven",
    name: "Eleven",
    format: "Eleven {v}",
    providerId: "elevenlabs",
    defaultToolId: "elevenlabs",
    versions: [
      { id: "v3", label: "v3" },
      { id: "multilingual-v2", label: "Multilingual v2" },
    ],
  },
  {
    id: "suno",
    name: "Suno",
    providerId: "suno",
    defaultToolId: "suno",
    versions: [
      { id: "v5", label: "v5" },
      { id: "v4.5", label: "v4.5" },
    ],
  },
  {
    id: "firefly",
    name: "Firefly Image",
    providerId: "adobe",
    defaultToolId: "firefly",
    versions: [
      { id: "5", label: "5" },
      { id: "4", label: "4" },
    ],
  },
  {
    id: "flux",
    name: "FLUX",
    providerId: "bfl",
    defaultToolId: "krea",
    versions: [
      { id: "1.1-pro", label: "1.1 Pro" },
      { id: "kontext", label: "Kontext" },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    providerId: "stability",
    defaultToolId: "stable-diffusion",
    versions: [
      { id: "3.5", label: "3.5" },
      { id: "xl", label: "XL" },
    ],
  },
  {
    id: "sora",
    name: "Sora",
    providerId: "openai",
    defaultToolId: "sora",
    versions: [{ id: "2", label: "2" }],
  },
  {
    id: "veo",
    name: "Veo",
    providerId: "google",
    defaultToolId: "veo",
    versions: [
      { id: "3.1", label: "3.1" },
      { id: "3", label: "3" },
    ],
  },
  {
    id: "kling",
    name: "Kling",
    providerId: "kuaishou",
    defaultToolId: "kling",
    versions: [
      { id: "2.5", label: "2.5" },
      { id: "2.1", label: "2.1" },
    ],
  },
];

/** Frontier chat/coding models commonly available inside third-party tools. */
export const FRONTIER_LLMS = [
  "claude-opus",
  "claude-sonnet",
  "claude-haiku",
  "gpt",
  "openai-o",
  "gemini",
  "grok",
  "deepseek",
  "qwen",
  "kimi",
];

/** Open-weight families typically run locally or via inference providers. */
export const OPEN_WEIGHT_LLMS = ["llama", "qwen", "deepseek", "gpt-oss", "gemma", "mistral", "kimi"];
