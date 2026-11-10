/** Saved “How I use AI” activity — local + shareable. */
export type ActivitySource = "suggested" | "custom";

export type Activity = {
  id: string;
  label: string;
  /** Catalog tool ids (and custom: ids) from the user's stack. */
  toolIds: string[];
  source: ActivitySource;
};

export type ActivitiesState = {
  v: 1;
  items: Activity[];
};

/** Deduped suggestion shown in the inline Results editor. */
export type ActivitySuggestion = {
  /** Stable key from normalized label / multi-tool id. */
  key: string;
  /** Stable suggestion id (multi-tool id or `suggest:<key>`). */
  id: string;
  label: string;
  /** Selected stack tool ids associated with this activity. */
  candidateToolIds: string[];
  kind: "single" | "multi";
  /** Higher ranks first in the unified list. */
  priority: number;
  domain?: string;
};

export const ACTIVITY_LABEL_MAX = 48;
export const MAX_ACTIVITIES = 24;
export const MAX_ACTIVITY_TOOLS = 8;
/** Initial recommendations shown before “Show more”. */
export const INITIAL_SUGGESTION_COUNT = 8;
