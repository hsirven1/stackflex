import { stackTools, type Tool } from "@/lib/stackflex/tools";
import { MAX_FEATURED_TOOLS, type StackState } from "./types";

/**
 * Resolve which tools appear in Social Post / Profile Banner exports.
 * Prefer an explicit featuredIds list (Main always first when present);
 * otherwise Main + next selected tools up to MAX_FEATURED_TOOLS.
 */
export function featuredTools(stack: Pick<StackState, "items" | "primaryId" | "featuredIds">): Tool[] {
  const all = stackTools(stack);
  if (all.length === 0) return [];

  const byId = new Map(all.map((t) => [t.id, t]));
  const explicit = (stack.featuredIds ?? []).filter((id) => byId.has(id));

  let ids: string[];
  if (explicit.length > 0) {
    ids = [...explicit];
    const mainId = all[0]?.id;
    if (mainId && ids.includes(mainId) && ids[0] !== mainId) {
      ids = [mainId, ...ids.filter((id) => id !== mainId)];
    } else if (mainId && !ids.includes(mainId)) {
      ids = [mainId, ...ids].slice(0, MAX_FEATURED_TOOLS);
    }
  } else {
    ids = all.map((t) => t.id);
  }

  return ids
    .slice(0, MAX_FEATURED_TOOLS)
    .map((id) => byId.get(id)!)
    .filter(Boolean);
}

/** True when the stack is larger than what image exports can show. */
export function hasUnfeaturedTools(stack: Pick<StackState, "items" | "primaryId" | "featuredIds">): boolean {
  return stack.items.length > MAX_FEATURED_TOOLS;
}

export function featuredSummary(stack: Pick<StackState, "items" | "primaryId" | "featuredIds">): string | null {
  const total = stack.items.length;
  if (total <= MAX_FEATURED_TOOLS) return null;
  const n = featuredTools(stack).length;
  return `Featuring ${n} of ${total}`;
}
