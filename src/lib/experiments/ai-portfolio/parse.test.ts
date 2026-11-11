import { describe, expect, it } from "vitest";
import { parsePortfolioImport, shouldPreselect } from "./parse";
import { PORTFOLIO_IMPORT_FORMAT } from "./types";

const validReport = {
  format: PORTFOLIO_IMPORT_FORMAT,
  provider: "chatgpt",
  scope: {
    contextsUsed: ["This conversation", "Shared files"],
    inaccessible: ["Full chat history"],
    limitations: "Could not access older chats.",
  },
  projects: [
    {
      title: "Weekly research brief",
      summary: "Built a recurring research workflow that summarizes sources into a brief.",
      type: "workflow",
      status: "completed",
      myContribution: "Designed the prompts and reviewed outputs.",
      aiUse: "Drafted summaries and extracted claims.",
      tools: ["ChatGPT"],
      capabilities: ["Research", "Writing"],
      outcome: "Cut prep time for weekly updates.",
      evidence: {
        kind: "discussed_in_conversation",
        note: "Described in this conversation.",
        sourceUrl: null,
      },
      needsReview: [],
    },
    {
      title: "Speculative dashboard idea",
      summary: "Talked about building an analytics dashboard someday.",
      type: "project",
      status: "planned",
      myContribution: null,
      aiUse: null,
      tools: [],
      capabilities: [],
      outcome: null,
      evidence: {
        kind: "discussed_in_conversation",
        note: "Only discussed, not built.",
        sourceUrl: null,
      },
      needsReview: ["Confirm whether any work started."],
    },
  ],
};

describe("parsePortfolioImport", () => {
  it("parses clean JSON", () => {
    const result = parsePortfolioImport(JSON.stringify(validReport), "chatgpt");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects).toHaveLength(2);
    expect(result.report.scope.limitations).toContain("older chats");
    expect(result.report.projects[0].tools).toEqual(["ChatGPT"]);
  });

  it("parses fenced JSON with surrounding commentary", () => {
    const text = `Here you go!\n\n\`\`\`json\n${JSON.stringify(validReport)}\n\`\`\`\n\nLet me know if you want edits.`;
    const result = parsePortfolioImport(text, "claude");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects[0].title).toBe("Weekly research brief");
  });

  it("accepts an empty projects array", () => {
    const empty = {
      ...validReport,
      projects: [],
      scope: {
        contextsUsed: ["This conversation"],
        inaccessible: ["Prior chats"],
        limitations: "No concrete work found in accessible context.",
      },
    };
    const result = parsePortfolioImport(JSON.stringify(empty));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects).toHaveLength(0);
  });

  it("rejects malformed JSON with a helpful error", () => {
    const result = parsePortfolioImport("sorry, I could not produce JSON today");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.toLowerCase()).not.toContain("invalid json");
    expect(result.hint).toBeTruthy();
  });

  it("does not treat unknown status as completed", () => {
    const report = {
      ...validReport,
      projects: [
        {
          ...validReport.projects[0],
          status: "maybe_done_ish",
        },
      ],
    };
    const result = parsePortfolioImport(JSON.stringify(report));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects[0].status).toBe("in_progress");
    expect(result.report.projects[0].needsReview.some((n) => /status/i.test(n))).toBe(true);
  });

  it("does not upgrade unknown evidence into verified evidence", () => {
    const report = {
      ...validReport,
      projects: [
        {
          ...validReport.projects[0],
          evidence: { kind: "independently_verified", note: null, sourceUrl: null },
        },
      ],
    };
    const result = parsePortfolioImport(JSON.stringify(report));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects[0].evidence.kind).toBe("unknown");
  });

  it("drops unsafe source URLs", () => {
    const report = {
      ...validReport,
      projects: [
        {
          ...validReport.projects[0],
          evidence: {
            kind: "referenced_artifact",
            note: "File",
            sourceUrl: "javascript:alert(1)",
          },
        },
      ],
    };
    const result = parsePortfolioImport(JSON.stringify(report));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects[0].evidence.sourceUrl).toBeNull();
  });

  it("handles missing optional fields", () => {
    const minimal = {
      format: PORTFOLIO_IMPORT_FORMAT,
      provider: "claude",
      scope: { limitations: "Limited context." },
      projects: [
        {
          title: "Newsletter rewrite",
          summary: "Rewrote a product newsletter draft with AI assistance.",
        },
      ],
    };
    const result = parsePortfolioImport(JSON.stringify(minimal), "claude");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects[0].tools).toEqual([]);
    expect(result.report.projects[0].myContribution).toBeNull();
    expect(result.report.projects[0].evidence.kind).toBe("unknown");
  });

  it("caps projects at eight", () => {
    const many = {
      ...validReport,
      projects: Array.from({ length: 12 }, (_, i) => ({
        ...validReport.projects[0],
        title: `Project ${i + 1}`,
      })),
    };
    const result = parsePortfolioImport(JSON.stringify(many));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.report.projects).toHaveLength(8);
  });
});

describe("shouldPreselect", () => {
  it("includes completed and in-progress, excludes planned", () => {
    const parsed = parsePortfolioImport(JSON.stringify(validReport));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(shouldPreselect(parsed.report.projects[0])).toBe(true);
    expect(shouldPreselect({ ...parsed.report.projects[0], status: "in_progress" })).toBe(true);
    expect(shouldPreselect(parsed.report.projects[1])).toBe(false);
  });
});
