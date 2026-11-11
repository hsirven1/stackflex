import { catalog } from "@/lib/catalog/adapter";
import { workingStyleCategoryFor } from "@/lib/catalog/workingStyle";
import type { WorkingStyleCategoryId } from "@/lib/catalog/types";
import type { ProfessionalRole } from "./roles";

/** Configurable Generalist thresholds (easy to tune after launch). */
export const GENERALIST_MIN_CATEGORIES = 4;
/** No single scoring category may exceed this share of tools for Generalist. */
export const GENERALIST_MAX_SHARE = 0.35;

/**
 * Specialist: a deliberately deep, narrow stack — not every small selection.
 * Requires enough tools that focus is intentional (avoids labeling 1–3 tools as Specialist).
 */
export const SPECIALIST_MAX_CATEGORIES = 2;
export const SPECIALIST_MIN_TOOLS = 4;
export const SPECIALIST_MIN_DOMINANT_SHARE = 0.75;

export type WorkingStyleId =
  | "builder"
  | "operator"
  | "researcher"
  | "creative"
  | "strategist"
  | "generalist"
  | "specialist";

export type WorkingStyleResult = {
  id: WorkingStyleId;
  name: string;
  tagline: string;
  /** Counts for scoring categories only (custom/unknown excluded). */
  categoryCounts: Partial<Record<WorkingStyleCategoryId, number>>;
  /** Distinct scoring categories represented. */
  categoryCount: number;
  /** All selected tools including custom. */
  toolCount: number;
  /** Tools that contributed to classification. */
  scoringToolCount: number;
};

export const WORKING_STYLE_IDS: WorkingStyleId[] = [
  "builder",
  "operator",
  "researcher",
  "creative",
  "strategist",
  "generalist",
  "specialist",
];

export const STYLE_META: Record<
  WorkingStyleId,
  { name: string; defaultTagline: string }
> = {
  builder: {
    name: "AI Builder",
    defaultTagline: "Builds applications and prototypes with AI.",
  },
  operator: {
    name: "AI Operator",
    defaultTagline: "Uses AI to automate and coordinate workflows.",
  },
  researcher: {
    name: "AI Researcher",
    defaultTagline: "Uses AI to investigate, synthesize, and discover.",
  },
  creative: {
    name: "AI Creative",
    defaultTagline: "Creates visual, audio, and written work with AI.",
  },
  strategist: {
    name: "AI Strategist",
    defaultTagline: "Applies AI to decisions and day-to-day professional work.",
  },
  generalist: {
    name: "AI Orchestrator",
    defaultTagline: "Brings different AI tools together across research, creation, and execution.",
  },
  specialist: {
    name: "AI Specialist",
    defaultTagline: "Uses a focused set of AI tools.",
  },
};

export function isWorkingStyleId(value: unknown): value is WorkingStyleId {
  return typeof value === "string" && value in STYLE_META;
}

/** Build a WorkingStyleResult for a chosen id, keeping stack stats from classification. */
export function workingStyleForId(
  id: WorkingStyleId,
  base: Pick<WorkingStyleResult, "categoryCounts" | "toolCount" | "scoringToolCount">,
  role?: ProfessionalRole | null,
): WorkingStyleResult {
  return result(id, base.categoryCounts, base.toolCount, base.scoringToolCount, role);
}

/** Map working-style catalog buckets → style ids (build+local → builder, etc.). */
const CATEGORY_TO_STYLE: Record<WorkingStyleCategoryId, WorkingStyleId> = {
  build: "builder",
  local: "builder",
  agents: "operator",
  research: "researcher",
  create: "creative",
  assistant: "strategist",
  work_apps: "strategist",
  meetings: "strategist",
};

/**
 * Deterministic tie-break when two styles have equal evidence.
 * Prefer builder > operator > researcher > creative > strategist.
 */
const TIE_BREAK: WorkingStyleId[] = [
  "builder",
  "operator",
  "researcher",
  "creative",
  "strategist",
];

/** Lightweight role × style tagline overrides — never change the style id. */
const ROLE_TAGLINES: Partial<
  Record<ProfessionalRole, Partial<Record<WorkingStyleId, string>>>
