"use client";

import { useSyncExternalStore } from "react";
import { isProfessionalRole } from "./roles";
import { isWorkingStyleId } from "./workingStyle";
import {
  AVATAR_URL_MAX,
  EMPTY_PROFILE,
  NAME_MAX,
  TITLE_MAX,
  type IdentitySource,
  type ProfileIdentity,
  type WorkingStylePreference,
} from "./types";

const STORAGE_KEY = "stackflex:profile:v1";

let profile: ProfileIdentity = { ...EMPTY_PROFILE };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeProfile(raw: unknown): ProfileIdentity {
  if (!raw || typeof raw !== "object") return { ...EMPTY_PROFILE };
  const r = raw as Partial<ProfileIdentity>;
  const displayName = typeof r.displayName === "string" ? r.displayName.replace(/\s+/g, " ").trim().slice(0, NAME_MAX) : "";
  const professionalTitle =
    typeof r.professionalTitle === "string" ? r.professionalTitle.replace(/\s+/g, " ").trim().slice(0, TITLE_MAX) : "";
  const avatarReference =
    typeof r.avatarReference === "string" && isHttpsUrl(r.avatarReference)
      ? r.avatarReference.slice(0, AVATAR_URL_MAX)
      : undefined;
  const avatarPreview =
    typeof r.avatarPreview === "string" && (r.avatarPreview.startsWith("https://") || r.avatarPreview.startsWith("data:image/"))
      ? r.avatarPreview.slice(0, AVATAR_URL_MAX)
      : undefined;
  const identitySource: IdentitySource | undefined =
    r.identitySource === "linkedin" || r.identitySource === "manual" ? r.identitySource : undefined;
  const professionalRole = isProfessionalRole(r.professionalRole) ? r.professionalRole : undefined;
  const workingStylePreference = sanitizeWorkingStylePreference(r.workingStylePreference);

  return {
    displayName,
    professionalTitle,
    professionalRole,
    ...(workingStylePreference ? { workingStylePreference } : {}),
    avatarReference,
    avatarPreview,
    identitySource,
  };
}

function sanitizeWorkingStylePreference(raw: unknown): WorkingStylePreference | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Partial<WorkingStylePreference>;
  if (r.mode === "auto") return { mode: "auto" };
  if (r.mode === "hidden") return { mode: "hidden" };
  if (r.mode === "manual" && isWorkingStyleId(r.styleId)) {
    return { mode: "manual", styleId: r.styleId };
  }
  return undefined;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) profile = sanitizeProfile(JSON.parse(raw));
  } catch {
    profile = { ...EMPTY_PROFILE };
  }
}

function persist(next: ProfileIdentity) {
  profile = next;
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
  return profile;
}

export function useProfile(): ProfileIdentity {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_PROFILE);
}

export function getProfile(): ProfileIdentity {
  load();
  return profile;
}

export function setProfile(patch: Partial<ProfileIdentity>) {
  load();
  persist(sanitizeProfile({ ...profile, ...patch }));
}

export function saveProfile(next: ProfileIdentity) {
  persist(sanitizeProfile(next));
}

/** Image to show in local UI: durable public ref, else local-only preview. */
export function profileDisplayAvatar(p: ProfileIdentity): string | null {
  return p.avatarReference || p.avatarPreview || null;
}

/** Initials for avatar fallback from display name. */
export function profileInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
}
