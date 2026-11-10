import type { ImportedSuggestion, PortfolioExperience } from "./types";

function norm(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Simple title/description overlap — good enough for the first prototype. */
export function findDuplicateId(suggestion: ImportedSuggestion, existing: PortfolioExperience[]): string | undefined {
  const title = norm(suggestion.title);
  const desc = norm(suggestion.description).slice(0, 120);
  for (const exp of existing) {
    const et = norm(exp.title);
    if (et && title && (et === title || et.includes(title) || title.includes(et))) return exp.id;
    const ed = norm(exp.description).slice(0, 120);
    if (desc.length > 40 && ed.length > 40 && (ed === desc || ed.includes(desc) || desc.includes(ed))) return exp.id;
  }
  return undefined;
}

export function annotateDuplicates(suggestions: ImportedSuggestion[], existing: PortfolioExperience[]): ImportedSuggestion[] {
  return suggestions.map((s) => ({ ...s, duplicateOfId: findDuplicateId(s, existing) }));
}