> = {
  "product-manager": {
    builder: "Uses AI to turn product ideas into functional prototypes.",
    strategist: "Uses AI to shape product decisions and day-to-day work.",
    researcher: "Uses AI to investigate users, markets, and opportunities.",
  },
  "software-engineer": {
    builder: "Uses AI to accelerate application development and experimentation.",
    operator: "Uses AI to automate engineering workflows and tooling.",
    researcher: "Uses AI to investigate codebases, docs, and technical options.",
    specialist: "Focuses AI on a tight set of engineering tools.",
  },
  designer: {
    creative: "Combines AI tools to explore and produce design work.",
    builder: "Uses AI to prototype interfaces and product concepts.",
    strategist: "Uses AI to support design decisions and daily craft.",
  },
  founder: {
    builder: "Uses AI to ship prototypes and early product versions faster.",
    strategist: "Uses AI to make decisions and run day-to-day work.",
    operator: "Uses AI to automate and coordinate early operations.",
  },
  marketing: {
    creative: "Combines AI tools to develop and produce creative campaigns.",
    strategist: "Uses AI to plan and execute day-to-day marketing work.",
    researcher: "Uses AI to research audiences, messaging, and markets.",
  },
  sales: {
    strategist: "Uses AI to prepare outreach and support sales decisions.",
    operator: "Uses AI to automate follow-ups and sales workflows.",
    researcher: "Uses AI to research accounts and synthesize insights.",
  },
  operations: {
    operator: "Uses AI to automate and coordinate operational workflows.",
    strategist: "Uses AI to support operational decisions and daily work.",
  },
};

function emptyCounts(): Partial<Record<WorkingStyleCategoryId, number>> {
  return {};
}

function bump(
  counts: Partial<Record<WorkingStyleCategoryId, number>>,
  cat: WorkingStyleCategoryId,
) {
  counts[cat] = (counts[cat] ?? 0) + 1;
}

/** Aggregate scoring-category counts into style evidence (build+local share builder). */
function styleEvidence(
  categoryCounts: Partial<Record<WorkingStyleCategoryId, number>>,
): Map<WorkingStyleId, number> {
  const evidence = new Map<WorkingStyleId, number>();
  for (const [cat, n] of Object.entries(categoryCounts) as [
    WorkingStyleCategoryId,
    number,
  ][]) {
    if (!n) continue;
    const style = CATEGORY_TO_STYLE[cat];
    evidence.set(style, (evidence.get(style) ?? 0) + n);
  }
  return evidence;
}

function pickDominant(evidence: Map<WorkingStyleId, number>): WorkingStyleId | null {
  let best: WorkingStyleId | null = null;
  let bestCount = -1;
  for (const id of TIE_BREAK) {
    const n = evidence.get(id) ?? 0;
    if (n > bestCount) {
      bestCount = n;
      best = id;
    }
  }
  return bestCount > 0 ? best : null;
}

function resolveTagline(
  styleId: WorkingStyleId,
  role: ProfessionalRole | null | undefined,
): string {
  if (role) {
    const override = ROLE_TAGLINES[role]?.[styleId];
    if (override) return override;
  }
  return STYLE_META[styleId].defaultTagline;
}

function result(
  id: WorkingStyleId,
  categoryCounts: Partial<Record<WorkingStyleCategoryId, number>>,
  toolCount: number,
  scoringToolCount: number,
  role?: ProfessionalRole | null,
): WorkingStyleResult {
  const categoryCount = Object.values(categoryCounts).filter((n) => (n ?? 0) > 0).length;
  return {
    id,
    name: STYLE_META[id].name,
    tagline: resolveTagline(id, role),
    categoryCounts,
    categoryCount,
    toolCount,
    scoringToolCount,
  };
}

/**
 * Deterministic AI working-style classification from selected tool IDs.
 * Custom / unknown tools count toward toolCount but do not score categories.
 * Role only personalizes the tagline — never overrides a clear tool-based style.
 */
