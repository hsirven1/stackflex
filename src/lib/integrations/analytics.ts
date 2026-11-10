/**
 * Anonymous product analytics via Plausible (when configured).
 *
 * Events carry catalog ids / short enums only — never free text the user typed
 * (custom tool names), profile names, or full tool stacks.
 *
 * Single pipeline: browser → Plausible. No parallel server log sink.
 */

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

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

let provider: AnalyticsProvider | null = null;
let defaultBooted = false;

/** Replace or clear the default Plausible provider (e.g. after explicit opt-in flows). */
export function registerAnalyticsProvider(next: AnalyticsProvider | null) {
  provider = next;
}

function plausibleProvider(): AnalyticsProvider {
  return {
    send(event) {
      try {
        const fn = typeof window !== "undefined" ? window.plausible : undefined;
        if (typeof fn !== "function") return;
        const props = event.props && Object.keys(event.props).length > 0 ? { ...event.props } : undefined;
        fn(event.name, props ? { props } : undefined);
      } catch {
        /* ignore */
      }
    },
  };
}

/** Register the Plausible-backed provider once (no-op until the script defines window.plausible). */
export function ensureDefaultAnalyticsProvider() {
  if (typeof window === "undefined" || defaultBooted) return;
  defaultBooted = true;
  if (provider) return;
  provider = plausibleProvider();
}

export function track(event: AnalyticsEvent) {
  ensureDefaultAnalyticsProvider();
  provider?.send(event);
}

/** Domain for Plausible (e.g. stackflex.app). Empty → analytics disabled. */
export function plausibleDomain(): string {
  return process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim() || "";
}
