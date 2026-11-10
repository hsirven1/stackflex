/**
 * Profile-level view models for the personal AI page.
 * Map app state with `toProfileData` — nothing here stores or fetches data.
 */
import type { Tool } from "./tools";

/** Which subsection of "My AI Stack" a tool belongs to. */
export type ToolSection = "apps" | "software";

/** A selected tool as shown on the profile. `section` comes from catalog `toolType`. */
export type ProfileTool = Tool & { section: ToolSection };

export type ProfileIdentityData = {
  name: string;
  title?: string;
  avatarSrc?: string;
};

/** One "How I use AI" entry. toolIds reference ProfileTool.id; unknown ids are ignored. */
export type ProfileActivity = {
  id: string;
  title: string;
  toolIds: string[];
};

export type ProfileData = {
  identity: ProfileIdentityData;
  /** Selection order; Main is `mainToolId` (or first tool). */
  tools: ProfileTool[];
  mainToolId?: string | null;
  /** Only the user's selected / publishable activities. */
  activities: ProfileActivity[];
};

export const splitBySection = (tools: ProfileTool[]) => ({
  apps: tools.filter((t) => t.section === "apps"),
  software: tools.filter((t) => t.section === "software"),
});

export const resolveMainId = (p: Pick<ProfileData, "tools" | "mainToolId">) =>
  p.mainToolId ?? p.tools[0]?.id;

export const toolsForActivity = (a: ProfileActivity, tools: ProfileTool[]) => {
  const byId = new Map(tools.map((t) => [t.id, t]));
  return a.toolIds.map((id) => byId.get(id)).filter(Boolean) as ProfileTool[];
};

/** Canonical classification: business-ai → software; everything else → apps. */
export function sectionForTool(tool: Pick<Tool, "atWork">): ToolSection {
  return tool.atWork ? "software" : "apps";
}
