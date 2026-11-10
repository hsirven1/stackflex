import type { CatalogTool, CategoryId, WorkingStyleCategoryId } from "./types";

const PURPOSE_TO_WORKING_STYLE: Record<CategoryId, WorkingStyleCategoryId> = {
  daily: "assistant",
  coding: "build",
  creative: "create",
  automation: "agents",
  research: "research",
  local: "local",
};

/** Meeting-note / companion tools that would otherwise land in research. */
const MEETINGS_TOOL_IDS = new Set(["granola", "otter", "zoom-ai"]);

/**
 * Resolve the primary working-style category for a catalog tool.
 * Prefers an explicit `workingStyleCategory`, then meetings tags, business-ai, then purpose.
 */
export function workingStyleCategoryFor(tool: CatalogTool): WorkingStyleCategoryId {
  if (tool.workingStyleCategory) return tool.workingStyleCategory;
  if (MEETINGS_TOOL_IDS.has(tool.id)) return "meetings";
  if (tool.toolType === "business-ai") return "work_apps";
  const purpose = tool.categories[0];
  if (purpose) return PURPOSE_TO_WORKING_STYLE[purpose];
  return "assistant";
}
