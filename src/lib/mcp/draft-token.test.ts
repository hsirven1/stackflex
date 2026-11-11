import { describe, expect, it } from "vitest";
import {
  createDraftFromInput,
  decodeDraftToken,
  encodeDraftToken,
  reviewUrlForToken,
} from "./draft-token";
import { createPortfolioDraftInputSchema } from "./portfolio-schema";
import { PORTFOLIO_IMPORT_FORMAT } from "@/lib/experiments/ai-portfolio/types";

const sample = {
  format: PORTFOLIO_IMPORT_FORMAT,
  provider: "claude" as const,
  scope: {
    contextsUsed: ["This conversation"],
    inaccessible: ["Full history"],
    limitations: "Older chats were unavailable.",
  },
  projects: [
    {
      title: "Ops checklist generator",
      summary: "Built a repeatable checklist workflow for weekly ops reviews.",
      type: "workflow" as const,
      status: "completed" as const,
      myContribution: "Designed the structure and reviewed outputs.",
      aiUse: "Drafted checklist items from notes.",
      tools: ["Claude"],
      capabilities: ["Operations", "Writing"],
      outcome: "Faster weekly prep.",
      evidence: {
        kind: "discussed_in_conversation" as const,
        note: "Described in conversation.",
        sourceUrl: null,
      },
      needsReview: [],
    },
    {
      title: "Future analytics idea",
      summary: "Discussed building a dashboard later.",
      type: "project" as const,
      status: "planned" as const,
      myContribution: null,
      aiUse: null,
      tools: [],
      capabilities: [],
      outcome: null,
      evidence: {
        kind: "discussed_in_conversation" as const,
        note: null,
        sourceUrl: null,
      },
      needsReview: ["Confirm no work started."],
    },
  ],
};

describe("createPortfolioDraftInputSchema", () => {
  it("accepts a valid payload", () => {
    const parsed = createPortfolioDraftInputSchema.safeParse(sample);
    expect(parsed.success).toBe(true);
  });

  it("rejects more than eight projects", () => {
    const tooMany = {
      ...sample,
      projects: Array.from({ length: 9 }, (_, i) => ({
        ...sample.projects[0],
        title: `Project ${i + 1}`,
      })),
    };
    const parsed = createPortfolioDraftInputSchema.safeParse(tooMany);
    expect(parsed.success).toBe(false);
  });

  it("rejects unsafe source URLs", () => {
    const bad = {
      ...sample,
      projects: [
        {
          ...sample.projects[0],
          evidence: {
            kind: "referenced_artifact",
            note: null,
            sourceUrl: "javascript:alert(1)",
          },
        },
      ],
    };
    const parsed = createPortfolioDraftInputSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });
});

describe("draft tokens", () => {
  it("round-trips a draft without publishing", () => {
    const input = createPortfolioDraftInputSchema.parse(sample);
    const draft = createDraftFromInput(input);
    expect(draft.published).toBe(false);
    expect(draft.projects[0].included).toBe(true);
    expect(draft.projects[1].included).toBe(false);

    const token = encodeDraftToken(draft);
    const decoded = decodeDraftToken(token);
    expect(decoded?.id).toBe(draft.id);
    expect(decoded?.projects).toHaveLength(2);
    expect(decoded?.published).toBe(false);
  });

  it("rejects tampered tokens", () => {
    const input = createPortfolioDraftInputSchema.parse(sample);
    const token = encodeDraftToken(createDraftFromInput(input));
    const tampered = `${token.slice(0, -4)}abcd`;
    expect(decodeDraftToken(tampered)).toBeNull();
  });

  it("builds a review URL", () => {
    const input = createPortfolioDraftInputSchema.parse(sample);
    const token = encodeDraftToken(createDraftFromInput(input));
    const url = reviewUrlForToken(token, "https://stackflex.app");
    expect(url.startsWith("https://stackflex.app/portfolio/review/")).toBe(true);
  });
});
