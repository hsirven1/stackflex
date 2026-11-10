"use client";

import { useSyncExternalStore } from "react";
import {
  ACTIVITY_LABEL_MAX,
  MAX_ACTIVITIES,
  MAX_ACTIVITY_TOOLS,
  type ActivitiesState,
  type Activity,
  type ActivitySource,
} from "./types";

const STORAGE_KEY = "stackflex:activities:v1";

const EMPTY: ActivitiesState = { v: 1, items: [] };

let state: ActivitiesState = { ...EMPTY, items: [] };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `act_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeActivityLabel(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, ACTIVITY_LABEL_MAX);
}

export function sanitizeToolIds(raw: unknown, allowed?: Set<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of raw) {
    if (typeof id !== "string" || !id || id.length > 64) continue;
    if (allowed && !allowed.has(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_ACTIVITY_TOOLS) break;
  }
  return out;
}

export function sanitizeActivity(raw: unknown, allowedToolIds?: Set<string>): Activity | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<Activity>;
  const label = sanitizeActivityLabel(r.label);
  if (!label) return null;
  const source: ActivitySource = r.source === "custom" ? "custom" : "suggested";
  const toolIds = sanitizeToolIds(r.toolIds, allowedToolIds);
  const id =
    typeof r.id === "string" && r.id.length > 0 && r.id.length <= 64 ? r.id : newId();
  return { id, label, toolIds, source };
}

export function sanitizeActivitiesState(
  raw: unknown,
  allowedToolIds?: Set<string>,
): ActivitiesState {
  if (!raw || typeof raw !== "object") return { v: 1, items: [] };
  const r = raw as Partial<ActivitiesState>;
  if (!Array.isArray(r.items)) return { v: 1, items: [] };
  const items: Activity[] = [];
  const seen = new Set<string>();
  for (const entry of r.items) {
    const act = sanitizeActivity(entry, allowedToolIds);
    if (!act || seen.has(act.id)) continue;
    seen.add(act.id);
    items.push(act);
    if (items.length >= MAX_ACTIVITIES) break;
  }
  return { v: 1, items };
}

/**
 * Keep activity text when tools leave the stack; drop invalid tool refs.
 * Activities with zero remaining tools stay for reassignment (needsTools).
 */
export function reconcileActivitiesWithStack(
  activities: Activity[],
  stackToolIds: string[],
): Activity[] {
  const allowed = new Set(stackToolIds);
  return activities.map((a) => ({
    ...a,
    toolIds: a.toolIds.filter((id) => allowed.has(id)),
  }));
}

/** Activities safe to publish / encode — must have ≥1 valid tool in the stack. */
export function publishableActivities(
  activities: Activity[],
  stackToolIds: string[],
): Activity[] {
  const allowed = new Set(stackToolIds);
  return activities
    .map((a) => ({
      ...a,
      label: sanitizeActivityLabel(a.label),
      toolIds: sanitizeToolIds(a.toolIds, allowed),
    }))
    .filter((a) => a.label && a.toolIds.length > 0)
    .slice(0, MAX_ACTIVITIES);
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = sanitizeActivitiesState(JSON.parse(raw));
  } catch {
    state = { v: 1, items: [] };
  }
}

function persist(next: ActivitiesState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
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

export function useActivities(): ActivitiesState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function getActivities(): ActivitiesState {
  load();
  return state;
}

export function setActivities(items: Activity[]) {
  load();
  persist(sanitizeActivitiesState({ v: 1, items }));
}

export function saveActivitiesState(next: ActivitiesState) {
  persist(sanitizeActivitiesState(next));
}

export function createActivity(partial: {
  label: string;
  toolIds: string[];
  source: ActivitySource;
}): Activity {
  return {
    id: newId(),
    label: sanitizeActivityLabel(partial.label),
    toolIds: sanitizeToolIds(partial.toolIds),
    source: partial.source,
  };
}
