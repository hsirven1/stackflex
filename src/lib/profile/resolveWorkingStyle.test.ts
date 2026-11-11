import { describe, expect, it } from "vitest";
import { resolveWorkingStyle } from "./resolveWorkingStyle";
import type { WorkingStyleResult } from "./workingStyle";

function base(id: WorkingStyleResult["id"] = "generalist"): WorkingStyleResult {
  return {
    id,
    name: id === "generalist" ? "AI Orchestrator" : `AI ${id}`,
    tagline: "tagline",
    categoryCounts: { build: 2, research: 2, create: 1, agents: 1 },
    categoryCount: 4,
    toolCount: 6,
    scoringToolCount: 6,
  };
}

describe("resolveWorkingStyle", () => {
  it("keeps the classifier result in auto mode", () => {
    const classified = base("builder");
    const resolved = resolveWorkingStyle(classified, { mode: "auto" });
    expect(resolved.style.id).toBe("builder");
    expect(resolved.hideTitle).toBe(false);
    expect(resolved.recommendedId).toBe("builder");
  });

  it("applies a manual override without changing the recommendation", () => {
    const classified = base("builder");
    const resolved = resolveWorkingStyle(classified, { mode: "manual", styleId: "creative" });
    expect(resolved.style.id).toBe("creative");
    expect(resolved.style.name).toMatch(/Creative/i);
    expect(resolved.recommendedId).toBe("builder");
    expect(resolved.hideTitle).toBe(false);
  });

  it("hides the title while preserving the recommended id", () => {
    const classified = base("operator");
    const resolved = resolveWorkingStyle(classified, { mode: "hidden" });
    expect(resolved.hideTitle).toBe(true);
    expect(resolved.recommendedId).toBe("operator");
    expect(resolved.style.id).toBe("operator");
  });
});
