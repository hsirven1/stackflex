import type { CategoryId } from "@/lib/catalog/types";
import type { ProfessionalRole } from "@/lib/profile/roles";
import type { ProfileIdentity } from "@/lib/profile/types";
import type { SelectedItem, StackState } from "@/lib/selection/types";

/** Legacy snapshot schema (tools only). */
export const SNAPSHOT_VERSION_V1 = 1 as const;
/** Current snapshot schema (tools + optional public identity). */
export const SNAPSHOT_VERSION = 2 as const;

/** Hard limits to reject oversized / malicious tokens before inflate/parse. */
export const MAX_TOKEN_CHARS = 8192;
export const MAX_PAYLOAD_BYTES = 16384;
/** Align with selection MAX_BADGES — encode fails clearly if the URL would overflow. */
export const MAX_SNAPSHOT_ITEMS = 24;
export const MAX_SNAPSHOT_NAME = 60;
export const MAX_SNAPSHOT_TITLE = 80;
export const MAX_SNAPSHOT_AVATAR = 512;
/** Approved activities embedded in a share URL (optional on v2). */
export const MAX_SNAPSHOT_ACTIVITIES = 24;
export const MAX_SNAPSHOT_ACTIVITY_LABEL = 48;
export const MAX_SNAPSHOT_ACTIVITY_TOOLS = 8;

/**
 * Compact public snapshot item. Short keys keep the URL small.
 * Categories are the user's selected card category, not re-derived from the tool.
 */
export interface SnapshotItemV1 {
  /** Stable catalog tool id, or `custom:<slug>`. */
  t: string;
  /** Selected category id, or null for uncategorized custom tools. */
  c: CategoryId | null;
  /** Catalog model id (primary / first). */
  m?: string;
  /** Catalog version id. */
  mv?: string;
  /** User-entered version when no catalog versionId. */
  cv?: string;
  /** Free-text model when no catalog modelId. */
  cm?: string;
  /**
   * Additional models beyond the primary `m`/`mv` (multi-model).
   * Older clients ignore this field and keep the primary only.
   */
  ms?: Array<{ m: string; mv?: string; cv?: string }>;
  /** Display name for custom tools. */
  n?: string;
  /** `0` when showVersion is false; omit when true. */
  sv?: 0;
  /** Explicitly selected AI capability ids (optional; omitted when empty). */
  caps?: string[];
}

/** Versioned, URL-encoded stack snapshot (tools only). */
export interface StackSnapshotV1 {
  v: typeof SNAPSHOT_VERSION_V1;
  items: SnapshotItemV1[];
  /** Index of the Main card within `items` (selection order). */
  main: number;
}

/**
 * Compact approved activity in a share URL.
 * `l` = label, `t` = associated tool ids (must exist in `items`).
 */
export interface SnapshotActivityV2 {
  l: string;
  t: string[];
}

/**
 * v2 adds optional public identity (+ optional approved activities).
 * Never includes auth tokens, local-only previews, or unapproved suggestions.
 * `n` = display name, `ti` = professional title, `av` = durable https avatar URL.
 * `r` = professional role id (working style is always recomputed from tools).
 * `acts` = explicitly saved activities with tool associations.
 */
export interface StackSnapshotV2 {
  v: typeof SNAPSHOT_VERSION;
  items: SnapshotItemV1[];
  main: number;
  n?: string;
  ti?: string;
  av?: string;
  /** Compact professional role id from onboarding. */
  r?: string;
  acts?: SnapshotActivityV2[];
}

export type StackSnapshot = StackSnapshotV1 | StackSnapshotV2;

/** Minimal stack input for encoding. */
export type StackShareInput = Pick<StackState, "items" | "primaryId">;

/** Public identity fields derived from a decoded snapshot (placeholders when absent). */
export type SnapshotIdentity = {
  displayName?: string;
  professionalTitle?: string;
  avatarReference?: string;
  professionalRole?: ProfessionalRole;
};

/** Public activities derived from a decoded snapshot (empty when absent). */
export type SnapshotActivities = SnapshotActivityV2[];

export type DecodeOk = {
  ok: true;
  snapshot: StackSnapshot;
  stack: StackShareInput;
  identity: SnapshotIdentity;
  activities: SnapshotActivities;
};
export type DecodeErr = { ok: false; error: string };
export type DecodeResult = DecodeOk | DecodeErr;

/** Profile fields that may be embedded in a share URL (no local-only preview). */
export type ShareableProfile = Pick<
  ProfileIdentity,
  "displayName" | "professionalTitle" | "avatarReference" | "professionalRole"
>;

/** Activities approved for a share URL (already sanitized + publishable). */
export type ShareableActivity = {
  label: string;
  toolIds: string[];
};

export type { SelectedItem, StackState, CategoryId, ProfileIdentity };
