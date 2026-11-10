import { catalog } from "@/lib/catalog/adapter";
import { TOOLS } from "@/lib/catalog/data/tools";
import { primaryDiscovery } from "@/lib/catalog/discovery";
import type { CatalogTool } from "@/lib/catalog/types";
import { MULTI_TOOL_SUGGESTIONS } from "./multiTool";
import raw from "./suggestions.json";
import {
  INITIAL_SUGGESTION_COUNT,
  type ActivitySuggestion,
} from "./types";

type SuggestionsFile = {
  schemaVersion: number;
  suggestionsByToolId: Record<string, string[]>;
};

const file = raw as SuggestionsFile;

/** Map legacy / alternate IDs in the suggestions file onto the live catalog. */
const ID_ALIASES: Record<string, string> = {
  "microsoft-365-copilot": "m365-copilot",
  "canva-magic-studio": "canva-ai",
  "jira-rovo": "atlassian-rovo",
  "notion-ai-business": "notion-ai",
};

const FALLBACKS: Record<string, string[]> = {
  assistants: [
    "Brainstorm ideas",
    "Draft documents and emails",
    "Summarize information",
    "Answer research questions",
    "Prepare for meetings",
  ],
  coding: [
    "Write and review code",
    "Debug application issues",
    "Generate tests",
    "Explain unfamiliar code",
    "Prototype features",
  ],
  image: [
    "Generate visual concepts",
    "Iterate on design drafts",
    "Create presentation graphics",
    "Explore creative directions",
  ],
  "video-audio": [
    "Generate video concepts",
    "Create voiceovers",
    "Edit media with AI",
    "Produce short-form content",
  ],
  research: [
    "Summarize research",
    "Synthesize notes",
    "Find source material",
    "Prepare briefing docs",
  ],
  automation: [
    "Automate repetitive tasks",
    "Connect tools into flows",
    "Route work between apps",
    "Monitor process outcomes",
  ],
  local: [
    "Run models offline",
    "Prototype with local models",
    "Keep sensitive work private",
    "Compare open models",
  ],
  "business-ai": [
    "Draft work content",
    "Summarize business data",
    "Support daily workflows",
    "Find insights in records",
  ],
};

/** Generic labels ranked lower so distinctive / multi-tool items surface first. */
const GENERIC_LABELS = new Set([
  "brainstorm ideas",
  "summarize information",
  "draft documents and emails",
  "research topics",
  "analyze information",
  "draft written content",
  "plan projects",
  "support daily workflows",
  "draft work content",
]);

/** Normalize labels for dedupe keys. */
export function normalizeActivityLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function suggestionKey(label: string): string {
  return normalizeActivityLabel(label);
}

/**
 * Collapse near-duplicate phrasing so “Brainstorm ideas” and
 * “Brainstorm product ideas” compete as one family.
 */
export function suggestionFamilyKey(label: string): string {
  const n = normalizeActivityLabel(label);
  if (/^brainstorm/.test(n)) return "family:brainstorm";
  if (/full.?stack/.test(n) && /app|application|product/.test(n)) return "family:fullstack";
  if (/^prototype/.test(n)) return "family:prototype";
  if (/debug/.test(n) && /code|refactor|issue/.test(n)) return "family:debug";
  if (/write|draft/.test(n) && /test/.test(n)) return "family:tests";
  if (/summarize/.test(n) && /(document|research|information|note)/.test(n)) return "family:summarize";
  if (/analyze/.test(n) && /(document|data|information)/.test(n)) return "family:analyze";
  if (/research/.test(n) && /(summarize|source|topic)/.test(n)) return "family:research";
  if (/(draft|refine)/.test(n) && /(writing|document|email|report|content|professional)/.test(n)) {
    return "family:draft";
  }
  if (/review/.test(n) && /code/.test(n)) return "family:review-code";
  if (/automate/.test(n)) return "family:automate";
  return n;
}

function buildCanonicalMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [rawId, labels] of Object.entries(file.suggestionsByToolId)) {
    const id = ID_ALIASES[rawId] ?? rawId;
    const cleaned = labels
      .filter((l): l is string => typeof l === "string" && l.trim().length > 0)
      .map((l) => l.trim());
    if (!cleaned.length) continue;
    const existing = map.get(id) ?? [];
    const seen = new Set(existing.map(normalizeActivityLabel));
    for (const label of cleaned) {
      const key = normalizeActivityLabel(label);
      if (seen.has(key)) continue;
      seen.add(key);
      existing.push(label);
    }
    map.set(id, existing);
  }
  return map;
}

