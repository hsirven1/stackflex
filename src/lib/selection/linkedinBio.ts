import type { CategoryId } from "@/lib/catalog/types";
import { CATEGORY_EMOJI, bioLength, bioPart, stripEmoji } from "./bio";
import { itemLabel, orderedItems } from "./derive";
import type { StackState } from "./types";

/** LinkedIn headline limit (characters / UTF-16 units). */
export const LINKEDIN_HEADLINE_LIMIT = 220;

export type LinkedInFormat = "headline" | "about";
export type LinkedInVisualStyle = "minimal" | "emojis" | "bold";

/** Neutral category labels — describe tool groups, not claimed expertise. */
const CATEGORY_PHRASE: Record<CategoryId, string> = {
  daily: "Thinking & research",
  coding: "Building",
  creative: "Creative",
  automation: "Automation",
  research: "Research",
  local: "Local AI",
};

/**
 * Tools that actually run models on-device / self-hosted.
 * Other tools in the catalog "local" bucket (Bedrock, Groq, OpenRouter, …) are cloud platforms —
 * do not label them "Local AI".
 */
const TRULY_LOCAL = new Set([
  "ollama",
  "lm-studio",
  "llama-cpp",
  "open-webui",
  "vllm",
]);

/** Emoji used to organize About / Bold layouts (one per category group). */
const CATEGORY_MARK: Record<CategoryId, string> = {
  daily: "🧠",
  coding: "🛠️",
  creative: "🎨",
  automation: "⚡",
  research: "🔎",
  local: "🖥️",
};

/** Bolder mark for the Bold style (still one per category). */
const CATEGORY_BOLD: Record<CategoryId, string> = {
  daily: "🤖",
  coding: "💻",
  creative: "🎨",
  automation: "⚡",
  research: "🔎",
  local: "🖥️",
};

interface ToolGroup {
  categoryId: CategoryId | null;
  toolIds: string[];
  /** Display names without models for About clarity; headlines may use fuller bioPart. */
  names: string[];
  /** Fuller labels (with models when set) for Minimal headline lists. */
  parts: string[];
}

/** Phrase + mark that do not over-claim when catalog category metadata is a poor fit. */
function groupPhrase(g: ToolGroup): string {
  if (!g.categoryId) return "Tools I use";
  if (g.categoryId === "local") {
    const allLocal = g.toolIds.length > 0 && g.toolIds.every((id) => TRULY_LOCAL.has(id));
    return allLocal ? "Local AI" : "Models & platforms";
  }
  return CATEGORY_PHRASE[g.categoryId];
}

function groupMark(g: ToolGroup, bold = false): string {
  if (!g.categoryId) return "•";
  if (g.categoryId === "local") {
    const allLocal = g.toolIds.length > 0 && g.toolIds.every((id) => TRULY_LOCAL.has(id));
    if (!allLocal) return "☁️";
  }
  return bold ? CATEGORY_BOLD[g.categoryId] : CATEGORY_MARK[g.categoryId];
}

type Stack = Pick<StackState, "items">;

/** Unique tools in badge order, grouped by category. Each tool appears once. */
export function linkedInGroups(state: Stack): ToolGroup[] {
  const seen = new Set<string>();
  const out: ToolGroup[] = [];
  for (const item of orderedItems(state)) {
    const name = itemLabel(item);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const part = bioPart(item);
    const toolId = item.toolId ?? "";
    const last = out.at(-1);
    if (last && last.categoryId === item.categoryId) {
      last.names.push(name);
      last.parts.push(part);
      if (toolId) last.toolIds.push(toolId);
    } else {
      out.push({
        categoryId: item.categoryId,
        toolIds: toolId ? [toolId] : [],
        names: [name],
        parts: [part],
      });
    }
  }
  return out;
}

function flatNames(groups: ToolGroup[]): string[] {
  return groups.flatMap((g) => g.names);
}

function flatParts(groups: ToolGroup[]): string[] {
  return groups.flatMap((g) => g.parts);
}

function titlePrefix(professionalTitle: string | undefined): string {
  const t = professionalTitle?.replace(/\s+/g, " ").trim();
  return t ? t : "";
}

/**
 * Shorten a headline to the LinkedIn limit without cutting a tool name mid-word.
 * Drops models first, then trailing tools as "+N more".
 */
function fitHeadline(candidates: string[]): string {
  for (const text of candidates) {
    if (bioLength(text, "linkedin") <= LINKEDIN_HEADLINE_LIMIT) return text;
  }
  return candidates.at(-1) ?? "";
}

