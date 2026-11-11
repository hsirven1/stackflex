/** Experiment-only schema: stackflex-portfolio-import-v1 */

export const PORTFOLIO_IMPORT_FORMAT = "stackflex-portfolio-import-v1" as const;

export type AssistantProvider = "chatgpt" | "claude";

export type ProjectType =
  | "project"
  | "workflow"
  | "deliverable"
  | "automation"
  | "analysis"
  | "creative"
  | "other";

export type ProjectStatus = "completed" | "in_progress" | "planned";

/**
 * How the assistant grounded the claim. Unknown / unrecognized evidence
 * never becomes a stronger kind.
 */
export type EvidenceKind =
  | "referenced_artifact"
  | "discussed_in_conversation"
  | "remembered_context"
  | "user_reported"
  | "unknown";

export interface ProjectEvidence {
  kind: EvidenceKind;
  note: string | null;
  sourceUrl: string | null;
}

export interface ImportScope {
  contextsUsed: string[];
  inaccessible: string[];
  limitations: string;
}

/** One project as returned by the assistant (validated). */
export interface ImportedProject {
  title: string;
  summary: string;
  type: ProjectType;
  status: ProjectStatus;
  myContribution: string | null;
  aiUse: string | null;
  tools: string[];
  capabilities: string[];
  outcome: string | null;
  evidence: ProjectEvidence;
  needsReview: string[];
}

export interface PortfolioImportReport {
  format: typeof PORTFOLIO_IMPORT_FORMAT;
  provider: AssistantProvider | "other";
  scope: ImportScope;
  projects: ImportedProject[];
}

/** Editable draft project in the experiment UI. */
export interface DraftProject {
  id: string;
  title: string;
  summary: string;
  type: ProjectType;
  status: ProjectStatus;
  myContribution: string;
  aiUse: string;
  tools: string[];
  capabilities: string[];
  outcome: string;
  evidence: ProjectEvidence;
  needsReview: string[];
  /** Whether the project is included in the portfolio preview. */
  included: boolean;
  source: AssistantProvider | "manual";
  order: number;
}

export type ExperimentStep = 1 | 2 | 3;

export interface ExperimentState {
  v: 1;
  provider: AssistantProvider;
  step: ExperimentStep;
  projects: DraftProject[];
  scope: ImportScope | null;
  updatedAt: number;
}

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  project: "Project",
  workflow: "Workflow",
  deliverable: "Deliverable",
  automation: "Automation",
  analysis: "Analysis",
  creative: "Creative",
  other: "Work",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  planned: "Idea / planned",
};

export const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  referenced_artifact: "Referenced artifact",
  discussed_in_conversation: "Discussed in conversation",
  remembered_context: "Based on remembered context",
  user_reported: "User-reported",
  unknown: "Evidence unclear",
};

export const DEFAULT_SCOPE: ImportScope = {
  contextsUsed: [],
  inaccessible: [],
  limitations: "",
};

export const DEFAULT_EXPERIMENT_STATE: ExperimentState = {
  v: 1,
  provider: "chatgpt",
  step: 1,
  projects: [],
  scope: null,
  updatedAt: 0,
};
