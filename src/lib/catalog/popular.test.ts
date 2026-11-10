import { describe, expect, it } from "vitest";
import { catalog } from "@/lib/catalog/adapter";
import { isPopularToolId, POPULAR_TOOL_IDS, popularCatalogTools } from "./popular";

describe("popular tools", () => {
  it("lists only tools that exist in the catalog", () => {
    for (const id of POPULAR_TOOL_IDS) {
      expect(catalog.tool(id), id).toBeTruthy();
    }
    expect(popularCatalogTools().map((t) => t.id)).toEqual([...POPULAR_TOOL_IDS]);
  });

  it("spans AI-native apps and AI-powered software", () => {
    const tools = popularCatalogTools();
    const apps = tools.filter((t) => t.toolType !== "business-ai");
    const software = tools.filter((t) => t.toolType === "business-ai");
    expect(apps.length).toBeGreaterThanOrEqual(6);
    expect(software.map((t) => t.id)).toEqual(
      expect.arrayContaining(["hubspot-breeze", "atlassian-rovo", "shopify-sidekick"]),
    );
  });

  it("identifies popular ids", () => {
    expect(isPopularToolId("claude")).toBe(true);
    expect(isPopularToolId("unknown-tool")).toBe(false);
  });
});
