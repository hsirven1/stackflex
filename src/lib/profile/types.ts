import type { ProfessionalRole } from "./roles";

/** Local profile identity for the personal Stack Page (separate from tool selections). */
export type IdentitySource = "manual" | "linkedin";

export interface ProfileIdentity {
  displayName: string;
  professionalTitle: string;
  /** Discrete role from onboarding — drives tagline personalization. */
  professionalRole?: ProfessionalRole;
  /**
   * Stable public https URL included in share snapshots when set.
   * Not used for temporary LinkedIn CDN previews.
   */
  avatarReference?: string;
  /**
   * Local-only image preview (e.g. LinkedIn picture). Never encoded into share URLs.
   */
  avatarPreview?: string;
  identitySource?: IdentitySource;
}

export const NAME_MAX = 60;
export const TITLE_MAX = 80;
export const AVATAR_URL_MAX = 512;

export const EMPTY_PROFILE: ProfileIdentity = {
  displayName: "",
  professionalTitle: "",
};
