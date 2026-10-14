"use client";

import { useSyncExternalStore } from "react";

/** Questionnaire progress, kept apart from the loadout so it never affects exports. */
export interface GuideState {
  step: number;
  /** A questionnaire is in progress: reloading returns to it instead of the results. */
  active: boolean;
}

const STORAGE_KEY = "stackflex:guide";
const DEFAULT_GUIDE: GuideState = { step: 0, active: false };

let state: GuideState = DEFAULT_GUIDE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<GuideState> | null;
    if (raw && Number.isInteger(raw.step) && (raw.step as number) >= 0) {
      state = { step: raw.step as number, active: raw.active === true };
    }
  } catch {
    state = DEFAULT_GUIDE;
  }
}

function commit(next: GuideState) {
  load();
  if (next.step === state.step && next.active === state.active) return;
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable; progress still works for the session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

export function useGuide(): GuideState {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_GUIDE);
}

export function setGuideStep(step: number) {
  commit({ step, active: true });
}

/** Mark the questionnaire as in progress at its saved step (e.g. after opening it). */
export function resumeGuide() {
  commit({ ...getSnapshot(), active: true });
}

export function restartGuide() {
  commit({ step: 0, active: true });
}

export function finishGuide() {
  commit({ ...getSnapshot(), active: false });
}
