import { describe, expect, it } from "vitest";
import {
  publishableActivities,
  reconcileActivitiesWithStack,
  sanitizeActivitiesState,
  sanitizeActivityLabel,
} from "./store";
import type { Activity } from "./types";

const sample: Activity[] = [
  {
    id: "a1",
    label: "Build full-stack apps",
    toolIds: ["claude-code", "cursor"],
    source: "suggested",
  },
  {
    id: "a2",
    label: "Draft marketing content",
    toolIds: ["hubspot-breeze"],
    source: "suggested",
  },
];

describe("activities store helpers", () => {
  it("trims and caps activity labels", () => {
    expect(sanitizeActivityLabel("  Hello   world  ")).toBe("Hello world");
    expect(sanitizeActivityLabel("x".repeat(80)).length).toBe(48);
  });

  it("preserves activity text when tools leave the stack", () => {
    const next = reconcileActivitiesWithStack(sample, ["cursor"]);
    expect(next[0]?.label).toBe("Build full-stack apps");
    expect(next[0]?.toolIds).toEqual(["cursor"]);
    expect(next[1]?.toolIds).toEqual([]);
  });

  it("only publishes activities with at least one valid tool", () => {
    const reconciled = reconcileActivitiesWithStack(sample, ["cursor"]);
    const published = publishableActivities(reconciled, ["cursor"]);
    expect(published).toHaveLength(1);
    expect(published[0]?.toolIds).toEqual(["cursor"]);
  });

  it("sanitizes persisted state shapes", () => {
    const state = sanitizeActivitiesState({
      v: 1,
      items: [
        { id: "x", label: "  Ok  ", toolIds: ["chatgpt", "chatgpt"], source: "custom" },
        { id: "bad", label: "", toolIds: ["chatgpt"], source: "suggested" },
      ],
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.label).toBe("Ok");
    expect(state.items[0]?.toolIds).toEqual(["chatgpt"]);
    expect(state.items[0]?.source).toBe("custom");
  });
});
