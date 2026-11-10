import { deflateSync } from "fflate";
import { describe, expect, it } from "vitest";
import { EXAMPLE_STATE } from "@/lib/selection/derive";
import type { SelectedItem, StackState } from "@/lib/selection/types";
import {
  createStackShareUrl,
  createStackSnapshot,
  decodeStackSnapshot,
  encodeStack,
  encodeStackSnapshot,
  serializeSnapshot,
  toBase64Url,
} from "./index";

function stackOf(items: SelectedItem[], primaryId: string | null = items[0]?.id ?? null): Pick<StackState, "items" | "primaryId"> {
  return { items, primaryId };
}

const one: SelectedItem = {
  id: "chatgpt",
  toolId: "chatgpt",
  categoryId: "daily",
  modelId: "gpt-4o",
  showVersion: true,
};

const three: SelectedItem[] = [
  { id: "claude", toolId: "claude", categoryId: "daily", modelId: "claude-opus", versionId: "4.5", showVersion: true },
  { id: "cursor", toolId: "cursor", categoryId: "coding", modelId: "claude-sonnet", versionId: "4.5", showVersion: true },
  { id: "n8n", toolId: "n8n", categoryId: "automation", showVersion: true },
];

describe("stack snapshot encoding", () => {
  it("round-trips one tool", () => {
    const input = stackOf([one]);
    const token = encodeStack(input);
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items).toHaveLength(1);
    expect(decoded.stack.items[0]?.toolId).toBe("chatgpt");
    expect(decoded.stack.items[0]?.categoryId).toBe("daily");
    expect(decoded.stack.primaryId).toBe("chatgpt");
  });

  it("round-trips three tools and preserves order + main", () => {
    const input = stackOf(three, "cursor");
    const decoded = decodeStackSnapshot(encodeStack(input));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items.map((i) => i.id)).toEqual(["claude", "cursor", "n8n"]);
    expect(decoded.stack.primaryId).toBe("cursor");
    expect(decoded.snapshot.main).toBe(1);
  });

  it("round-trips six tools from EXAMPLE_STATE", () => {
    const token = encodeStack(EXAMPLE_STATE);
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items).toHaveLength(6);
    expect(decoded.stack.items.map((i) => i.id)).toEqual(EXAMPLE_STATE.items.map((i) => i.id));
    expect(decoded.stack.primaryId).toBe("claude");
    expect(decoded.stack.items[3]?.categoryId).toBe("creative");
    expect(decoded.stack.items[0]?.modelId).toBe("claude-opus");
    expect(decoded.stack.items[0]?.versionId).toBe("4.5");
  });

  it("preserves multiple tools in the same category", () => {
    const items: SelectedItem[] = [
      { id: "chatgpt", toolId: "chatgpt", categoryId: "daily", showVersion: true },
      { id: "claude", toolId: "claude", categoryId: "daily", showVersion: true },
      { id: "gemini", toolId: "gemini", categoryId: "daily", showVersion: true },
    ];
    const decoded = decodeStackSnapshot(encodeStack(stackOf(items, "gemini")));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items.every((i) => i.categoryId === "daily")).toBe(true);
    expect(decoded.stack.primaryId).toBe("gemini");
  });

  it("preserves selected category even when it differs from the tool default", () => {
    const items: SelectedItem[] = [
      { id: "claude", toolId: "claude", categoryId: "coding", showVersion: true },
    ];
    const decoded = decodeStackSnapshot(encodeStack(stackOf(items)));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items[0]?.categoryId).toBe("coding");
  });

  it("round-trips multiple models on one tool", () => {
    const items: SelectedItem[] = [
      {
        id: "chatgpt",
        toolId: "chatgpt",
        categoryId: "daily",
        modelId: "gpt",
        versionId: "5.1",
        models: [
          { modelId: "gpt", versionId: "5.1" },
          { modelId: "gpt", versionId: "4o" },
          { modelId: "openai-o", versionId: "o3" },
        ],
        showVersion: true,
      },
    ];
    const decoded = decodeStackSnapshot(encodeStack(stackOf(items)));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    const item = decoded.stack.items[0]!;
    expect(item.modelId).toBe("gpt");
    expect(item.versionId).toBe("5.1");
    expect(item.models).toEqual([
      { modelId: "gpt", versionId: "5.1" },
      { modelId: "gpt", versionId: "4o" },
      { modelId: "openai-o", versionId: "o3" },
    ]);
    expect(decoded.snapshot.items[0]?.ms).toEqual([
      { m: "gpt", mv: "4o" },
      { m: "openai-o", mv: "o3" },
    ]);
  });

  it("preserves optional model versions and custom model text", () => {
    const items: SelectedItem[] = [
      {
        id: "cursor",
        toolId: "cursor",
        categoryId: "coding",
        modelId: "claude-sonnet",
        customVersion: "4.9-preview",
        showVersion: true,
      },
      {
        id: "custom:my-bot",
        customName: "My Bot",
        categoryId: "automation",
        customModel: "house-model",
        showVersion: false,
      },
    ];
    const decoded = decodeStackSnapshot(encodeStack(stackOf(items, "custom:my-bot")));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items[0]?.customVersion).toBe("4.9-preview");
    expect(decoded.stack.items[1]?.customName).toBe("My Bot");
    expect(decoded.stack.items[1]?.customModel).toBe("house-model");
    expect(decoded.stack.items[1]?.showVersion).toBe(false);
    expect(decoded.stack.primaryId).toBe("custom:my-bot");
  });

  it("preserves optional business AI capabilities and ignores unknown ids", () => {
    const items: SelectedItem[] = [
      {
        id: "hubspot-breeze",
        toolId: "hubspot-breeze",
        categoryId: "automation",
        capabilities: ["content", "agents", "not-a-real-capability"],
        showVersion: true,
      },
      {
        id: "shopify-sidekick",
        toolId: "shopify-sidekick",
        categoryId: "daily",
        showVersion: true,
      },
    ];
    const decoded = decodeStackSnapshot(encodeStack(stackOf(items, "hubspot-breeze")));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items[0]?.capabilities).toEqual(["content", "agents"]);
    expect(decoded.stack.items[1]?.capabilities).toBeUndefined();
    expect(decoded.snapshot.items[0]?.caps).toEqual(["content", "agents"]);
    expect(decoded.snapshot.items[1]?.caps).toBeUndefined();
  });

  it("is deterministic for the same stack", () => {
    const a = encodeStack(EXAMPLE_STATE);
    const b = encodeStack(EXAMPLE_STATE);
    expect(a).toBe(b);
    expect(a.startsWith("v2-")).toBe(true);
  });

  it("round-trips optional identity fields in v2 snapshots", () => {
    const token = encodeStack(stackOf(three, "claude"), {
      displayName: "Ada Lovelace",
      professionalTitle: "Mathematician",
      avatarReference: "https://cdn.example.com/ada.jpg",
    });
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.identity.displayName).toBe("Ada Lovelace");
    expect(decoded.identity.professionalTitle).toBe("Mathematician");
    expect(decoded.identity.avatarReference).toBe("https://cdn.example.com/ada.jpg");
    expect(decoded.stack.items).toHaveLength(3);
  });

  it("omits non-https avatar references from snapshots", () => {
    const token = encodeStack(stackOf([one]), {
      displayName: "Test",
      professionalTitle: "",
      avatarReference: "http://insecure.example/a.png",
    });
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.identity.displayName).toBe("Test");
    expect(decoded.identity.avatarReference).toBeUndefined();
  });

  it("still decodes legacy v1 tool-only tokens", () => {
    const json = JSON.stringify({
      v: 1,
      items: [{ t: "claude", c: "daily", m: "claude-opus", mv: "4.5" }],
      main: 0,
    });
    const token = `v1-${toBase64Url(deflateSync(new TextEncoder().encode(json), { level: 9 }))}`;
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.snapshot.v).toBe(1);
    expect(decoded.stack.items[0]?.toolId).toBe("claude");
    expect(decoded.identity.displayName).toBeUndefined();
  });

  it("does not introduce extra tools", () => {
    const decoded = decodeStackSnapshot(encodeStack(stackOf(three)));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items).toHaveLength(3);
  });

  it("keeps previously encoded snapshots stable when the local stack later changes", () => {
    const original = encodeStack(stackOf(three, "claude"));
    const edited = stackOf(
      [...three, { id: "midjourney", toolId: "midjourney", categoryId: "creative", showVersion: true }],
      "n8n",
    );
    const originalDecoded = decodeStackSnapshot(original);
    const editedToken = encodeStack(edited);
    expect(originalDecoded.ok).toBe(true);
    if (!originalDecoded.ok) return;
    expect(originalDecoded.stack.items).toHaveLength(3);
    expect(originalDecoded.stack.primaryId).toBe("claude");
    expect(editedToken).not.toBe(original);
    const editedDecoded = decodeStackSnapshot(editedToken);
    expect(editedDecoded.ok).toBe(true);
    if (!editedDecoded.ok) return;
    expect(editedDecoded.stack.items).toHaveLength(4);
    expect(editedDecoded.stack.primaryId).toBe("n8n");
  });

  it("preserves different tool orderings", () => {
    const forward = encodeStack(stackOf(three));
    const reverse = encodeStack(stackOf([...three].reverse()));
    expect(forward).not.toBe(reverse);
    const decoded = decodeStackSnapshot(reverse);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items.map((i) => i.id)).toEqual(["n8n", "cursor", "claude"]);
  });

  it("hydrates legacy/unknown model ids without crashing", () => {
    const snap = createStackSnapshot(stackOf([one]));
    snap.items[0]!.m = "gpt-ancient-legacy";
    snap.items[0]!.mv = "1.0";
    const token = encodeStackSnapshot(snap);
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items[0]?.toolId).toBe("chatgpt");
    expect(decoded.stack.items[0]?.modelId).toBeUndefined();
    expect(decoded.stack.items[0]?.customModel).toContain("gpt-ancient-legacy");
  });

  it("rejects invalid and oversized tokens", () => {
    expect(decodeStackSnapshot("").ok).toBe(false);
    expect(decodeStackSnapshot("not-a-token").ok).toBe(false);
    expect(decodeStackSnapshot("v2-abc").ok).toBe(false);
    expect(decodeStackSnapshot("v3-abc").ok).toBe(false);
    expect(decodeStackSnapshot("v1-@@@").ok).toBe(false);
    expect(decodeStackSnapshot(`v2-${"a".repeat(9000)}`).ok).toBe(false);
  });

  it("rejects empty snapshots at encode time", () => {
    expect(() => encodeStack(stackOf([]))).toThrow(/1–/);
  });

  it("round-trips more than six tools including duplicate categories", () => {
    const items: SelectedItem[] = [
      { id: "claude", toolId: "claude", categoryId: "daily", showVersion: true },
      { id: "chatgpt", toolId: "chatgpt", categoryId: "daily", showVersion: true },
      { id: "cursor", toolId: "cursor", categoryId: "coding", showVersion: true },
      { id: "github-copilot", toolId: "github-copilot", categoryId: "coding", showVersion: true },
      { id: "midjourney", toolId: "midjourney", categoryId: "creative", showVersion: true },
      { id: "runway", toolId: "runway", categoryId: "creative", showVersion: true },
      { id: "perplexity", toolId: "perplexity", categoryId: "research", showVersion: true },
      { id: "notebooklm", toolId: "notebooklm", categoryId: "research", showVersion: true },
    ];
    const token = encodeStack(stackOf(items, "claude"));
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.stack.items).toHaveLength(8);
    expect(decoded.stack.items.map((i) => i.id)).toEqual(items.map((i) => i.id));
    expect(decoded.stack.items.filter((i) => i.categoryId === "daily")).toHaveLength(2);
  });

  it("rejects invalid main index at encode time", () => {
    const snap = createStackSnapshot(stackOf([one]));
    snap.main = 9;
    expect(() => encodeStackSnapshot(snap)).toThrow(/Main/);
  });

  it("builds absolute share URLs without embedding the host in the token", () => {
    const { url, token, isLocal } = createStackShareUrl(EXAMPLE_STATE, "https://stackflex.app");
    expect(token.startsWith("v2-")).toBe(true);
    expect(url).toBe(`https://stackflex.app/s/${token}`);
    expect(isLocal).toBe(false);
    expect(serializeSnapshot(createStackSnapshot(EXAMPLE_STATE))).not.toContain("stackflex.app");
  });

  it("marks localhost origins as local for copy warnings", () => {
    const { isLocal } = createStackShareUrl(stackOf([one]), "http://localhost:3000");
    expect(isLocal).toBe(true);
  });

  it("round-trips approved activities with multi-tool associations", () => {
    const activities = [
      { label: "Build full-stack apps", toolIds: ["claude", "cursor"] },
      { label: "Brainstorm product ideas", toolIds: ["claude"] },
    ];
    const token = encodeStack(stackOf(three, "claude"), null, activities);
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.activities).toEqual([
      { l: "Build full-stack apps", t: ["claude", "cursor"] },
      { l: "Brainstorm product ideas", t: ["claude"] },
    ]);
    expect(decoded.snapshot.v).toBe(2);
    if (decoded.snapshot.v === 2) {
      expect(decoded.snapshot.acts).toHaveLength(2);
    }
  });

  it("keeps legacy v2 tokens without acts valid and activity-empty", () => {
    const token = encodeStack(stackOf(three));
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.activities).toEqual([]);
  });

  it("rejects activities that reference tools outside the snapshot", () => {
    expect(() =>
      encodeStack(stackOf([one]), null, [{ label: "Draft emails", toolIds: ["claude"] }]),
    ).toThrow(/not in this stack|needs at least one tool/);
  });

  it("rejects encoding when an activity has no tools", () => {
    expect(() =>
      encodeStack(stackOf([one]), null, [{ label: "Draft emails", toolIds: [] }]),
    ).toThrow(/needs at least one tool/);
  });

  it("does not change a previously shared token when local activities are edited later", () => {
    const original = encodeStack(stackOf(three), null, [
      { label: "Automate workflows", toolIds: ["n8n"] },
    ]);
    const later = encodeStack(stackOf(three), null, [
      { label: "Automate workflows", toolIds: ["n8n"] },
      { label: "Brainstorm ideas", toolIds: ["claude"] },
    ]);
    expect(later).not.toBe(original);
    const decodedOriginal = decodeStackSnapshot(original);
    expect(decodedOriginal.ok).toBe(true);
    if (!decodedOriginal.ok) return;
    expect(decodedOriginal.activities).toHaveLength(1);
  });

  it("includes activities via createStackShareUrl options", () => {
    const { token } = createStackShareUrl(stackOf([one]), {
      origin: "https://stackflex.app",
      activities: [{ label: "Draft emails", toolIds: ["chatgpt"] }],
    });
    const decoded = decodeStackSnapshot(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.activities[0]?.l).toBe("Draft emails");
  });
});
