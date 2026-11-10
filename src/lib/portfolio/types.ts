/** Work kinds shown on portfolio cards. */
export type WorkType = "project" | "workflow" | "deliverable" | "automation" | "analysis" | "creative" | "other";

/** Honest status — never “verified”. */
export type WorkStatus = "completed" | "in_progress" | "planned";

/** Where a suggestion came from. */
export type ExperienceSource = "chatgpt" | "claude" | "manual";

/** How strongly the assistant grounded the item. */
export type EvidenceKind = "observed" | "self_reported" | "inferred" | "unknown";

export interface PortfolioProfile {
  name: string;
  headline: string;
  bio: string;
  location?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}

export interface PortfolioExperience {
  id: string;
  title: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  tools: string[];
  capabilities: string[];
  outcome?: string;
  link?: string;
  /** Shown in the published portfolio when true. */
  visible: boolean;
  source: ExperienceSource;
  evidence: EvidenceKind;
  /** Sort order (lower first). */
  order: number;
}

export interface PortfolioState {
  v: 1;
  profile: PortfolioProfile;
  experiences: PortfolioExperience[];
  /** When false, the capabilities strip is hidden. */
  showCapabilities: boolean;
  updatedAt: number;
}

export const DEFAULT_PROFILE: PortfolioProfile = {
  name: "",
  headline: "I build, create and solve problems with AI.",
  bio: "",
};

export const DEFAULT_PORTFOLIO: PortfolioState = {
  v: 1,
  profile: { ...DEFAULT_PROFILE },
  experiences: [],
  showCapabilities: true,
  updatedAt: 0,
};

export const WORK_TYPE_LABEL: Record<WorkType, string> = {
  project: "Project",
  workflow: "Workflow",
  deliverable: "Deliverable",
  automation: "Automation",
  analysis: "Analysis",
  creative: "Creative",
  other: "Work",
};

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  planned: "Planned",
};

/** A parsed suggestion before the user confirms adding it. */
export interface ImportedSuggestion {
  /** Temporary id for selection UI only. */
  key: string;
  title: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  tools: string[];
  capabilities: string[];
  outcome?: string;
  link?: string;
  evidence: EvidenceKind;
  source: ExperienceSource;
  /** Matches an existing portfolio experience (title/description heuristic). */
  duplicateOfId?: string;
}

export interface ParseSuccess {
  ok: true;
  provider?: string;
  limitations?: string;
  suggestions: ImportedSuggestion[];
}

export interface ParseFailure {
  ok: false;
  error: string;
}

export type ParseResult = ParseSuccess | ParseFailure;
