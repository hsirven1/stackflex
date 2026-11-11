/**
 * Product analytics for StackFlex.
 *
 * Page views / referrers: handled by `<Analytics />` from `@vercel/analytics/next`
 * in the root layout (Vercel Web Analytics).
 *
 * Custom funnel events keep a stable `track()` API for call sites. Sending them
 * to Vercel requires Pro (or Enterprise) — Hobby does not collect custom events.
 * Opt in only after upgrading with:
 *   NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS=1
 *
 * Events carry catalog ids / short enums only — never free text the user typed
 * (custom tool names), profile names, or full tool stacks.
 */

import { track as vercelTrack } from "@vercel/analytics";

export type AnalyticsEvent =
  | { name: "start_clicked"; props: Record<string, never> }
  | { name: "onboarding_completed"; props: Record<string, never> }
  | { name: "card_downloaded"; props: { theme: "dark" | "light" } }
  | { name: "banner_downloaded"; props: { theme: "dark" | "light" } }
  | { name: "profile_edited"; props: Record<string, never> }
  | { name: "tool_added"; props: { toolId: string; source: "quick_pick" | "search" | "more" } }
  | { name: "tool_removed"; props: { toolId: string } }
  | { name: "custom_tool_added"; props: Record<string, never> }
  | { name: "model_selected"; props: { toolId: string; modelId: string; versionId?: string } }
  | { name: "theme_changed"; props: { theme: string } }
  | { name: "export_downloaded"; props: { format: string; theme: string; badgeCount: number } }
  | { name: "bio_copied"; props: { platform: "linkedin" | "x" | "stack" } };

export const ANALYTICS_EVENT_NAMES = [
  "start_clicked",
  "onboarding_completed",
  "card_downloaded",
  "banner_downloaded",
  "profile_edited",
  "tool_added",
  "tool_removed",
  "custom_tool_added",
  "model_selected",
  "theme_changed",
  "export_downloaded",
  "bio_copied",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export interface AnalyticsProvider {
  send(event: AnalyticsEvent): void;
}

let provider: AnalyticsProvider | null = null;
let defaultBooted = false;

/** Replace or clear the default product-event provider. */
export function registerAnalyticsProvider(next: AnalyticsProvider | null) {
  provider = next;
}

/** True when custom events should be forwarded to Vercel (Pro+ only). */
export function vercelCustomEventsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_EVENTS?.trim() === "1";
}

function sanitizeProps(
  props: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> | undefined {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    // Pro allows 2 custom properties; keep payload small and typed.
    if (Object.keys(out).length >= 2) break;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function vercelCustomEventsProvider(): AnalyticsProvider {
  return {
    send(event) {
      try {
        const props = sanitizeProps(
          (event.props ?? {}) as Record<string, string | number | boolean | undefined>,
        );
        if (props) vercelTrack(event.name, props);
        else vercelTrack(event.name);
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * Register the Vercel custom-event provider when explicitly enabled.
 * Without the flag, `track()` is a no-op so Hobby deployments do not pretend
 * funnel events are collected.
 */
export function ensureDefaultAnalyticsProvider() {
  if (typeof window === "undefined" || defaultBooted) return;
  defaultBooted = true;
  if (provider) return;
  if (vercelCustomEventsEnabled()) {
    provider = vercelCustomEventsProvider();
  }
}

export function track(event: AnalyticsEvent) {
  ensureDefaultAnalyticsProvider();
  provider?.send(event);
}
