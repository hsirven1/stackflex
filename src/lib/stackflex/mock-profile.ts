/**
 * MOCK DATA ONLY — landing showcase / visual QA.
 * Never import from the public `/s/[snapshot]` route or Results.
 *
 * Classification matches the live catalog: AI Apps vs AI-Powered Software via toolType.
 */
import type { ProfileData, ProfileTool } from "./profile";
import { toolFromItem } from "./tools";
import { sectionForTool } from "./profile";

function profileTool(
  id: string,
  categoryId: "daily" | "coding" | "creative" | "research" | "automation",
  opts?: { modelId?: string; versionId?: string },
): ProfileTool {
  const tool = toolFromItem({
    id,
    toolId: id,
    categoryId,
    modelId: opts?.modelId,
    versionId: opts?.versionId,
    showVersion: Boolean(opts?.modelId || opts?.versionId),
  });
  return { ...tool, section: sectionForTool(tool) };
}

const identity = { name: "Maya Chen", title: "Founder at Northbeam" };

/** Landing showcase: AI Apps + AI-Powered Software + two demo activities. */
export const MOCK_PROFILE_SHOWCASE: ProfileData = {
  identity,
  tools: [
    profileTool("claude", "daily", { modelId: "claude-opus", versionId: "4.6" }),
    profileTool("chatgpt", "daily", { modelId: "gpt", versionId: "5.1" }),
    profileTool("cursor", "coding"),
    profileTool("hubspot-breeze", "daily"),
    profileTool("shopify-sidekick", "daily"),
    profileTool("perplexity", "research"),
  ],
  mainToolId: "claude",
  activities: [
    { id: "demo-brainstorm", title: "Brainstorm product ideas", toolIds: ["chatgpt", "claude"] },
    { id: "demo-build", title: "Build full-stack apps", toolIds: ["cursor"] },
  ],
};

export const MOCK_SHOWCASE_SOCIAL_TOOLS = MOCK_PROFILE_SHOWCASE.tools.slice(0, 6);
