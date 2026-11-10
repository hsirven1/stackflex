"use client";

import { useSyncExternalStore } from "react";
import { annotateDuplicates } from "./duplicates";
import type {
  ExperienceSource,
  ImportedSuggestion,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioState,
  WorkStatus,
  WorkType,
} from "./types";
import { DEFAULT_PORTFOLIO, DEFAULT_PROFILE } from "./types";

const STORAGE_KEY = "stackflex:portfolio:v1";

let state: PortfolioState = DEFAULT_PORTFOLIO;
let loaded = false;
const listeners = new Set<() => void>();

function clamp(text: string | undefined, max: number): string | undefined {
  if (!text) return undefined;
  const t = text.replace(/\s+/g, " ").trim();
  return t ? t.slice(0, max) : undefined;
}

function sanitizeExperience(raw: unknown, index: number): PortfolioExperience | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<PortfolioExperience>;
  if (typeof r.id !== "string" || typeof r.title !== "string" || typeof r.description !== "string") return null;
  const title = clamp(r.title, 120);
  const description = clamp(r.description, 600);
  if (!title || !description) return null;
  const type = (r.type as WorkType) || "project";
  const status = (r.status as WorkStatus) || "completed";
  return {
    id: r.id,
    title,
    description,
    type: ["project", "workflow", "deliverable", "automation", "analysis", "creative", "other"].includes(type)
      ? type
      : "project",
    status: ["completed", "in_progress", "planned"].includes(status) ? status : "completed",
    tools: Array.isArray(r.tools) ? r.tools.filter((t): t is string => typeof t === "string").slice(0, 12) : [],
    capabilities: Array.isArray(r.capabilities)
      ? r.capabilities.filter((t): t is string => typeof t === "string").slice(0, 12)
      : [],
    outcome: clamp(r.outcome, 280),
    link: clamp(r.link, 300),
    visible: r.visible !== false,
    source: (["chatgpt", "claude", "manual"].includes(r.source as string) ? r.source : "manual") as ExperienceSource,
    evidence: r.evidence === "observed" || r.evidence === "self_reported" || r.evidence === "inferred" ? r.evidence : "unknown",
    order: typeof r.order === "number" ? r.order : index,
  };
}

function sanitize(raw: unknown): PortfolioState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PORTFOLIO, profile: { ...DEFAULT_PROFILE } };
  const r = raw as Partial<PortfolioState>;
  const profileRaw =
    r.profile && typeof r.profile === "object" ? (r.profile as Partial<PortfolioProfile>) : {};
  const profile: PortfolioProfile = {
    name: clamp(profileRaw.name, 80) ?? "",
    headline: clamp(profileRaw.headline, 160) ?? DEFAULT_PROFILE.headline,
    bio: clamp(profileRaw.bio, 600) ?? "",
    location: clamp(profileRaw.location, 80),
    linkedinUrl: clamp(profileRaw.linkedinUrl, 300),
    websiteUrl: clamp(profileRaw.websiteUrl, 300),
  };
  const experiences = (Array.isArray(r.experiences) ? r.experiences : [])
    .map(sanitizeExperience)
    .filter((e): e is PortfolioExperience => Boolean(e))
    .slice(0, 40)
    .sort((a, b) => a.order - b.order)
    .map((e, i) => ({ ...e, order: i }));
  return {
    v: 1,
    profile,
    experiences,
    showCapabilities: r.showCapabilities !== false,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : 0,
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = sanitize(JSON.parse(raw));
  } catch {
    state = { ...DEFAULT_PORTFOLIO, profile: { ...DEFAULT_PROFILE } };
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: PortfolioState) {
  state = { ...next, updatedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

export function usePortfolio(): PortfolioState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_PORTFOLIO);
}

export function updateProfile(patch: Partial<PortfolioProfile>) {
  load();
  commit({ ...state, profile: { ...state.profile, ...patch } });
}

export function setShowCapabilities(show: boolean) {
  load();
  commit({ ...state, showCapabilities: show });
}

function newId(): string {
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addManualExperience(input: {
  title: string;
  description: string;
  type?: WorkType;
  status?: WorkStatus;
  tools?: string[];
  capabilities?: string[];
  outcome?: string;
  link?: string;
}): PortfolioExperience {
  load();
  const exp: PortfolioExperience = {
    id: newId(),
    title: input.title.trim().slice(0, 120),
    description: input.description.trim().slice(0, 600),
    type: input.type ?? "project",
    status: input.status ?? "completed",
    tools: input.tools ?? [],
    capabilities: input.capabilities ?? [],
    outcome: clamp(input.outcome, 280),
    link: clamp(input.link, 300),
    visible: true,
    source: "manual",
    evidence: "self_reported",
    order: state.experiences.length,
  };
  commit({ ...state, experiences: [...state.experiences, exp] });
  return exp;
}

export function updateExperience(id: string, patch: Partial<PortfolioExperience>) {
  load();
  commit({
    ...state,
    experiences: state.experiences.map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)),
  });
}

export function removeExperience(id: string) {
  load();
  commit({
    ...state,
    experiences: state.experiences.filter((e) => e.id !== id).map((e, i) => ({ ...e, order: i })),
  });
}

export function reorderExperience(id: string, direction: "up" | "down") {
  load();
  const list = [...state.experiences].sort((a, b) => a.order - b.order);
  const i = list.findIndex((e) => e.id === id);
  if (i < 0) return;
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  commit({ ...state, experiences: list.map((e, order) => ({ ...e, order })) });
}

/** Add confirmed import suggestions; skips those marked as duplicates unless `includeDuplicates`. */
export function addImportedExperiences(
  suggestions: ImportedSuggestion[],
  selectedKeys: Set<string>,
  options: { includeDuplicates?: boolean } = {},
) {
  load();
  const annotated = annotateDuplicates(suggestions, state.experiences);
  const next = [...state.experiences];
  let order = next.length;
  for (const s of annotated) {
    if (!selectedKeys.has(s.key)) continue;
    if (s.duplicateOfId && !options.includeDuplicates) continue;
    next.push({
      id: newId(),
      title: s.title,
      description: s.description,
      type: s.type,
      status: s.status,
      tools: s.tools,
      capabilities: s.capabilities,
      outcome: s.outcome,
      link: s.link,
      visible: s.status !== "planned",
      source: s.source,
      evidence: s.evidence,
      order: order++,
    });
  }
  commit({ ...state, experiences: next });
}

export function resetPortfolioDraft() {
  load();
  commit({ ...DEFAULT_PORTFOLIO, profile: { ...DEFAULT_PROFILE }, experiences: [], updatedAt: Date.now() });
}

/** Capabilities derived from visible experiences (unique, stable order). */
export function derivedCapabilities(experiences: PortfolioExperience[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of experiences) {
    if (!e.visible) continue;
    for (const c of e.capabilities) {
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
      if (out.length >= 12) return out;
    }
  }
  return out;
}