const BY_TOOL = buildCanonicalMap();

function fallbackForTool(tool: CatalogTool): string[] {
  if (tool.toolType === "business-ai") return FALLBACKS["business-ai"]!;
  const discovery = primaryDiscovery(tool);
  return FALLBACKS[discovery] ?? FALLBACKS.assistants!;
}

/** Suggestions for a single catalog tool (file + fallback). */
export function suggestionsForToolId(toolId: string): string[] {
  const fromFile = BY_TOOL.get(toolId);
  if (fromFile?.length) return fromFile;
  const tool = catalog.tool(toolId);
  if (tool) return fallbackForTool(tool);
  return FALLBACKS.assistants!;
}

function domainForTool(toolId: string): string {
  const tool = catalog.tool(toolId);
  if (!tool) return "write";
  if (tool.toolType === "business-ai") return "productivity";
  const d = primaryDiscovery(tool);
  if (d === "coding") return "build";
  if (d === "image" || d === "video-audio") return "create";
  if (d === "automation") return "automate";
  if (d === "research" || d === "local") return "research";
  return "write";
}

function basePriority(label: string, toolCount: number, kind: "single" | "multi"): number {
  let score = kind === "multi" ? 70 : 40;
  score += Math.min(toolCount, 4) * 8;
  const n = normalizeActivityLabel(label);
  if (GENERIC_LABELS.has(n)) score -= 18;
  if (/full.?stack|prototype|product ideas|professional writing/.test(n)) score += 12;
  if (n.split(" ").length >= 4) score += 4;
  return score;
}

function prefersLabel(a: string, b: string): string {
  // Prefer slightly more specific phrasing when collapsing a family.
  if (a.length !== b.length) return a.length >= b.length ? a : b;
  return a.localeCompare(b) <= 0 ? a : b;
}

/**
 * Unified, prioritized recommendations for the selected stack.
 * Multi-tool combos first when all required tools are present; near-duplicates collapsed.
 */
export function suggestionsForSelectedTools(
  selectedToolIds: string[],
  options?: { filterToolId?: string | null; limit?: number },
): ActivitySuggestion[] {
  const filter = options?.filterToolId ?? null;
  const limit = options?.limit ?? INITIAL_SUGGESTION_COUNT;
  const stackSet = new Set(selectedToolIds.filter((id) => !id.startsWith("custom:")));
  const ids = filter ? [...stackSet].filter((id) => id === filter) : [...stackSet];

  const byFamily = new Map<string, ActivitySuggestion>();

  const put = (next: ActivitySuggestion) => {
    const family = suggestionFamilyKey(next.label);
    const existing = byFamily.get(family);
    if (!existing) {
      byFamily.set(family, next);
      return;
    }
    // Prefer multi-tool, then higher priority, then more specific label / more tools.
    const preferNext =
      (next.kind === "multi" && existing.kind !== "multi") ||
      (next.kind === existing.kind && next.priority > existing.priority) ||
      (next.kind === existing.kind &&
        next.priority === existing.priority &&
        next.candidateToolIds.length > existing.candidateToolIds.length);

    if (preferNext) {
      const mergedTools = [...new Set([...next.candidateToolIds, ...existing.candidateToolIds])];
      byFamily.set(family, {
        ...next,
        label: prefersLabel(next.label, existing.label),
        candidateToolIds: mergedTools.filter((id) => stackSet.has(id)),
        priority: Math.max(next.priority, existing.priority),
      });
    } else {
      for (const id of next.candidateToolIds) {
        if (stackSet.has(id) && !existing.candidateToolIds.includes(id)) {
          existing.candidateToolIds.push(id);
        }
      }
      existing.label = prefersLabel(existing.label, next.label);
      existing.priority = Math.max(existing.priority, next.priority);
    }
  };

  // Multi-tool suggestions — only when every required tool is selected.
  if (!filter) {
    for (const multi of MULTI_TOOL_SUGGESTIONS) {
      if (!multi.toolIds.every((id) => stackSet.has(id))) continue;
      put({
        key: suggestionKey(multi.label),
        id: multi.id,
        label: multi.label,
        candidateToolIds: [...multi.toolIds],
        kind: "multi",
        priority: multi.priority,
        domain: multi.domain,
      });
    }
  }

  // Per-tool library, merged into a flat list (not grouped by tool in the UI).
  for (const toolId of ids) {
    for (const label of suggestionsForToolId(toolId)) {
      put({
        key: suggestionKey(label),
        id: `suggest:${suggestionKey(label)}`,
        label,
        candidateToolIds: [toolId],
        kind: "single",
        priority: basePriority(label, 1, "single"),
        domain: domainForTool(toolId),
      });
    }
  }

  const ranked = [...byFamily.values()].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.kind !== b.kind) return a.kind === "multi" ? -1 : 1;
    if (b.candidateToolIds.length !== a.candidateToolIds.length) {
      return b.candidateToolIds.length - a.candidateToolIds.length;
    }
    // Mild variety: avoid clustering the same domain at the top when priorities tie.
    if ((a.domain ?? "") !== (b.domain ?? "")) {
      return (a.domain ?? "").localeCompare(b.domain ?? "");
    }
    return a.label.localeCompare(b.label);
  });

  // Soft variety pass: promote later items of underrepresented domains into the head.
  const diversified = diversify(ranked, Math.max(limit, INITIAL_SUGGESTION_COUNT));

  return diversified.slice(0, Math.max(0, limit));
}

