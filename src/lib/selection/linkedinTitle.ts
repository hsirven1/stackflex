"use client";

import { useSyncExternalStore } from "react";

/** Optional professional title for LinkedIn headline generation. */
const STORAGE_KEY = "stackflex:linkedin-title";
const MAX = 80;

let title = "";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (typeof raw === "string") title = raw.slice(0, MAX);
  } catch {
    title = "";
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return title;
}

export function useLinkedInTitle(): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => "");
}

export function setLinkedInTitle(next: string) {
  load();
  title = next.replace(/\s+/g, " ").trimStart().slice(0, MAX);
  try {
    window.localStorage.setItem(STORAGE_KEY, title);
  } catch {
    // Session still works without persistence.
  }
  emit();
}
