"use client";

import { useSyncExternalStore } from "react";
import { shouldPreselect } from "./parse";
import type {
  AssistantProvider,
  DraftProject,
  ExperimentState,
  ExperimentStep,
  ImportScope,
  ImportedProject,
  ProjectStatus,
  ProjectType,
} from "./types";
import { DEFAULT_EXPERIMENT_STATE, DEFAULT_SCOPE } from "./types";

/** Isolated from stackflex:v1 and stackflex:portfolio:v1 */
export const EXPERIMENT_STORAGE_KEY = "stackflex:experiments:ai-portfolio:v1";

let state: ExperimentState = { ...DEFAULT_EXPERIMENT_STATE };
let loaded = false;
const listeners = new Set<() => void>();

function clamp(text: string | undefined | null, max: number): string {
  if (!text) return "";
  const t = text.replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : "";
}

function newId(prefix = "proj"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim().slice(0, 300);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function sanitizeDraft(raw: unknown, index: number): DraftProject | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<DraftProject>;
  if (typeof r.id !== "string" || typeof r.title !== "string" || typeof r.summary !== "string") return null;
  const title = clamp(r.title, 120);
  const summary = clamp(r.summary, 600);
  if (!title || !summary) return null;

  const type = (["project", "workflow", "deliverable", "automation", "analysis", "creative", "other"].includes(
    r.type as string,
  )
    ? r.type
    : "project") as ProjectType;
  const status = (["completed", "in_progress", "planned"].includes(r.status as string)
    ? r.status
    : "in_progress") as ProjectStatus;
  const evidenceKind =
    r.evidence?.kind === "referenced_artifact" ||
    r.evidence?.kind === "discussed_in_conversation" ||
    r.evidence?.kind === "remembered_context" ||
    r.evidence?.kind === "user_reported"
      ? r.evidence.kind
      : "unknown";

  return {
    id: r.id,
    title,
    summary,
    type,
    status,
    myContribution: clamp(r.myContribution, 320),
    aiUse: clamp(r.aiUse, 320),
    tools: Array.isArray(r.tools)
      ? r.tools.filter((t): t is string => typeof t === "string").map((t) => clamp(t, 48)).filter(Boolean).slice(0, 10)
      : [],
    capabilities: Array.isArray(r.capabilities)
      ? r.capabilities
          .filter((t): t is string => typeof t === "string")
          .map((t) => clamp(t, 48))
          .filter(Boolean)
          .slice(0, 10)
      : [],
    outcome: clamp(r.outcome, 280),
    evidence: {
      kind: evidenceKind,
      note: clamp(r.evidence?.note, 280) || null,
      sourceUrl: sanitizeHttpUrl(r.evidence?.sourceUrl),
    },
    needsReview: Array.isArray(r.needsReview)
      ? r.needsReview
          .filter((t): t is string => typeof t === "string")
          .map((t) => clamp(t, 160))
          .filter(Boolean)
          .slice(0, 8)
      : [],
    included: r.included !== false,
    source: r.source === "claude" || r.source === "manual" || r.source === "chatgpt" ? r.source : "manual",
    order: typeof r.order === "number" ? r.order : index,
  };
}

function sanitize(raw: unknown): ExperimentState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EXPERIMENT_STATE };
  const r = raw as Partial<ExperimentState>;
  const provider: AssistantProvider = r.provider === "claude" ? "claude" : "chatgpt";
  const step: ExperimentStep = r.step === 2 || r.step === 3 ? r.step : 1;
  const projects = (Array.isArray(r.projects) ? r.projects : [])
    .map(sanitizeDraft)
    .filter((p): p is DraftProject => Boolean(p))
    .slice(0, 16)
    .sort((a, b) => a.order - b.order)
    .map((p, i) => ({ ...p, order: i }));

  let scope: ImportScope | null = null;
  if (r.scope && typeof r.scope === "object") {
    const s = r.scope as Partial<ImportScope>;
    scope = {
      contextsUsed: Array.isArray(s.contextsUsed)
        ? s.contextsUsed.filter((t): t is string => typeof t === "string").slice(0, 8)
        : [],
      inaccessible: Array.isArray(s.inaccessible)
        ? s.inaccessible.filter((t): t is string => typeof t === "string").slice(0, 8)
        : [],
      limitations: clamp(s.limitations, 500) || DEFAULT_SCOPE.limitations,
    };
  }

  return {
    v: 1,
    provider,
    step,
    projects,
    scope,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(EXPERIMENT_STORAGE_KEY);
    if (raw) state = sanitize(JSON.parse(raw));
  } catch {
    state = { ...DEFAULT_EXPERIMENT_STATE };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: ExperimentState) {
  state = { ...next, updatedAt: Date.now() };
  try {
    window.localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Session still works without persistence.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

export function useAiPortfolioExperiment(): ExperimentState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_EXPERIMENT_STATE);
}

