/**
 * Optional saved profile URLs for one-click banner flows.
 * Keys are written only when a future settings UI (or import) sets them;
 * missing values fall back to platform home pages.
 */

const STORAGE_KEY = "stackflex:profile-urls:v1";

interface ProfileUrls {
  linkedin?: string;
  x?: string;
}

const LINKEDIN_HOME = "https://www.linkedin.com/";
const X_HOME = "https://x.com/";
/** Edit-profile is the usual place to upload an X header when no personal URL is saved. */
const X_EDIT_PROFILE = "https://x.com/settings/profile";

function read(): ProfileUrls {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProfileUrls;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Accept http(s) URLs only; otherwise treat as unset. */
function safeHttpUrl(value: string | undefined, hostHint?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (hostHint && !url.hostname.includes(hostHint)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

/** LinkedIn profile URL when saved; otherwise LinkedIn home. */
export function linkedInOpenUrl(): string {
  return safeHttpUrl(read().linkedin, "linkedin.com") ?? LINKEDIN_HOME;
}

/** Saved X/Twitter profile when present; otherwise X edit-profile (header upload). */
export function xOpenUrl(): string {
  return safeHttpUrl(read().x, "x.com") ?? safeHttpUrl(read().x, "twitter.com") ?? X_EDIT_PROFILE;
}

export function setLinkedInProfileUrl(url: string) {
  if (typeof window === "undefined") return;
  const next = { ...read(), linkedin: safeHttpUrl(url, "linkedin.com") };
  if (!next.linkedin) delete next.linkedin;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode.
  }
}

export function setXProfileUrl(url: string) {
  if (typeof window === "undefined") return;
  const next = { ...read(), x: safeHttpUrl(url, "x.com") ?? safeHttpUrl(url, "twitter.com") };
  if (!next.x) delete next.x;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private mode.
  }
}

export { LINKEDIN_HOME, X_HOME, X_EDIT_PROFILE };
