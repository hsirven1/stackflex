import { itemLabel, orderedItems } from "./derive";
import type { StackState } from "./types";

type Stack = Pick<StackState, "items">;

/**
 * One clean, generic plain-text dump of the selected tools.
 * Tool names only (no model versions); suitable for profiles, email, or messages.
 */
export function buildCopyStack(state: Stack): string {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of orderedItems(state)) {
    const name = itemLabel(item);
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  if (names.length === 0) return "";

  if (names.length <= 3) {
    return `✦ My AI Stack\n\n${names.join(" · ")}`;
  }

  const mid = Math.ceil(names.length / 2);
  return `✦ My AI Stack\n\n${names.slice(0, mid).join(" · ")}\n${names.slice(mid).join(" · ")}`;
}
