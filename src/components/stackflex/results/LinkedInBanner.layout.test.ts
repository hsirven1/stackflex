import { describe, expect, it } from "vitest";
import { BANNER_EXPORT, bannerUnits, planBannerToolLayout } from "./LinkedInBanner";
import type { CardTool } from "./lib/types";

function tools(...names: string[]): CardTool[] {
  return names.map((name, i) => ({
    id: `t${i}`,
    name,
    category: "AI",
    monogram: name.slice(0, 2),
  }));
}

describe("planBannerToolLayout", () => {
  it("keeps 1–3 tools on a single comfortable row", () => {
    expect(planBannerToolLayout(tools("ChatGPT")).cols).toBe(1);
    expect(planBannerToolLayout(tools("ChatGPT", "Cursor")).cols).toBe(2);
    expect(planBannerToolLayout(tools("ChatGPT", "Cursor", "Claude")).cols).toBe(3);
    expect(planBannerToolLayout(tools("ChatGPT", "Cursor", "Claude")).density).toBe("roomy");
  });

  it("wraps the screenshot 5-tool long-name case instead of five skinny columns", () => {
    const plan = planBannerToolLayout(
      tools("ChatGPT", "Cursor", "Hermes Agent", "Claude Design", "ElevenLabs"),
    );
    expect(plan.cols).toBeLessThanOrEqual(3);
    expect(plan.density).toBe("roomy");
    expect(plan.labels).toEqual([
      "ChatGPT",
      "Cursor",
      "Hermes Agent",
      "Claude Design",
      "ElevenLabs",
    ]);
  });

  it("uses two rows for mid counts rather than maximizing columns", () => {
    const four = planBannerToolLayout(tools("ChatGPT", "Cursor", "Claude", "Gemini"));
    expect(four.cols).toBeLessThanOrEqual(3);
    expect(Math.ceil(4 / four.cols)).toBe(2);

    const six = planBannerToolLayout(
      tools("ChatGPT", "Cursor", "Claude", "Gemini", "Perplexity", "n8n"),
    );
    expect(six.cols).toBe(3);
  });

  it("gives long enterprise names a wider 2-column layout", () => {
    const plan = planBannerToolLayout(
      tools(
        "Salesforce Agentforce",
        "Microsoft 365 Copilot",
        "GitHub Copilot",
        "Gemini for Google Workspace",
        "HubSpot Breeze",
      ),
    );
    expect(plan.cols).toBe(2);
    expect(plan.density).toBe("roomy");
    // Full names should fit in 2 roomy columns; compact aliases only as last resort.
    expect(plan.labels.join("|")).toContain("Salesforce");
    expect(plan.labels.some((l) => l.includes("Workspace") || l.includes("Gemini"))).toBe(true);
  });

  it("stays within two compact rows at the 10-tool cap", () => {
    const names = Array.from({ length: 10 }, (_, i) => `Tool Name ${i + 1}`);
    const plan = planBannerToolLayout(tools(...names));
    expect(Math.ceil(10 / plan.cols)).toBeLessThanOrEqual(3);
    expect(plan.density).toBe("compact");
  });
});

describe("bannerUnits", () => {
  it("uses absolute px at the native export width (no cqw)", () => {
    const { u, rootStyle } = bannerUnits(BANNER_EXPORT.width);
    expect(u(10)).toBe("15.840px");
    expect(rootStyle.width).toBe(1584);
    expect(rootStyle.height).toBe(396);
    expect(rootStyle.containerType).toBeUndefined();
  });

  it("uses cqw for fluid preview widths", () => {
    const { u, rootStyle } = bannerUnits("100%");
    expect(u(10)).toBe("1.000cqw");
    expect(rootStyle.containerType).toBe("inline-size");
    expect(rootStyle.aspectRatio).toBe("1584 / 396");
  });
});
