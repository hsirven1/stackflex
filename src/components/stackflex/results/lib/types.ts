// View models for the Results / Reveal page. Map your existing StackFlex state into these (see CURSOR_HANDOFF.md §3).

export type CardTool = {
  id: string;
  name: string;
  model?: string;    // selected model/version, e.g. "Opus 4.5"
  category: string;
  logo?: string;     // URL or /public path; missing → monogram
  monogram?: string; // defaults to the first letter of name
  accent?: string;   // 6-digit hex tool color (existing `aura`); defaults to #A8A59C
};

export type AIProfile = {
  name?: string;     // not displayed on the approved card (kept for future use)
  role?: string;     // not displayed on the approved card (kept for future use)
  workingStyle: { id: string; title: string; tagline: string };
  /** When true, card/banner use the tools-only layout (no archetype title). */
  hideTitle?: boolean;
  tools: CardTool[]; // ordered; tools[0] is Main (✦)
  toolCount?: number;      // defaults to tools.length (toolkit header only)
  categoryCount?: number;  // defaults to distinct categories (toolkit header only)
};

export type CardTheme = "dark" | "light";
/** "holo" = approved Premium Holographic (A). "artifact" = approved alternate (C). */
export type CardLook = "holo" | "artifact";
