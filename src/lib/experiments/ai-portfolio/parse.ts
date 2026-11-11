import {
  PORTFOLIO_IMPORT_FORMAT,
  type AssistantProvider,
  type EvidenceKind,
  type ImportScope,
  type ImportedProject,
  type PortfolioImportReport,
  type ProjectStatus,
  type ProjectType,
} from "./types";

const MAX_PASTE_CHARS = 200_000;
const MAX_PROJECTS = 8;

const PROJECT_TYPES = new Set<ProjectType>([
  "project",
  "workflow",
  "deliverable",
  "automation",
  "analysis",
  "creative",
  "other",
]);

const STATUSES = new Set<ProjectStatus>(["completed", "in_progress", "planned"]);

const EVIDENCE_KINDS = new Set<EvidenceKind>([
  "referenced_artifact",
  "discussed_in_conversation",
  "remembered_context",
  "user_reported",
  "unknown",
]);

export type ParseSuccess = {
  ok: true;
  report: PortfolioImportReport;
};

export type ParseFailure = {
  ok: false;
  error: string;
  hint?: string;
};

export type ParseResult = ParseSuccess | ParseFailure;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const t = value.replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.slice(0, max);
}

function asStringList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const s = asString(item, maxLen);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function sanitizeHttpUrl(value: unknown): string | null {
  const raw = asString(value, 300);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function extractJsonObject(text: string): unknown {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("no-json");
  }
}

function normalizeType(raw: unknown, needsReview: string[]): ProjectType {
  const s = asString(raw, 40)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (s && PROJECT_TYPES.has(s as ProjectType)) return s as ProjectType;
  if (s) needsReview.push(`Project type “${s}” was unclear — please confirm.`);
  return "other";
}

/**
 * Unknown statuses are never silently treated as completed.
 * They become in_progress and are flagged for review.
 */
function normalizeStatus(raw: unknown, needsReview: string[]): ProjectStatus {
  const s = asString(raw, 40)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) {
    needsReview.push("Status was missing — please confirm.");
    return "in_progress";
  }
  if (STATUSES.has(s as ProjectStatus)) return s as ProjectStatus;

  // Accept only clear aliases — avoid substring false positives like "maybe_done_ish".
  if (s === "wip" || s === "ongoing" || s === "inprogress") return "in_progress";
  if (s === "idea" || s === "planning" || s === "speculative" || s === "proposed") return "planned";
  if (s === "done" || s === "complete" || s === "finished" || s === "shipped") return "completed";

  needsReview.push(`Status “${s}” was unrecognized — please confirm.`);
  return "in_progress";
}

function normalizeEvidenceKind(raw: unknown, needsReview: string[]): EvidenceKind {
  const s = asString(raw, 64)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) {
    needsReview.push("Evidence basis was missing — please confirm.");
    return "unknown";
  }
  if (EVIDENCE_KINDS.has(s as EvidenceKind)) return s as EvidenceKind;

  // Friendly aliases — never upgrade to a stronger claim than justified.
  if (s.includes("artifact") || s.includes("file") || s.includes("link") || s === "observed") {
    return "referenced_artifact";
  }
  if (s.includes("conversation") || s.includes("discuss") || s.includes("chat")) {
    return "discussed_in_conversation";
  }
  if (s.includes("remember") || s.includes("memor") || s.includes("summar")) {
    return "remembered_context";
  }
  if (s.includes("self") || s.includes("user") || s.includes("report") || s.includes("stated")) {
    return "user_reported";
  }
  if (s.includes("infer") || s.includes("guess") || s.includes("assum") || s.includes("verif")) {
    needsReview.push("Evidence looked inferred or overstated — please confirm.");
    return "unknown";
  }

  needsReview.push(`Evidence kind “${s}” was unrecognized — please confirm.`);
  return "unknown";
}

function normalizeProvider(
  raw: unknown,
  preferred: AssistantProvider,
): AssistantProvider | "other" {
  const s = asString(raw, 40)?.toLowerCase() ?? "";
  if (s.includes("claude") || s.includes("anthropic")) return "claude";
  if (s.includes("chatgpt") || s.includes("openai") || s.includes("gpt")) return "chatgpt";
  if (!s) return preferred;
  return "other";
}

function normalizeScope(raw: unknown): ImportScope {
  const obj = asRecord(raw) ?? {};
  return {
    contextsUsed: asStringList(obj.contextsUsed ?? obj.contexts_used ?? obj.used, 8, 120),
    inaccessible: asStringList(obj.inaccessible ?? obj.couldNotAccess ?? obj.missing, 8, 120),
    limitations:
      asString(obj.limitations ?? obj.notes ?? obj.limitation, 500) ??
      "Access limitations were not specified.",
  };
}

