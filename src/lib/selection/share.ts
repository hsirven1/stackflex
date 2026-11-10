import type { CategoryId } from "@/lib/catalog/types";
import { bioPart, xLength } from "./bio";
import { itemLabel, orderedItems } from "./derive";
import type { SelectedItem, StackState } from "./types";

export { xLength };

type Stack = Pick<StackState, "items">;

export const X_LIMIT = 280;
export const README_IMAGE_PATH = "./assets/stackflex-badges.png";
export const README_HEADING = "My AI stack";

const LINKEDIN_PHRASE: Record<CategoryId, string> = {
  daily: "daily AI",
  coding: "building",
  creative: "creative work",
  automation: "automation",
  research: "research",
  local: "models & platforms",
};

const X_LABEL: Record<CategoryId, string> = {
  daily: "Daily",
  coding: "Code",
  creative: "Creative",
  automation: "Automation",
  research: "Research",
  local: "Platforms",
};

interface Group {
  categoryId: CategoryId | null;
  parts: string[];
}

/** Items grouped by category in badge order, each tool named once across the whole stack. */
function groups(state: Stack, part: (item: SelectedItem) => string = bioPart): Group[] {
  const seen = new Set<string>();
  const out: Group[] = [];
  for (const item of orderedItems(state)) {
    const text = part(item);
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const last = out.at(-1);
    if (last && last.categoryId === item.categoryId) last.parts.push(text);
    else out.push({ categoryId: item.categoryId, parts: [text] });
  }
  return out;
}

/** Ready-to-post LinkedIn text: one line per category, ending in a question. */
export function buildLinkedInPost(state: Stack): string {
  const lines = groups(state).map(({ categoryId, parts }) =>
    categoryId ? `${parts.join(" + ")} for ${LINKEDIN_PHRASE[categoryId]}` : `Plus ${parts.join(" + ")}`,
  );
  if (lines.length === 0) return "";
  return `My AI stack right now:\n\n${lines.join("\n")}\n\nWhat's in yours?`;
}

const X_INTRO = "My AI stack:";
const X_QUESTION = "What's yours?";

function labeledLines(list: Group[]): string {
  return list
    .map(({ categoryId, parts }) => `${categoryId ? `${X_LABEL[categoryId]}: ` : ""}${parts.join(" + ")}`)
    .join("\n");
}

function plainLines(list: Group[]): string {
  return list.map(({ parts }) => parts.join(" + ")).join("\n");
}

function inline(list: Group[]): string {
  return list.flatMap(({ parts }) => parts).join(" · ");
}

/**
 * Shorter X text that always fits X_LIMIT. Steps down until it fits: labeled lines, unlabeled
 * lines, a single line, then model names dropped from the end (tool names kept whole), and
 * finally "+N more" instead of the last tools.
 */
export function buildXPost(state: Stack): string {
  const items = orderedItems(state);
  if (items.length === 0) return "";
  const fits = (text: string) => xLength(text) <= X_LIMIT;
  const post = (body: string, separator = "\n\n") => `${X_INTRO}${separator}${body}\n\n${X_QUESTION}`;

  const full = groups(state);
  for (const candidate of [post(labeledLines(full)), post(plainLines(full)), post(inline(full), " ")]) {
    if (fits(candidate)) return candidate;
  }

  for (let keep = items.length - 1; keep >= 0; keep--) {
    const withoutModels = new Set(items.slice(keep).map((i) => i.id));
    const list = groups(state, (item) => (withoutModels.has(item.id) ? itemLabel(item) : bioPart(item)));
    const candidate = post(inline(list), " ");
    if (fits(candidate)) return candidate;
  }

  const names = groups(state, itemLabel).flatMap(({ parts }) => parts);
  for (let count = names.length - 1; count > 0; count--) {
    const candidate = post(`${names.slice(0, count).join(" · ")} +${names.length - count} more`, " ");
    if (fits(candidate)) return candidate;
  }
  return `${X_INTRO} ${names[0]}`;
}

/** Escapes characters that could end the image alt text or render as markup/HTML/entities. */
export function escapeMarkdown(text: string): string {
  return text.replace(/\s+/g, " ").replace(/[\\`*_[\]<>&]/g, "\\$&");
}

/** GitHub profile README section pointing at the downloaded badge image in the repo. */
export function buildReadmeMarkdown(state: Stack): string {
  const tools = groups(state).flatMap(({ parts }) => parts);
  if (tools.length === 0) return "";
  const alt = escapeMarkdown(`${README_HEADING}: ${tools.join(", ")}`);
  return `## ${README_HEADING}\n\n![${alt}](${README_IMAGE_PATH})\n`;
}