function diversify(items: ActivitySuggestion[], headSize: number): ActivitySuggestion[] {
  if (items.length <= headSize) return items;
  const head: ActivitySuggestion[] = [];
  const rest = [...items];
  const domainCounts = new Map<string, number>();

  while (head.length < headSize && rest.length) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < Math.min(rest.length, 12); i++) {
      const item = rest[i]!;
      const d = item.domain ?? "other";
      const count = domainCounts.get(d) ?? 0;
      const score = item.priority - count * 14;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    const [picked] = rest.splice(bestIdx, 1);
    if (!picked) break;
    head.push(picked);
    const d = picked.domain ?? "other";
    domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1);
  }

  return [...head, ...rest];
}

/** All suggestion labels for a tool (unbounded) — used for “Show more”. */
export function allSuggestionsForSelectedTools(
  selectedToolIds: string[],
  filterToolId?: string | null,
): ActivitySuggestion[] {
  return suggestionsForSelectedTools(selectedToolIds, {
    filterToolId,
    limit: 200,
  });
}

export type SuggestionToolGroup = {
  toolId: string;
  suggestions: ActivitySuggestion[];
  /** Hidden suggestions when a per-tool limit is applied. */
  remaining: number;
};

/**
 * @deprecated Prefer the flat `suggestionsForSelectedTools` list for Results.
 * Kept for transitional tests / unused modal code paths.
 */
export function suggestionsGroupedByTool(
  selectedToolIds: string[],
  options?: {
    filterToolId?: string | null;
    perToolLimit?: number;
    showAll?: boolean;
  },
): SuggestionToolGroup[] {
  const filter = options?.filterToolId ?? null;
  const perToolLimit = options?.perToolLimit ?? 4;
  const showAll = options?.showAll ?? false;
  const ids = (filter ? selectedToolIds.filter((id) => id === filter) : selectedToolIds).filter(
    (id) => !id.startsWith("custom:"),
  );

  const byKey = new Map<string, ActivitySuggestion>();
  for (const toolId of ids) {
    for (const label of suggestionsForToolId(toolId)) {
      const key = suggestionKey(label);
      const existing = byKey.get(key);
      if (existing) {
        if (!existing.candidateToolIds.includes(toolId)) {
          existing.candidateToolIds.push(toolId);
        }
      } else {
        byKey.set(key, {
          key,
          id: `suggest:${key}`,
          label,
          candidateToolIds: [toolId],
          kind: "single",
          priority: basePriority(label, 1, "single"),
          domain: domainForTool(toolId),
        });
      }
    }
  }

  const emitted = new Set<string>();
  const groups: SuggestionToolGroup[] = [];

  for (const toolId of ids) {
    const ordered: ActivitySuggestion[] = [];
    for (const label of suggestionsForToolId(toolId)) {
      const key = suggestionKey(label);
      if (emitted.has(key)) continue;
      const suggestion = byKey.get(key);
      if (!suggestion) continue;
      emitted.add(key);
      ordered.push(suggestion);
    }
    if (!ordered.length) continue;
    const limit = showAll ? ordered.length : Math.min(perToolLimit, ordered.length);
    groups.push({
      toolId,
      suggestions: ordered.slice(0, limit),
      remaining: Math.max(0, ordered.length - limit),
    });
  }

  return groups;
}

/** Tools in the suggestions file that map onto the live catalog (after aliases). */
export function suggestionCoverage(): { covered: string[]; missing: string[] } {
  const covered: string[] = [];
  const missing: string[] = [];
  for (const tool of TOOLS) {
    if (BY_TOOL.has(tool.id)) covered.push(tool.id);
    else missing.push(tool.id);
  }
  return { covered, missing };
}
