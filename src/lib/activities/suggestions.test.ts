import { describe, expect, it } from "vitest";
import { TOOLS } from "@/lib/catalog/data/tools";
import {
  normalizeActivityLabel,
  suggestionCoverage,
  suggestionFamilyKey,
  suggestionsForSelectedTools,
  suggestionsForToolId,
  suggestionsGroupedByTool,
} from "./suggestions";

describe("activity suggestions", () => {
  it("loads curated suggestions for ChatGPT", () => {
    const labels = suggestionsForToolId("chatgpt");
    expect(labels.length).toBeGreaterThan(3);
    expect(labels.some((l) => /brainstorm/i.test(l))).toBe(true);
  });

  it("maps microsoft-365-copilot file id onto m365-copilot", () => {
    const labels = suggestionsForToolId("m365-copilot");
    expect(labels.length).toBeGreaterThan(2);
  });

  it("provides category fallbacks for catalog tools without file entries", () => {
    const { missing } = suggestionCoverage();
    for (const id of missing) {
      expect(suggestionsForToolId(id).length).toBeGreaterThan(0);
    }
  });

  it("covers every selectable catalog tool", () => {
    for (const tool of TOOLS) {
      expect(suggestionsForToolId(tool.id).length).toBeGreaterThan(0);
    }
  });

  it("returns a flat unified list without tool grouping", () => {
    const suggestions = suggestionsForSelectedTools(["chatgpt", "claude", "gemini"], {
      limit: 50,
    });
    const keys = suggestions.map((s) => normalizeActivityLabel(s.label));
    expect(new Set(keys).size).toBe(keys.length);
    expect(suggestions.every((s) => s.candidateToolIds.length >= 1)).toBe(true);
  });

  it("collapses near-duplicate brainstorm labels into one family", () => {
    expect(suggestionFamilyKey("Brainstorm ideas")).toBe(
      suggestionFamilyKey("Brainstorm product ideas"),
    );
    const suggestions = suggestionsForSelectedTools(["chatgpt", "claude"], { limit: 50 });
    const brainstorms = suggestions.filter((s) => /brainstorm/i.test(s.label));
    expect(brainstorms.length).toBe(1);
    expect(brainstorms[0]!.candidateToolIds.sort()).toEqual(["chatgpt", "claude"].sort());
  });

  it("collapses refine/draft writing near-duplicates into one family", () => {
    expect(suggestionFamilyKey("Refine professional writing")).toBe(
      suggestionFamilyKey("Draft and refine professional writing"),
    );
    const suggestions = suggestionsForSelectedTools(["chatgpt", "claude"], { limit: 50 });
    const writing = suggestions.filter((s) => /professional writing/i.test(s.label));
    expect(writing.length).toBe(1);
  });

  it("shows multi-tool build suggestion when Claude Code and Cursor are selected", () => {
    const suggestions = suggestionsForSelectedTools(["claude-code", "cursor"], { limit: 50 });
    const build = suggestions.find((s) => /full-stack/i.test(s.label));
    expect(build).toBeTruthy();
    expect(build!.kind).toBe("multi");
    expect(build!.candidateToolIds.sort()).toEqual(["claude-code", "cursor"].sort());
  });

  it("hides multi-tool suggestions when a required tool is missing", () => {
    const alone = suggestionsForSelectedTools(["cursor"], { limit: 50 });
    expect(
      alone.some((s) => s.kind === "multi" && s.candidateToolIds.includes("claude-code")),
    ).toBe(false);
  });

  it("filters suggestions by a single selected tool", () => {
    const filtered = suggestionsForSelectedTools(["chatgpt", "claude-code"], {
      filterToolId: "claude-code",
      limit: 50,
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((s) => s.candidateToolIds.includes("claude-code"))).toBe(true);
  });

  it("includes coding suggestions for Claude Code", () => {
    const labels = suggestionsForToolId("claude-code");
    expect(labels.some((l) => /full-stack|vibe-code|debug|test/i.test(l))).toBe(true);
  });

  it("includes business suggestions for HubSpot Breeze", () => {
    const labels = suggestionsForToolId("hubspot-breeze");
    expect(labels.length).toBeGreaterThan(2);
    expect(labels.every((l) => l.split(/\s+/).length <= 8)).toBe(true);
  });

  it("limits the initial recommendation set", () => {
    const initial = suggestionsForSelectedTools(
      ["chatgpt", "claude", "cursor", "perplexity", "hubspot-breeze"],
      { limit: 8 },
    );
    expect(initial.length).toBeLessThanOrEqual(8);
  });

  it("still supports grouped helper without repeating shared labels", () => {
    const groups = suggestionsGroupedByTool(["chatgpt", "claude", "claude-code"], {
      perToolLimit: 20,
      showAll: true,
    });
    expect(groups.map((g) => g.toolId)).toEqual(["chatgpt", "claude", "claude-code"]);
    const labels = groups.flatMap((g) => g.suggestions.map((s) => s.key));
    expect(new Set(labels).size).toBe(labels.length);
  });
});