function mapProject(raw: unknown): ImportedProject | null {
  const obj = asRecord(raw);
  if (!obj) return null;

  const needsReview = asStringList(obj.needsReview ?? obj.needs_review ?? obj.confirm, 8, 160);
  const title = asString(obj.title ?? obj.name, 120);
  const summary = asString(obj.summary ?? obj.description ?? obj.details, 600);
  if (!title || !summary) return null;

  const evidenceObj = asRecord(obj.evidence) ?? {};
  const evidenceKind = normalizeEvidenceKind(
    evidenceObj.kind ?? evidenceObj.type ?? obj.evidence,
    needsReview,
  );

  return {
    title,
    summary,
    type: normalizeType(obj.type ?? obj.kind ?? obj.category, needsReview),
    status: normalizeStatus(obj.status ?? obj.state ?? obj.phase, needsReview),
    myContribution: asString(obj.myContribution ?? obj.contribution ?? obj.role, 320),
    aiUse: asString(obj.aiUse ?? obj.ai_use ?? obj.howAiHelped, 320),
    tools: asStringList(obj.tools ?? obj.toolNames ?? obj.ai_tools, 10, 48),
    capabilities: asStringList(obj.capabilities ?? obj.skills ?? obj.tags, 10, 48),
    outcome: asString(obj.outcome ?? obj.result ?? obj.impact, 280),
    evidence: {
      kind: evidenceKind,
      note: asString(evidenceObj.note ?? evidenceObj.details, 280),
      sourceUrl: sanitizeHttpUrl(evidenceObj.sourceUrl ?? evidenceObj.url ?? obj.link),
    },
    needsReview: Array.from(new Set(needsReview)).slice(0, 8),
  };
}

/**
 * Parse a pasted assistant response into a validated portfolio import report.
 * Never invents projects. Never executes imported content.
 */
export function parsePortfolioImport(
  text: string,
  preferredProvider: AssistantProvider = "chatgpt",
): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: "Paste your assistant’s full response first.",
      hint: "Copy everything it returned, then paste it here.",
    };
  }
  if (trimmed.length > MAX_PASTE_CHARS) {
    return {
      ok: false,
      error: "That response is too large to import safely.",
      hint: "Ask your assistant for a shorter JSON report with at most eight projects.",
    };
  }

  let data: unknown;
  try {
    data = extractJsonObject(trimmed);
  } catch {
    return {
      ok: false,
      error: "We couldn’t find a valid response to import.",
      hint: "Your assistant may have added commentary. Use “Copy a formatting fix prompt” and try again.",
    };
  }

  const root = asRecord(data);
  if (!root) {
    return {
      ok: false,
      error: "The response wasn’t in the expected format.",
      hint: "Ask your assistant to return the StackFlex portfolio JSON object.",
    };
  }

  const format = asString(root.format ?? root.schema, 64);
  const projectsRaw = Array.isArray(root.projects)
    ? root.projects
    : Array.isArray(root.experiences)
      ? root.experiences
      : null;

  if (!projectsRaw) {
    return {
      ok: false,
      error: "We couldn’t find a projects list in the response.",
      hint: "Ask your assistant to include a “projects” array in the JSON.",
    };
  }

  if (format && format !== PORTFOLIO_IMPORT_FORMAT && !/stackflex.?portfolio.?import/i.test(format)) {
    // Soft accept older activity reports only if projects exist — still validate strictly.
  }

  const projects: ImportedProject[] = [];
  for (let i = 0; i < projectsRaw.length && projects.length < MAX_PROJECTS; i++) {
    const mapped = mapProject(projectsRaw[i]);
    if (mapped) projects.push(mapped);
  }

  // Empty array is a valid outcome.
  if (projectsRaw.length > 0 && projects.length === 0) {
    return {
      ok: false,
      error: "Projects were present, but none had both a title and a short description.",
      hint: "Ask your assistant to fill title and summary for each project.",
    };
  }

  const report: PortfolioImportReport = {
    format: PORTFOLIO_IMPORT_FORMAT,
    provider: normalizeProvider(root.provider, preferredProvider),
    scope: normalizeScope(root.scope),
    projects,
  };

  return { ok: true, report };
}

/** Default-include completed / in-progress; exclude planned / speculative. */
export function shouldPreselect(project: ImportedProject): boolean {
  return project.status === "completed" || project.status === "in_progress";
}