export function classifyWorkingStyle(input: {
  toolIds: string[];
  role?: ProfessionalRole | null;
}): WorkingStyleResult {
  const { toolIds, role } = input;
  const toolCount = toolIds.length;
  const categoryCounts = emptyCounts();
  let scoringToolCount = 0;

  for (const id of toolIds) {
    if (id.startsWith("custom:")) continue;
    const tool = catalog.tool(id);
    if (!tool) continue;
    scoringToolCount += 1;
    bump(categoryCounts, workingStyleCategoryFor(tool));
  }

  if (scoringToolCount === 0) {
    return result("strategist", categoryCounts, toolCount, 0, role);
  }

  const categoriesPresent = Object.entries(categoryCounts)
    .filter(([, n]) => (n ?? 0) > 0)
    .map(([c]) => c as WorkingStyleCategoryId);
  const categoryCount = categoriesPresent.length;
  const maxShare =
    Math.max(0, ...Object.values(categoryCounts).map((n) => n ?? 0)) / scoringToolCount;

  // Generalist: broad coverage, no single category dominates.
  if (
    categoryCount >= GENERALIST_MIN_CATEGORIES &&
    maxShare <= GENERALIST_MAX_SHARE
  ) {
    return result("generalist", categoryCounts, toolCount, scoringToolCount, role);
  }

  const evidence = styleEvidence(categoryCounts);
  const dominant = pickDominant(evidence);
  if (!dominant) {
    return result("strategist", categoryCounts, toolCount, scoringToolCount, role);
  }

  const dominantShare = (evidence.get(dominant) ?? 0) / scoringToolCount;

  // Specialist: deep, narrow toolkit (enough tools that focus is intentional).
  // Small stacks still receive their domain style (Builder, Strategist, …).
  if (
    scoringToolCount >= SPECIALIST_MIN_TOOLS &&
    categoryCount <= SPECIALIST_MAX_CATEGORIES &&
    dominantShare >= SPECIALIST_MIN_DOMINANT_SHARE
  ) {
    return result("specialist", categoryCounts, toolCount, scoringToolCount, role);
  }

  return result(dominant, categoryCounts, toolCount, scoringToolCount, role);
}

export function workingStyleName(id: WorkingStyleId): string {
  return STYLE_META[id].name;
}

/** Short, positive labels for explanation copy (not classifier inputs). */
const CATEGORY_PHRASE: Record<WorkingStyleCategoryId, string> = {
  assistant: "AI assistance",
  work_apps: "work apps",
  build: "building",
  local: "local AI",
  agents: "automation",
  create: "creative work",
  research: "research",
  meetings: "meetings",
};

const CATEGORY_ORDER: WorkingStyleCategoryId[] = [
  "assistant",
  "work_apps",
  "build",
  "local",
  "agents",
  "create",
  "research",
  "meetings",
];

function presentCategories(
  counts: Partial<Record<WorkingStyleCategoryId, number>>,
): WorkingStyleCategoryId[] {
  return CATEGORY_ORDER.filter((id) => (counts[id] ?? 0) > 0).sort(
    (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );
}

function formatList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function categoryPhrases(counts: Partial<Record<WorkingStyleCategoryId, number>>, limit = 4): string[] {
  return presentCategories(counts)
    .slice(0, limit)
    .map((id) => CATEGORY_PHRASE[id]);
}

/**
 * Short, deterministic explanation of why a working style was assigned.
 * Uses only selected-tool category evidence already on WorkingStyleResult —
 * never invents skill, frequency, or accomplishments.
 */
export function explainWorkingStyle(
  style: WorkingStyleResult,
  options?: { toolNames?: string[] },
): string {
  const phrases = categoryPhrases(style.categoryCounts);
  const list = formatList(phrases);
  const names = (options?.toolNames ?? []).filter(Boolean);
  const soleName = style.toolCount === 1 && names.length === 1 ? names[0] : null;

  if (style.scoringToolCount === 0) {
    return "Your profile uses a default Strategist style until catalog tools are added to your stack.";
  }

  switch (style.id) {
    case "generalist":
      return list
        ? `Your selected tools span several areas, including ${list}. Your profile reflects that breadth.`
        : "Your selected tools span several areas. Your profile reflects that breadth.";

    case "specialist":
      return list
        ? `Your selection is concentrated in ${list}, so a focused Specialist profile fits your stack.`
        : "Your selection is concentrated in a narrow set of tools, so a focused Specialist profile fits your stack.";

    case "builder":
      if ((style.categoryCounts.build ?? 0) + (style.categoryCounts.local ?? 0) >= 2) {
        return "Your selection includes several AI development tools, making building and prototyping the strongest theme in your stack.";
      }
      return "Building and prototyping tools are the strongest theme among your selections.";

    case "operator":
      return "Automation and agent tools are the strongest theme among your selections.";

    case "researcher":
      return "Research and information-analysis tools are the strongest theme among your selections.";

    case "creative":
      return "Creative tools are the strongest theme among your selections.";

    case "strategist":
      if (soleName) {
        return `With ${soleName} as your selected assistant, Strategist is the clearest fit for your stack.`;
      }
      if (style.scoringToolCount === 1 && phrases[0] === "AI assistance") {
        return "Your selection centers on AI assistance, so Strategist is the clearest fit for your stack.";
      }
      if (list) {
        return `${list.charAt(0).toUpperCase()}${list.slice(1)} ${phrases.length === 1 ? "is" : "are"} the strongest theme among your selections.`;
      }
      return "Day-to-day AI assistance is the strongest theme among your selections.";
  }
}
