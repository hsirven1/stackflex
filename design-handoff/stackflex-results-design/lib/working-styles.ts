// Visual tokens per working style. The APP owns classification and copy; this file only maps a style id to visuals.
export type WorkingStyleId =
  | "builder" | "operator" | "creative" | "researcher" | "strategist" | "generalist" | "specialist";

export type StyleTokens = {
  c1: string;            // primary color of the symbol gradient and glow
  c2: string;            // secondary color
  lightTitleEnd: string; // end color of the title gradient on light cards
};

export const STYLE_TOKENS: Record<WorkingStyleId, StyleTokens> = {
  builder:    { c1: "#3A2EFF", c2: "#7CC4FF", lightTitleEnd: "#3A2EFF" },
  operator:   { c1: "#3A2EFF", c2: "#4FD1A5", lightTitleEnd: "#3A2EFF" },
  creative:   { c1: "#E8608A", c2: "#B58CFF", lightTitleEnd: "#9A3A6A" },
  researcher: { c1: "#4D7BFF", c2: "#8FE0F5", lightTitleEnd: "#3A2EFF" },
  strategist: { c1: "#3A2EFF", c2: "#C9F23A", lightTitleEnd: "#3A2EFF" },
  generalist: { c1: "#7A5CFF", c2: "#FFB38A", lightTitleEnd: "#3A2EFF" },
  specialist: { c1: "#0B0B0C", c2: "#3A2EFF", lightTitleEnd: "#3A2EFF" },
};

/** Map any app-side id ("AI Builder", "ai_builder", "builder"…) to a visual style. Unknown → generalist. */
export function toStyleId(appId: string): WorkingStyleId {
  const k = appId.toLowerCase().replace(/^ai[\s_-]*/, "").trim() as WorkingStyleId;
  return k in STYLE_TOKENS ? k : "generalist";
}

/**
 * Approved preview copy (sample only). Production copy must come from the app's classifier.
 * researcher / specialist taglines were never reviewed in the final pass.
 */
export const PREVIEW_COPY: Record<WorkingStyleId, { title: string; tagline: string }> = {
  builder:    { title: "AI Builder",    tagline: "Ships real products, with AI as a co-builder." },
  operator:   { title: "AI Operator",   tagline: "Builds systems that do the busywork for you." },
  creative:   { title: "AI Creative",   tagline: "Turns ideas into visuals faster than ever." },
  strategist: { title: "AI Strategist", tagline: "Sees the bigger picture and moves first." },
  generalist: { title: "AI Generalist", tagline: "Knows the right AI for every job." },
  researcher: { title: "AI Researcher", tagline: "Finds the signal first, then decides." },
  specialist: { title: "AI Specialist", tagline: "One craft, mastered deeply." },
};
