import type {
  EvidenceKind,
  ExperienceSource,
  ImportedSuggestion,
  ParseResult,
  WorkStatus,
  WorkType,
} from "./types";

const WORK_TYPES = new Set<WorkType>(["project", "workflow", "deliverable", "automation", "analysis", "creative", "other"]);
const STATUSES = new Set<WorkStatus>(["completed", "in_progress", "planned"]);
const EVIDENCE = new Set<EvidenceKind>(["observed", "self_reported", "inferred", "unknown"]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

function asStringList(value: unknown, maxItems = 12, maxLen = 48): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const s = asString(item, maxLen);
    if (s && !out.includes(s)) out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

function normalizeType(raw: unknown): WorkType {
  const s = asString(raw, 32)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) return "project";
  if (WORK_TYPES.has(s as WorkType)) return s as WorkType;
  if (s.includes("workflow") || s.includes("process")) return "workflow";
  if (s.includes("deliver")) return "deliverable";
  if (s.includes("automat")) return "automation";
  if (s.includes("analy") || s.includes("research")) return "analysis";
  if (s.includes("creat") || s.includes("design") || s.includes("writ")) return "creative";
  return "other";
}

function normalizeStatus(raw: unknown): WorkStatus {
  const s = asString(raw, 32)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) return "completed";
  if (STATUSES.has(s as WorkStatus)) return s as WorkStatus;
  if (s.includes("progress") || s === "wip" || s === "ongoing") return "in_progress";
  if (s.includes("plan") || s.includes("idea") || s.includes("discuss")) return "planned";
  if (s.includes("done") || s.includes("complete") || s.includes("ship")) return "completed";
  return "completed";
}

function normalizeEvidence(raw: unknown): EvidenceKind {
  const s = asString(raw, 32)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!s) return "unknown";
  if (EVIDENCE.has(s as EvidenceKind)) return s as EvidenceKind;
  if (s.includes("observ") || s.includes("artifact")) return "observed";
  if (s.includes("self") || s.includes("report") || s.includes("stated")) return "self_reported";
  if (s.includes("infer") || s.includes("guess")) return "inferred";
  return "unknown";
}

function normalizeSource(provider: string | undefined, preferred: ExperienceSource): ExperienceSource {
  const p = provider?.toLowerCase() ?? "";
  if (p.includes("claude") || p.includes("anthropic")) return "claude";
  if (p.includes("chatgpt") || p.includes("openai") || p.includes("gpt")) return "chatgpt";
  return preferred;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

/** Pull the first JSON object from pasted text (allows accidental prose around it). */
function extractJsonObject(text: string): unknown {
  const cleaned = stripCodeFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("Could not find a JSON object in the pasted text.");
  }
}

function projectList(root: Record<string, unknown>): unknown[] {
  for (const key of ["projects", "experiences", "work", "items", "useCases", "use_cases"]) {
    const v = root[key];
    if (Array.isArray(v)) return v;
  }
  // Nested under activity / report
  for (const nest of ["activity", "report", "data"]) {
    const inner = asRecord(root[nest]);
    if (inner) {
      const nested = projectList(inner);
      if (nested.length) return nested;
    }
  }
  return [];
}

function mapItem(raw: unknown, index: number, source: ExperienceSource): ImportedSuggestion | null {
  const obj = asRecord(raw);
  if (!obj) return null;
  const title = asString(obj.title ?? obj.name ?? obj.summary, 120);
  const description = asString(
    obj.description ?? obj.summary ?? obj.details ?? obj.what ?? obj.overview,
    600,
  );
  if (!title || !description) return null;

  const status = normalizeStatus(obj.status ?? obj.state ?? obj.phase);
  // Prefer not promoting vague planned ideas into the default selection set later.
  return {
    key: `import-${index}-${title.slice(0, 24).replace(/\W+/g, "-").toLowerCase()}`,
    title,
    description,
    type: normalizeType(obj.type ?? obj.kind ?? obj.category),
    status,
    tools: asStringList(obj.tools ?? obj.toolNames ?? obj.ai_tools ?? obj.stack),
    capabilities: asStringList(obj.capabilities ?? obj.tags ?? obj.skills ?? obj.areas),
    outcome: asString(obj.outcome ?? obj.result ?? obj.impact, 280),
    link: asString(obj.link ?? obj.url ?? obj.href, 300),
    evidence: normalizeEvidence(obj.evidence ?? obj.confidence ?? obj.source_quality),
    source,
  };
}

/**
 * Parse a pasted assistant response into portfolio suggestions.
 * Supports stackflex-ai-activity-v1 and light structural variants. Never invents content.
 */
export function parseActivityReport(text: string, preferredSource: ExperienceSource = "manual"): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "Paste the JSON report from ChatGPT or Claude first." };
  }

  let data: unknown;
  try {
    data = extractJsonObject(trimmed);
  } catch {
    return {
      ok: false,
      error: "That doesn’t look like valid JSON. Copy the assistant’s JSON response again (no markdown commentary).",
    };
  }

  const root = asRecord(data);
  if (!root) {
    return { ok: false, error: "Expected a JSON object with a projects array." };
  }

  const format = asString(root.format ?? root.schema ?? root.version, 64);
  const provider = asString(root.provider ?? root.assistant ?? root.source, 40);
  const scope = asRecord(root.scope);
  const limitations = asString(scope?.limitations ?? scope?.notes ?? root.limitations, 400);
  const source = normalizeSource(provider, preferredSource);

  // Accept format when present; allow missing format if projects array exists.
  if (format && !/stackflex.?ai.?activity/i.test(format) && !/^v?1$/i.test(format)) {
    // Soft warning path: still try if we can find projects.
  }

  const list = projectList(root);
  if (list.length === 0) {
    // Empty projects with correct format is valid — surface as success with zero items.
    if (format && /stackflex.?ai.?activity/i.test(format)) {
      return {
        ok: true,
        provider,
        limitations: limitations ?? "The report contained no projects.",
        suggestions: [],
      };
    }
    return {
      ok: false,
      error:
        "No projects array found. Ask the assistant to return stackflex-ai-activity-v1 JSON with a \"projects\" field.",
    };
  }

  const suggestions: ImportedSuggestion[] = [];
  list.forEach((item, i) => {
    const mapped = mapItem(item, i, source);
    if (mapped) suggestions.push(mapped);
  });

  if (suggestions.length === 0) {
    return {
      ok: false,
      error: "Projects were present but none had both a title and a description. Ask the assistant to fill those fields.",
    };
  }

  return { ok: true, provider, limitations, suggestions };
}