export function setProvider(provider: AssistantProvider) {
  load();
  commit({ ...state, provider });
}

export function setStep(step: ExperimentStep) {
  load();
  commit({ ...state, step });
}

export function applyImport(
  projects: ImportedProject[],
  scope: ImportScope,
  provider: AssistantProvider,
) {
  load();
  const drafts: DraftProject[] = projects.map((p, order) => ({
    id: newId(),
    title: p.title,
    summary: p.summary,
    type: p.type,
    status: p.status,
    myContribution: p.myContribution ?? "",
    aiUse: p.aiUse ?? "",
    tools: p.tools,
    capabilities: p.capabilities,
    outcome: p.outcome ?? "",
    evidence: p.evidence,
    needsReview: p.needsReview,
    included: shouldPreselect(p),
    source: provider,
    order,
  }));
  commit({
    ...state,
    provider,
    step: 3,
    projects: drafts,
    scope,
  });
}

export function updateDraftProject(id: string, patch: Partial<DraftProject>) {
  load();
  commit({
    ...state,
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p)),
  });
}

export function removeDraftProject(id: string) {
  load();
  commit({
    ...state,
    projects: state.projects.filter((p) => p.id !== id).map((p, order) => ({ ...p, order })),
  });
}

export function reorderDraftProject(id: string, direction: "up" | "down") {
  load();
  const list = [...state.projects].sort((a, b) => a.order - b.order);
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  commit({ ...state, projects: list.map((p, order) => ({ ...p, order })) });
}

export function addManualDraftProject() {
  load();
  const draft: DraftProject = {
    id: newId("manual"),
    title: "Untitled project",
    summary: "Describe what you built or accomplished with AI.",
    type: "project",
    status: "completed",
    myContribution: "",
    aiUse: "",
    tools: [],
    capabilities: [],
    outcome: "",
    evidence: { kind: "user_reported", note: null, sourceUrl: null },
    needsReview: [],
    included: true,
    source: "manual",
    order: state.projects.length,
  };
  commit({ ...state, step: 3, projects: [...state.projects, draft] });
  return draft.id;
}

/** Clear all experimental data (does not touch MVP stack or portfolio draft). */
export function clearExperimentData() {
  load();
  try {
    window.localStorage.removeItem(EXPERIMENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  state = { ...DEFAULT_EXPERIMENT_STATE, updatedAt: Date.now() };
  emit();
}

export function startOverKeepProvider() {
  load();
  commit({
    ...DEFAULT_EXPERIMENT_STATE,
    provider: state.provider,
    updatedAt: Date.now(),
  });
}

export function exportReviewedJson(current: ExperimentState): string {
  const included = [...current.projects].filter((p) => p.included).sort((a, b) => a.order - b.order);
  const payload = {
    format: "stackflex-portfolio-import-v1",
    exportedAt: new Date().toISOString(),
    provider: current.provider,
    scope: current.scope,
    projects: included.map((p) => ({
      title: p.title,
      summary: p.summary,
      type: p.type,
      status: p.status,
      myContribution: p.myContribution || null,
      aiUse: p.aiUse || null,
      tools: p.tools,
      capabilities: p.capabilities,
      outcome: p.outcome || null,
      evidence: p.evidence,
      needsReview: p.needsReview,
    })),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function downloadReviewedJson(current: ExperimentState) {
  const blob = new Blob([exportReviewedJson(current)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stackflex-ai-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function derivedTools(projects: DraftProject[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of projects) {
    if (!p.included) continue;
    for (const t of p.tools) {
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(t);
      if (out.length >= 16) return out;
    }
  }
  return out;
}

export function derivedCapabilities(projects: DraftProject[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of projects) {
    if (!p.included) continue;
    for (const c of p.capabilities) {
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
      if (out.length >= 16) return out;
    }
  }
  return out;
}

export function buildPreviewSummary(projects: DraftProject[]): string {
  const included = projects.filter((p) => p.included);
  if (included.length === 0) {
    return "Select projects to build a portfolio that shows what you’ve actually done with AI.";
  }
  const completed = included.filter((p) => p.status === "completed").length;
  const tools = derivedTools(included);
  const toolBit = tools.length ? ` using ${tools.slice(0, 3).join(", ")}${tools.length > 3 ? ", and more" : ""}` : "";
  if (completed === included.length) {
    return `${included.length} completed AI-assisted project${included.length === 1 ? "" : "s"}${toolBit}.`;
  }
  return `${included.length} AI-assisted project${included.length === 1 ? "" : "s"} in review${toolBit}.`;
}
