import { z } from "zod";
import { PORTFOLIO_IMPORT_FORMAT } from "@/lib/experiments/ai-portfolio/types";

const projectType = z.enum([
  "project",
  "workflow",
  "deliverable",
  "automation",
  "analysis",
  "creative",
  "other",
]);

const projectStatus = z.enum(["completed", "in_progress", "planned"]);

const evidenceKind = z.enum([
  "referenced_artifact",
  "discussed_in_conversation",
  "remembered_context",
  "user_reported",
  "unknown",
]);

const httpsUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "URL must be http(s)")
  .max(300);

export const portfolioProjectInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(600),
  type: projectType.default("project"),
  status: projectStatus,
  myContribution: z.string().trim().max(320).nullable().optional(),
  aiUse: z.string().trim().max(320).nullable().optional(),
  tools: z.array(z.string().trim().min(1).max(48)).max(10).default([]),
  capabilities: z.array(z.string().trim().min(1).max(48)).max(10).default([]),
  outcome: z.string().trim().max(280).nullable().optional(),
  evidence: z
    .object({
      kind: evidenceKind,
      note: z.string().trim().max(280).nullable().optional(),
      sourceUrl: httpsUrl.nullable().optional(),
    })
    .default({ kind: "unknown", note: null, sourceUrl: null }),
  needsReview: z.array(z.string().trim().min(1).max(160)).max(8).default([]),
});

export const createPortfolioDraftInputSchema = z.object({
  format: z.literal(PORTFOLIO_IMPORT_FORMAT).optional(),
  provider: z.enum(["chatgpt", "claude", "other"]).default("other"),
  scope: z
    .object({
      contextsUsed: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
      inaccessible: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
      limitations: z.string().trim().max(500).default(""),
    })
    .default({ contextsUsed: [], inaccessible: [], limitations: "" }),
  projects: z.array(portfolioProjectInputSchema).max(8),
});

export type CreatePortfolioDraftInput = z.infer<typeof createPortfolioDraftInputSchema>;
export type PortfolioProjectInput = z.infer<typeof portfolioProjectInputSchema>;

/** Approximate upper bound for MCP payload size (JSON characters). */
export const MAX_MCP_PAYLOAD_CHARS = 80_000;
