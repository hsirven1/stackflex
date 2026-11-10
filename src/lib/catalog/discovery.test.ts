import { describe, expect, it } from "vitest";
import { GUIDE_FLOW } from "@/components/guided/steps";
import { toolIconSlug } from "@/lib/selection/derive";
import { getLogo } from "./icons";
import { catalog } from "./adapter";
import { TOOLS } from "./data/tools";
import {
  BUSINESS_CATEGORIES,
  DISCOVERY_SECTIONS,
  NATIVE_DISCOVERY_SECTIONS,
  PICKER_FILTER_SECTIONS,
  discoveryIdsForTool,
  primaryDiscovery,
  primaryExperienceGroup,
  primaryPickerSection,
  toolInBusinessCategory,
  toolInDiscovery,
  toolInExperienceGroup,
  toolMatchesPickerFilter,
} from "./discovery";

describe("unified picker filters", () => {
  it("exposes practical picker chips without a Business AI catch-all", () => {
    expect(PICKER_FILTER_SECTIONS.map((s) => s.id)).toEqual([
      "assistants",
      "coding",
      "image",
      "video-audio",
      "research",
      "marketing-crm",
      "commerce",
      "productivity",
      "automation",
      "local",
    ]);
  });

  it("keeps Business AI in discovery metadata for search", () => {
    expect(DISCOVERY_SECTIONS.map((s) => s.id)).toContain("business-ai");
  });

  it("exposes native subcategory chips without Business AI", () => {
    expect(NATIVE_DISCOVERY_SECTIONS.map((s) => s.id)).toEqual([
      "assistants",
      "coding",
      "image",
      "video-audio",
      "research",
      "automation",
      "local",
    ]);
  });

  it("assigns business-ai tools to the work public group", () => {
    const breeze = catalog.tool("hubspot-breeze")!;
    expect(primaryExperienceGroup(breeze)).toBe("work");
    expect(toolInExperienceGroup(breeze, "work")).toBe(true);
    expect(toolInBusinessCategory(breeze, "marketing")).toBe(true);
    expect(toolInBusinessCategory(breeze, "sales-crm")).toBe(true);
    expect(primaryPickerSection(breeze)).toBe("marketing-crm");
    expect(toolMatchesPickerFilter(breeze, "marketing-crm")).toBe(true);
  });

  it("keeps n8n / Cursor / Claude Code in AI Apps", () => {
    expect(primaryExperienceGroup(catalog.tool("n8n")!)).toBe("tools");
    expect(primaryExperienceGroup(catalog.tool("cursor")!)).toBe("tools");
    expect(primaryExperienceGroup(catalog.tool("claude-code")!)).toBe("tools");
    expect(primaryDiscovery(catalog.tool("n8n")!)).toBe("automation");
    expect(primaryPickerSection(catalog.tool("n8n")!)).toBe("automation");
    expect(discoveryIdsForTool(catalog.tool("n8n")!)).not.toContain("business-ai");
  });

  it("lists curated work tools without duplicates", () => {
    const tools = TOOLS.filter((t) => toolInExperienceGroup(t, "work"));
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("hubspot-breeze");
    expect(ids).toContain("shopify-sidekick");
    expect(ids).toContain("atlassian-rovo");
    expect(ids).toContain("salesforce-agentforce");
    expect(ids).not.toContain("n8n");
  });

  it("maps platform search aliases onto AI products", () => {
    const byAlias = (q: string) =>
      TOOLS.filter((t) => (t.aliases ?? []).some((a) => a.toLowerCase().includes(q)));
    expect(byAlias("hubspot").map((t) => t.id)).toContain("hubspot-breeze");
    expect(byAlias("shopify").map((t) => t.id)).toContain("shopify-sidekick");
    expect(byAlias("jira").map((t) => t.id)).toContain("atlassian-rovo");
  });

  it("exposes all business subcategory chips for metadata", () => {
    expect(BUSINESS_CATEGORIES.map((c) => c.id)).toEqual([
      "marketing",
      "sales-crm",
      "commerce",
      "product-projects",
      "operations",
      "customer-support",
    ]);
  });

  it("still marks business-ai tools for discovery metadata", () => {
    expect(toolInDiscovery(catalog.tool("hubspot-breeze")!, "business-ai")).toBe(true);
    expect(primaryDiscovery(catalog.tool("hubspot-breeze")!)).toBe("business-ai");
  });

  it("does not duplicate tools across All picker sections", () => {
    const seen = new Set<string>();
    for (const section of PICKER_FILTER_SECTIONS) {
      for (const tool of TOOLS) {
        if (primaryPickerSection(tool) !== section.id) continue;
        expect(seen.has(tool.id)).toBe(false);
        seen.add(tool.id);
      }
    }
    expect(seen.size).toBe(TOOLS.length);
  });

  it("features each onboarding tool once in the catalog", () => {
    const ids = GUIDE_FLOW.flatMap((step) => (step.kind === "tools" ? step.featuredIds : []));
    const repeated = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(repeated).toEqual([]);
    expect(GUIDE_FLOW[0]).toMatchObject({ id: "assistants", kind: "tools" });
    expect(GUIDE_FLOW.map((s) => s.id)).toEqual([
      "assistants",
      "build",
      "work",
      "automation",
      "creative",
      "other",
      "role",
    ]);
    expect(GUIDE_FLOW.at(-1)?.kind).toBe("role");
    expect(GUIDE_FLOW).toHaveLength(7);
    for (const id of new Set(ids)) {
      const tool = catalog.tool(id);
      expect(tool, id).toBeTruthy();
    }
    expect(getLogo(toolIconSlug(catalog.tool("claude-code")))?.kind).toBe("image");
    expect(getLogo("figma")?.kind).toBe("image");
    expect(getLogo("capcut")?.kind).toBe("image");
    expect(getLogo("zoom")?.kind).toBe("path");
    expect(getLogo("veed")?.kind).toBe("path");
    expect(getLogo(toolIconSlug(catalog.tool("salesforce-agentforce")))?.kind).toBe("image");
    expect(getLogo(toolIconSlug(catalog.tool("openclaw")))?.kind).toBe("image");
    expect(getLogo(toolIconSlug(catalog.tool("hermes-agent")))?.kind).toBe("image");
    expect(getLogo(toolIconSlug(catalog.tool("claude-code")))?.kind).toBe("image");
  });
});
