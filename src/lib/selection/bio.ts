import { catalog } from "@/lib/catalog/adapter";
import type { CategoryId } from "@/lib/catalog/types";
import { itemLabel, itemModelLabel, orderedItems } from "./derive";
import type { SelectedItem, StackState } from "./types";

export const BIO_LIMITS = { linkedin: 220, x: 160 } as const;
export type BioPlatform = keyof typeof BIO_LIMITS;
export type BioStyle = "expressive" | "clean";

/** Single-codepoint emoji with default emoji presentation, so no variation selector is needed. */
export const CATEGORY_EMOJI: Record<CategoryId, string> = {
  daily: "🤖",
  coding: "💻",
  creative: "🎨",
  automation: "⚡",
  research: "🔎",
  local: "🧠",
};

const SEPARATOR: Record<BioStyle, string> = { expressive: " · ", clean: " | " };

/** Removes emoji (including any typed into custom names) for emoji-free outputs. */
export function stripEmoji(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Claude Opus 4.6", "Cursor (Claude Sonnet 4.6)" or just "n8n". */
export function bioPart(item: SelectedItem): string {
  const label = itemLabel(item);
  const model = itemModelLabel(item, { full: true });
  if (!model) return label;
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  const modelProvider = item.modelId ? catalog.model(item.modelId)?.providerId : undefined;
  // "Claude (Claude Opus 4.5)" reads poorly; the model name already carries the brand.
  if (tool && modelProvider === tool.providerId && model.toLowerCase().startsWith(label.toLowerCase())) {
    return model;
  }
  return `${label} (${model})`;
}

/**
 * Length as X counts it: most Latin, punctuation and symbol characters weigh 1, everything
 * else (CJK, emoji) weighs 2.
 */
export function xLength(text: string): number {
  let length = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const light =
      code <= 4351 || (code >= 8192 && code <= 8205) || (code >= 8208 && code <= 8223) || (code >= 8242 && code <= 8247);
    length += light ? 1 : 2;
  }
  return length;
}

/** X weighs emoji double; LinkedIn is counted in UTF-16 units, where most emoji are also 2. */
export function bioLength(text: string, platform: BioPlatform): number {
  return platform === "x" ? xLength(text) : text.length;
}

/** "🤖 Claude Opus 4.6 · 💻 Cursor + Claude Code · Custom tool": one emoji per category group. */
function withCategoryEmoji(items: SelectedItem[], separator: string): string {
  const groups: { categoryId: SelectedItem["categoryId"]; parts: string[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && item.categoryId && last.categoryId === item.categoryId) last.parts.push(bioPart(item));
    else groups.push({ categoryId: item.categoryId, parts: [bioPart(item)] });
  }
  return groups
    .map(({ categoryId, parts }) => (categoryId ? `${CATEGORY_EMOJI[categoryId]} ` : "") + parts.join(" + "))
    .join(separator);
}

/**
 * Tool list sized to the platform limit. Shortens deterministically until it fits: category
 * emoji go first, then model names from the end (tool names stay whole), then trailing tools
 * become "+N more". Clean output never contains emoji.
 */
export function buildBio(
  state: Pick<StackState, "items">,
  platform: BioPlatform,
  style: BioStyle = "clean",
): string {
  const seen = new Set<string>();
  const items = orderedItems(state).filter((item) => {
    const key = bioPart(item).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (items.length === 0) return "";

  const separator = SEPARATOR[style];
  const finish = (text: string) => (style === "clean" ? stripEmoji(text) : text);
  const fits = (text: string) => bioLength(text, platform) <= BIO_LIMITS[platform];
  const candidates = function* () {
    if (style === "expressive") yield withCategoryEmoji(items, separator);
    for (let keep = items.length; keep >= 0; keep--) {
      yield items.map((item, i) => (i < keep ? bioPart(item) : itemLabel(item))).join(separator);
    }
    const names = items.map(itemLabel);
    for (let count = names.length - 1; count > 0; count--) {
      yield `${names.slice(0, count).join(separator)}${separator}+${names.length - count} more`;
    }
    yield names[0];
  };

  let text = "";
  for (const candidate of candidates()) {
    text = finish(candidate);
    if (fits(text)) break;
  }
  return text;
}
