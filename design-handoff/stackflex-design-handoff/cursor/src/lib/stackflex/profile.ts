// Profile-level data contracts for the personal AI page.
// These are VIEW MODELS. Map your existing app state into them with an adapter
// (see README "Integration"). Nothing here stores or fetches data.
import type { Tool } from "./tools";

/** Which subsection of "My AI Stack" a tool belongs to. */
export type ToolSection = "apps" | "software";

/** A selected tool as shown on the profile. `section` comes from your tool catalog. */
export type ProfileTool = Tool & { section: ToolSection };

export type ProfileIdentity = {
  name: string;
  title?: string;
  avatarSrc?: string; // falls back to the StackFlex gradient avatar
};

/** One "How I use AI" entry. toolIds reference ProfileTool.id; unknown ids are ignored. */
export type Activity = {
  id: string;
  title: string;
  toolIds: string[];
};

export type ProfileData = {
  identity: ProfileIdentity;
  tools: ProfileTool[];          // ordered; the first tool is Main unless mainToolId is set
  mainToolId?: string;
  activities: Activity[];        // only the user's SELECTED activities
};

export const splitBySection = (tools: ProfileTool[]) => ({
  apps: tools.filter((t) => t.section === "apps"),
  software: tools.filter((t) => t.section === "software"),
});

export const resolveMainId = (p: Pick<ProfileData, "tools" | "mainToolId">) =>
  p.mainToolId ?? p.tools[0]?.id;

export const toolsForActivity = (a: Activity, tools: ProfileTool[]) => {
  const byId = new Map(tools.map((t) => [t.id, t]));
  return a.toolIds.map((id) => byId.get(id)).filter(Boolean) as ProfileTool[];
};
