// StackFlex tool type + card color helpers. Production code: no demo data here (see demo.ts).
// Logos: Simple Icons CDN (https://simpleicons.org, CC0 icon data; logos remain trademarks of their owners).
// Tools without a Simple Icons entry use a monogram until you add an official SVG via `logoSrc`.

export type Tool = {
  id: string;
  name: string;
  version?: string;      // model / version, optional ("Opus 4.6")
  category: string;      // "Daily" | "Build" | "Automate" | "Create" | "Local" | ...
  aura: string;          // 6-digit hex, the tool's card color
  slug?: string;         // Simple Icons slug
  logoSrc?: string;      // local/official SVG, overrides slug
  monogram?: string;     // fallback when no logo
  models?: string[];     // optional model choices shown in the questionnaire
};

export const simpleIcon = (slug: string, color?: string) =>
  "https://cdn.simpleicons.org/" + slug + (color ? "/" + color : "");

export const logoFor = (t: Tool) => t.logoSrc ?? (t.slug ? simpleIcon(t.slug) : undefined);

// Final card system (Oct 2026). `aura` is the tool's curated accent color:
// brand hue normalized to about OKLCH L 0.74 / C 0.10 (monochrome brands: C 0.03, cool hue). Never the raw brand color.
export const cardColors = (aura: string) => ({
  tint: aura + "42", // secondary card wash, ~26%, rising from 32% height
  ring: aura + "99", // coin ring, 60%
  glow: aura + "80", // Main card corner glow, 50%
  top: aura + "38",  // Main card top tint, ~22%
  edge: aura + "66", // Main card border, 40%
});

// Short category labels for the card header (uppercased by CSS).
const SHORT: Record<string, string> = {
  "Daily AI": "Daily", "Coding & Building": "Build", "Creative AI": "Create",
  "Automation & Agents": "Automate", "Research & Productivity": "Research", "Local & Infrastructure": "Local",
};
export const categoryLabel = (c: string) => SHORT[c] ?? c;

export const stackHeadline = (tools: Tool[]) =>
  tools.map((t) => (t.version ? t.name + " " + t.version : t.name)).join(" · ");
