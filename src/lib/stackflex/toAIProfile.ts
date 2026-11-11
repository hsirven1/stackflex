import { catalog } from "@/lib/catalog/adapter";
import { itemModelLabels } from "@/lib/selection/derive";
import type { StackState } from "@/lib/selection/types";
import type { WorkingStyleResult } from "@/lib/profile/workingStyle";
import type { AIProfile, CardTool } from "@/components/stackflex/results/lib/types";
import { logoDataUrl } from "./logoDataUrl";
import { monogramFor } from "@/lib/selection/derive";
import { stackTools, toolFromItem } from "./tools";

/**
 * Map live StackFlex selection + classifier result → Claude Design AIProfile view model.
 * Tool order: Main (primary) first, then remaining selection order — tools[0] gets the ✦.
 * Classification copy comes from the app classifier (not PREVIEW_COPY).
 */
export function toAIProfile(
  stack: Pick<StackState, "items" | "primaryId">,
  style: WorkingStyleResult,
  options?: { name?: string; role?: string; hideTitle?: boolean },
): AIProfile {
  const ordered = stackTools(stack); // already Main-first
  const tools: CardTool[] = ordered.map((tool) => {
    const item = stack.items.find((i) => i.id === tool.id)!;
    const cat = item.toolId ? catalog.tool(item.toolId) : undefined;
    const categoryId = item.categoryId ?? cat?.categories[0];
    const category =
      (categoryId && catalog.category(categoryId)?.cardLabel) || tool.category || "Custom";
    const model = itemModelLabels(item, { separator: " · " });
    const fromItem = toolFromItem(item);
    const logo = logoDataUrl(fromItem.iconSlug);
    return {
      id: tool.id,
      name: tool.name,
      ...(model ? { model } : {}),
      category,
      ...(logo ? { logo } : {}),
      monogram: fromItem.monogram || monogramFor(tool.name),
      accent: cat?.aura ?? fromItem.aura,
    };
  });

  return {
    ...(options?.name ? { name: options.name } : {}),
    ...(options?.role ? { role: options.role } : {}),
    ...(options?.hideTitle ? { hideTitle: true } : {}),
    workingStyle: {
      id: style.id,
      title: style.name,
      tagline: style.tagline,
    },
    tools,
    toolCount: style.toolCount,
    categoryCount: style.categoryCount,
  };
}
