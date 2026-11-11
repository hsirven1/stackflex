import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { deflateSync, inflateSync } from "fflate";
import type { CreatePortfolioDraftInput } from "./portfolio-schema";
import type { DraftProject, ImportScope } from "@/lib/experiments/ai-portfolio/types";

export type McpDraftStatus = "draft" | "reviewed";

/** Server-issued portfolio draft. Never auto-published. */
export interface McpPortfolioDraft {
  v: 1;
  id: string;
  createdAt: number;
  status: McpDraftStatus;
  /** Always false when created via MCP. Publish only after explicit UI confirmation. */
  published: false;
  provider: "chatgpt" | "claude" | "other";
  scope: ImportScope;
  projects: DraftProject[];
}

const TOKEN_PREFIX = "sfpd1";

function draftSecret(): string {
  const secret = process.env.MCP_DRAFT_SECRET?.trim() || process.env.STACKFLEX_OAUTH_SECRET?.trim() || "";
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("MCP_DRAFT_SECRET is required in production");
  }
  return "stackflex-dev-mcp-draft-secret";
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function fromBase64Url(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

function sign(payloadB64: string): string {
  return createHmac("sha256", draftSecret()).update(payloadB64).digest("base64url");
}

function newId(): string {
  return `mcp_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}

export function inputToDraftProjects(input: CreatePortfolioDraftInput): DraftProject[] {
  return input.projects.map((p, order) => ({
    id: `proj_${order}_${randomBytes(3).toString("hex")}`,
    title: p.title,
    summary: p.summary,
    type: p.type,
    status: p.status,
    myContribution: p.myContribution ?? "",
    aiUse: p.aiUse ?? "",
    tools: p.tools,
    capabilities: p.capabilities,
    outcome: p.outcome ?? "",
    evidence: {
      kind: p.evidence.kind,
      note: p.evidence.note ?? null,
      sourceUrl: p.evidence.sourceUrl ?? null,
    },
    needsReview: p.needsReview,
    // Preselect credible work; planned ideas stay off by default.
    included: p.status === "completed" || p.status === "in_progress",
    source: input.provider === "chatgpt" || input.provider === "claude" ? input.provider : "manual",
    order,
  }));
}

export function createDraftFromInput(input: CreatePortfolioDraftInput): McpPortfolioDraft {
  return {
    v: 1,
    id: newId(),
    createdAt: Date.now(),
    status: "draft",
    published: false,
    provider: input.provider,
    scope: {
      contextsUsed: input.scope.contextsUsed,
      inaccessible: input.scope.inaccessible,
      limitations: input.scope.limitations || "Access limitations were not specified.",
    },
    projects: inputToDraftProjects(input),
  };
}

/** Encode a draft into an unguessable, integrity-protected URL token. */
export function encodeDraftToken(draft: McpPortfolioDraft): string {
  const json = new TextEncoder().encode(JSON.stringify(draft));
  const compressed = deflateSync(json, { level: 9 });
  const payload = toBase64Url(compressed);
  const sig = sign(payload);
  // Dot separator — base64url uses `_`/`-`, so underscore split would break.
  return `${TOKEN_PREFIX}.${payload}.${sig}`;
}

/** Verify and decode a draft token. Returns null on tamper/invalid. */
export function decodeDraftToken(token: string): McpPortfolioDraft | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [prefix, payload, sig] = parts;
  if (prefix !== TOKEN_PREFIX || !payload || !sig) return null;

  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const inflated = inflateSync(fromBase64Url(payload));
    const draft = JSON.parse(new TextDecoder().decode(inflated)) as McpPortfolioDraft;
    if (draft?.v !== 1 || typeof draft.id !== "string" || !Array.isArray(draft.projects)) return null;
    if (draft.published !== false) {
      // MCP-created tokens must remain unpublished; ignore forged published flags.
      draft.published = false;
    }
    return draft;
  } catch {
    return null;
  }
}

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function reviewUrlForToken(token: string, origin = siteOrigin()): string {
  return `${origin}/portfolio/review/${encodeURIComponent(token)}`;
}
