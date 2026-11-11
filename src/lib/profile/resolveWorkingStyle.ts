import type { WorkingStylePreference } from "./types";
import {
  workingStyleForId,
  type WorkingStyleResult,
  type WorkingStyleId,
} from "./workingStyle";
import type { ProfessionalRole } from "./roles";

export type ResolvedWorkingStyle = {
  /** Style used for artwork + copy (classifier or manual override). */
  style: WorkingStyleResult;
  /** When true, card/banner omit the archetype title block. */
  hideTitle: boolean;
  /** Classifier suggestion — used for the Recommended badge. */
  recommendedId: WorkingStyleId;
};

/**
 * Apply the user's archetype preference on top of the live classifier result.
 * Does not change the classification algorithm.
 */
export function resolveWorkingStyle(
  classified: WorkingStyleResult,
  preference: WorkingStylePreference | undefined,
  role?: ProfessionalRole | null,
): ResolvedWorkingStyle {
  const recommendedId = classified.id;
  if (preference?.mode === "hidden") {
    return { style: classified, hideTitle: true, recommendedId };
  }
  if (preference?.mode === "manual" && preference.styleId) {
    return {
      style: workingStyleForId(preference.styleId, classified, role),
      hideTitle: false,
      recommendedId,
    };
  }
  return { style: classified, hideTitle: false, recommendedId };
}
