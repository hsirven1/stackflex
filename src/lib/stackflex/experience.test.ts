import { describe, expect, it } from "vitest";
import { EXPERIENCE_SECTIONS, partitionExperience, visibleExperienceSections } from "./experience";
import type { Tool } from "./tools";

function tool(partial: Partial<Tool> & Pick<Tool, "id" | "name">): Tool {
  return {
    category: "Daily",
    aura: "#98A6B8",
    monogram: partial.name.slice(0, 2).toUpperCase(),
    ...partial,
  };
}

describe("experience sections", () => {
  it("uses the exact public section titles", () => {
    expect(EXPERIENCE_SECTIONS.tools.title).toBe("AI Apps");
    expect(EXPERIENCE_SECTIONS.work.title).toBe("AI-Powered Software");
    expect(EXPERIENCE_SECTIONS.workflows.title).toBe("AI workflows I've built or enabled");
  });

  it("keeps AI-native tools in tools and business-ai in work", () => {
    const parts = partitionExperience([
      tool({ id: "chatgpt", name: "ChatGPT" }),
      tool({ id: "hubspot-breeze", name: "HubSpot Breeze", atWork: true }),
      tool({ id: "n8n", name: "n8n" }),
    ]);
    expect(parts.tools.map((t) => t.id)).toEqual(["chatgpt", "n8n"]);
    expect(parts.work.map((t) => t.id)).toEqual(["hubspot-breeze"]);
    expect(parts.workflows).toEqual([]);
  });

  it("does not invent a workflows section from automation tools alone", () => {
    const sections = visibleExperienceSections([
      tool({ id: "zapier", name: "Zapier" }),
      tool({ id: "make", name: "Make" }),
    ]);
    expect(sections.map((s) => s.kind)).toEqual(["tools"]);
  });

  it("hides empty sections and shows workflows only when provided", () => {
    const onlyNative = visibleExperienceSections([tool({ id: "claude", name: "Claude" })]);
    expect(onlyNative.map((s) => s.kind)).toEqual(["tools"]);

    const onlyWork = visibleExperienceSections([
      tool({ id: "shopify-sidekick", name: "Shopify Sidekick", atWork: true }),
    ]);
    expect(onlyWork.map((s) => s.kind)).toEqual(["work"]);

    const mixed = visibleExperienceSections(
      [
        tool({ id: "claude", name: "Claude" }),
        tool({ id: "hubspot-breeze", name: "HubSpot Breeze", atWork: true }),
      ],
      [{ id: "wf1", title: "Lead triage agent" }],
    );
    expect(mixed.map((s) => s.kind)).toEqual(["tools", "work", "workflows"]);
  });
});