function headlineMinimal(groups: ToolGroup[], title: string): string {
  const prefix = title ? `${title} | ` : "";
  const parts = flatParts(groups);
  const names = flatNames(groups);
  if (parts.length === 0) return title || "";

  const candidates: string[] = [];
  candidates.push(`${prefix}AI toolkit · ${parts.join(" · ")}`);
  candidates.push(`${prefix}${parts.join(" · ")}`);
  for (let keep = names.length; keep >= 1; keep--) {
    const body =
      keep === names.length
        ? names.join(" · ")
        : `${names.slice(0, keep).join(" · ")} · +${names.length - keep} more`;
    candidates.push(`${prefix}AI toolkit · ${body}`);
    candidates.push(`${prefix}${body}`);
  }
  if (title) candidates.push(title);
  return fitHeadline(candidates);
}

function headlineEmojis(groups: ToolGroup[], title: string): string {
  const prefix = title ? `${title} | ` : "";
  if (groups.length === 0) return title || "";

  const withMarks = groups
    .map((g) => `${groupMark(g)} ${g.names.join(" · ")}`)
    .join(" · ");

  const plain = flatNames(groups).join(" · ");
  const candidates = [
    `${prefix}${withMarks}`,
    `${prefix}AI toolkit · ${plain}`,
    ...shrinkNames(prefix, flatNames(groups)),
  ];
  if (title) candidates.push(title);
  return fitHeadline(candidates);
}

function headlineBold(groups: ToolGroup[], title: string): string {
  const names = flatNames(groups);
  if (names.length === 0) return title || "";
  const joined = names.join(" + ");
  const prefix = title ? `${title} · ` : "";
  const candidates = [
    `🚀 ${prefix}AI toolkit · ${joined}`,
    `🚀 AI toolkit · ${joined}`,
    `${prefix}${joined}`,
    ...shrinkNames(prefix, names, " + "),
  ];
  if (title) candidates.push(`🚀 ${title}`);
  return fitHeadline(candidates.map(stripLeadingDoubleSpace));
}

function shrinkNames(prefix: string, names: string[], sep = " · "): string[] {
  const out: string[] = [];
  for (let keep = names.length - 1; keep >= 1; keep--) {
    out.push(`${prefix}${names.slice(0, keep).join(sep)}${sep}+${names.length - keep} more`);
  }
  if (names[0]) out.push(`${prefix}${names[0]}`);
  return out;
}

function stripLeadingDoubleSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function aboutMinimal(groups: ToolGroup[]): string {
  const names = flatNames(groups);
  if (names.length === 0) return "";
  return `My AI Stack\n${names.join(" · ")}`;
}

function aboutEmojis(groups: ToolGroup[]): string {
  if (groups.length === 0) return "";
  const lines = groups.map((g) => `${groupMark(g)} ${g.names.join(" · ")} | ${groupPhrase(g)}`);
  return `✦ My AI Stack\n\n${lines.join("\n")}`;
}

function aboutBold(groups: ToolGroup[]): string {
  if (groups.length === 0) return "";
  const lines = groups.map((g) => `${groupMark(g, true)} ${g.names.join(" + ")}`);
  return `🚀 MY AI TOOLKIT\n\n${lines.join("\n")}\n\n✨ Building smarter with AI`;
}

/**
 * Plain-text LinkedIn Headline or About from the real stack.
 * Never invents skills; optional professional title only prefixes the headline.
 */
export function buildLinkedInBio(
  state: Stack,
  format: LinkedInFormat,
  style: LinkedInVisualStyle,
  professionalTitle?: string,
): string {
  const groups = linkedInGroups(state);
  if (groups.length === 0) return "";
  const title = titlePrefix(professionalTitle);

  if (format === "headline") {
    if (style === "minimal") return headlineMinimal(groups, title);
    if (style === "emojis") return headlineEmojis(groups, title);
    return headlineBold(groups, title);
  }

  if (style === "minimal") return aboutMinimal(groups);
  if (style === "emojis") return aboutEmojis(groups);
  return aboutBold(groups);
}

/** Re-export category emoji map for any shared callers. */
export { CATEGORY_EMOJI };

/** Items helper for tests / UI that need the raw selection count. */
export function linkedInToolCount(state: Stack): number {
  return linkedInGroups(state).reduce((n, g) => n + g.names.length, 0);
}

/** Count LinkedIn headline length the same way as other bios. */
export function linkedInHeadlineLength(text: string): number {
  return bioLength(text, "linkedin");
}

/** Strip emoji helper for callers that need a clean variant. */
export function linkedInStripEmoji(text: string): string {
  return stripEmoji(text);
}

/** Default visual style per format. */
export function defaultLinkedInStyle(format: LinkedInFormat): LinkedInVisualStyle {
  return format === "about" ? "emojis" : "minimal";
}
