import { describe, expect, it } from "vitest";
import { toProfileData } from "./toProfileData";

describe("toProfileData", () => {
  it("maps apps vs software from catalog toolType", () => {
    const data = toProfileData({
      stack: {
        primaryId: "claude",
        items: [
          { id: "claude", toolId: "claude", categoryId: "daily", showVersion: true },
          { id: "cursor", toolId: "cursor", categoryId: "coding", showVersion: true },
          {
            id: "hubspot-breeze",
            toolId: "hubspot-breeze",
            categoryId: "daily",
            showVersion: true,
          },
        ],
      },
      identity: { displayName: "Ada", professionalTitle: "Engineer" },
      activities: [
        { id: "a1", label: "Build full-stack apps", toolIds: ["cursor"] },
        { id: "a2", label: "Draft marketing content", toolIds: ["hubspot-breeze"] },
      ],
    });

    expect(data.identity.name).toBe("Ada");
    expect(data.mainToolId).toBe("claude");
    expect(data.tools.find((t) => t.id === "claude")?.section).toBe("apps");
    expect(data.tools.find((t) => t.id === "cursor")?.section).toBe("apps");
    expect(data.tools.find((t) => t.id === "hubspot-breeze")?.section).toBe("software");
    expect(data.activities[0]?.title).toBe("Build full-stack apps");
    expect(data.activities[0]?.toolIds).toEqual(["cursor"]);
  });

  it("drops activities without tools and preserves selection order", () => {
    const data = toProfileData({
      stack: {
        primaryId: "chatgpt",
        items: [
          { id: "chatgpt", toolId: "chatgpt", categoryId: "daily", showVersion: true },
          { id: "claude", toolId: "claude", categoryId: "daily", showVersion: true },
        ],
      },
      activities: [
        { id: "x", label: "Orphan", toolIds: [] },
        { id: "y", label: "Brainstorm ideas", toolIds: ["chatgpt", "claude"] },
      ],
    });
    expect(data.tools.map((t) => t.id)).toEqual(["chatgpt", "claude"]);
    expect(data.activities).toHaveLength(1);
    expect(data.activities[0]?.id).toBe("y");
  });
});
