/**
 * Anonymous analytics hook. Disabled in V0.1 — `track` is a no-op until a provider is
 * registered after explicit user opt-in. Events carry catalog ids only; never free text the
 * user typed (custom tool names), and never personal information.
 */

export type AnalyticsEvent =
  | { name: "tool_added"; props: { toolId: string; source: "quick_pick" | "search" | "more" } }
  | { name: "tool_removed"; props: { toolId: string } }
  | { name: "custom_tool_added"; props: Record<string, never> }
  | { name: "model_selected"; props: { toolId: string; modelId: string; versionId?: string } }
  | { name: "theme_changed"; props: { theme: string } }
  | { name: "export_downloaded"; props: { format: string; theme: string; badgeCount: number } }
  | { name: "bio_copied"; props: { platform: "linkedin" | "x" } };

export interface AnalyticsProvider {
  send(event: AnalyticsEvent): void;
}

let provider: AnalyticsProvider | null = null;

/** Call only after the user has opted in. */
export function registerAnalyticsProvider(next: AnalyticsProvider | null) {
  provider = next;
}

export function track(event: AnalyticsEvent) {
  provider?.send(event);
}
