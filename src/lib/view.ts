"use client";

import { useSyncExternalStore } from "react";

/**
 * home = landing page, guide = step-by-step questionnaire, edit = full six-category editor,
 * results = generated assets.
 */
export type View = "home" | "guide" | "edit" | "results";

/** Home is the bare URL; the other views live in the hash. */
const HASHES: Record<Exclude<View, "home">, string> = { guide: "#guide", edit: "#edit", results: "#results" };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function readRoute(): View | null {
  const hash = window.location.hash;
  if (!hash || hash === "#") return "home";
  return (Object.keys(HASHES) as (keyof typeof HASHES)[]).find((v) => HASHES[v] === hash) ?? null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  window.addEventListener("hashchange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
    window.removeEventListener("hashchange", listener);
  };
}

/** The view named in the URL, or null for an unknown hash (the app then picks a default). */
export function useRoute(): View | null {
  return useSyncExternalStore(subscribe, readRoute, () => null);
}

/** Views live in the URL so the browser back button moves between them. */
export function navigate(view: View) {
  if (readRoute() !== view) {
    const url = view === "home" ? window.location.pathname + window.location.search : HASHES[view];
    window.history.pushState({ stackflex: view }, "", url);
    notify();
  }
  window.scrollTo({ top: 0 });
}
