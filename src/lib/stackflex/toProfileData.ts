import type { Activity } from "@/lib/activities";
import type { SnapshotActivities, SnapshotIdentity, StackShareInput } from "@/lib/stack-sharing";
import type { ProfileIdentity } from "@/lib/profile/types";
import { toolFromItem } from "./tools";
import {
  sectionForTool,
  type ProfileActivity,
  type ProfileData,
  type ProfileTool,
} from "./profile";

export type ProfileActivityInput = Pick<Activity, "id" | "label" | "toolIds">;

/**
 * Map existing stack + profile + activities into the profile presentation view model.
 * Does not invent tools, models, sections, or activities.
 */
export function toProfileData(input: {
  stack: StackShareInput;
  identity?: {
    displayName?: string | null;
    professionalTitle?: string | null;
    avatarSrc?: string | null;
  };
  activities?: ProfileActivityInput[];
  /** Placeholder when the name is empty (Results preview). Public pages should pass real snapshot names. */
  placeholderName?: string;
}): ProfileData {
  const tools: ProfileTool[] = input.stack.items.map((item) => {
    const tool = toolFromItem(item);
    return { ...tool, section: sectionForTool(tool) };
  });

  const name = input.identity?.displayName?.trim() || input.placeholderName || "Your name";
  const title = input.identity?.professionalTitle?.trim() || undefined;
  const avatarSrc = input.identity?.avatarSrc?.trim() || undefined;

  const activities: ProfileActivity[] = (input.activities ?? [])
    .filter((a) => a.label.trim() && a.toolIds.length > 0)
    .map((a) => ({
      id: a.id,
      title: a.label.trim(),
      toolIds: a.toolIds,
    }));

  return {
    identity: {
      name,
      ...(title ? { title } : {}),
      ...(avatarSrc ? { avatarSrc } : {}),
    },
    tools,
    mainToolId: input.stack.primaryId,
    activities,
  };
}

/** Public snapshot → ProfileData (no localStorage). */
export function toProfileDataFromSnapshot(input: {
  stack: StackShareInput;
  identity?: SnapshotIdentity;
  activities?: SnapshotActivities;
}): ProfileData {
  return toProfileData({
    stack: input.stack,
    identity: {
      displayName: input.identity?.displayName,
      professionalTitle: input.identity?.professionalTitle,
      avatarSrc: input.identity?.avatarReference,
    },
    activities: (input.activities ?? []).map((a, i) => ({
      id: `snap-${i}`,
      label: a.l,
      toolIds: a.t,
    })),
    placeholderName: "Your name",
  });
}

/** Local Results state → ProfileData. */
export function toProfileDataFromLocal(input: {
  stack: StackShareInput;
  profile: ProfileIdentity;
  avatarSrc?: string | null;
  activities: ProfileActivityInput[];
}): ProfileData {
  return toProfileData({
    stack: input.stack,
    identity: {
      displayName: input.profile.displayName,
      professionalTitle: input.profile.professionalTitle,
      avatarSrc: input.avatarSrc,
    },
    activities: input.activities,
    placeholderName: "Your name",
  });
}
