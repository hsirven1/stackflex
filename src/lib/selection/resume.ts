import type { CategoryId } from "@/lib/catalog/types";
import { stripEmoji } from "./bio";
import { itemLabel, itemModelLabel, orderedItems } from "./derive";
import type { SelectedItem, StackState } from "./types";

export const RESUME_HEADING = "AI Tools & Technologies";
export type ResumeFormat = "compact" | "categorized";

const SECTION: Record<CategoryId, string> = {
  daily: "Generative AI",
  coding: "AI-Assisted Development",
  creative: "Creative AI",
  automation: "Automation & Agents",
  research: "Research & Productivity",
  local: "Models & Platforms",
};
const OTHER_SECTION = "Other AI Tools";

/** "Claude (Opus 4.6)", "Cursor (Claude Sonnet 4.6)", "Midjourney (V7)" or just "n8n". Emoji from custom names are dropped. */
export function resumePart(item: SelectedItem): string {
  const label = stripEmoji(itemLabel(item));
  const model = stripEmoji(itemModelLabel(item) ?? "");
  if (!model || model.toLowerCase() === label.toLowerCase()) return label;
  const prefix = `${label.toLowerCase()} `;
  const detail = model.toLowerCase().startsWith(prefix) ? model.slice(prefix.length) : model;
  return `${label} (${detail})`;
}

/** Sections in category order, each entry named once across the whole snippet; empty sections are omitted. */
function sections(state: Pick<StackState, "items">): { title: string; entries: string[] }[] {
  const seen = new Set<string>();
  const out: { title: string; entries: string[] }[] = [];
  for (const item of orderedItems(state)) {
    const entry = resumePart(item);
    const key = entry.toLowerCase();
    if (!entry || seen.has(key)) continue;
    seen.add(key);
    const title = item.categoryId ? SECTION[item.categoryId] : OTHER_SECTION;
    const section = out.find((s) => s.title === title);
    if (section) section.entries.push(entry);
    else out.push({ title, entries: [entry] });
  }
  return out;
}

/** Plain-text skills section built only from the selected tools. */
export function buildResumeSnippet(state: Pick<StackState, "items">, format: ResumeFormat = "compact"): string {
  const list = sections(state);
  if (list.length === 0) return "";
  if (format === "compact") return `${RESUME_HEADING}: ${list.flatMap((s) => s.entries).join(", ")}`;
  return `${RESUME_HEADING}\n\n${list.map((s) => `${s.title}: ${s.entries.join(", ")}`).join("\n")}`;
}
