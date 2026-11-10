import { describe, expect, it } from "vitest";
import {
  GENERALIST_MAX_SHARE,
  GENERALIST_MIN_CATEGORIES,
  classifyWorkingStyle,
  explainWorkingStyle,
} from "./workingStyle";

describe("classifyWorkingStyle", () => {
  it("handles no selected tools", () => {
    const r = classifyWorkingStyle({ toolIds: [] });
    expect(r.toolCount).toBe(0);
    expect(r.scoringToolCount).toBe(0);
    expect(r.id).toBe("strategist");
    expect(r.categoryCount).toBe(0);
  });

  it("classifies a single assistant as strategist (not specialist)", () => {
    const r = classifyWorkingStyle({ toolIds: ["chatgpt"] });
    expect(r.id).toBe("strategist");
    expect(r.scoringToolCount).toBe(1);
    expect(r.name).toBe("AI Strategist");
  });

  it("classifies several tools in one build category as builder", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code", "github-copilot"],
    });
    expect(r.id).toBe("builder");
  });

  it("detects generalist when four+ categories and no category dominates", () => {
    const toolIds = [
      "chatgpt", // assistant
      "cursor", // build
      "n8n", // agents
      "midjourney", // create
      "elicit", // research
    ];
    const r = classifyWorkingStyle({ toolIds });
    expect(r.categoryCount).toBeGreaterThanOrEqual(GENERALIST_MIN_CATEGORIES);
    const shares = Object.values(r.categoryCounts).map(
      (n) => (n ?? 0) / r.scoringToolCount,
    );
    expect(Math.max(...shares)).toBeLessThanOrEqual(GENERALIST_MAX_SHARE + 0.001);
    expect(r.id).toBe("generalist");
    expect(r.name).toBe("AI Orchestrator");
    expect(r.tagline).toBe(
      "Brings different AI tools together across research, creation, and execution.",
    );
  });

  it("keeps the orchestrator name and tagline when a role is set", () => {
    const r = classifyWorkingStyle({
      toolIds: ["chatgpt", "cursor", "n8n", "midjourney", "elicit"],
      role: "product-manager",
    });
    expect(r.id).toBe("generalist");
    expect(r.name).toBe("AI Orchestrator");
    expect(r.tagline).toBe(
      "Brings different AI tools together across research, creation, and execution.",
    );
  });

  it("does not force generalist when one category exceeds the share threshold", () => {
    // 3 build + 1 assistant + 1 research + 1 create = 6 tools, build = 50%
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code", "github-copilot", "chatgpt", "elicit", "midjourney"],
    });
    expect(r.id).not.toBe("generalist");
    expect(r.id).toBe("builder");
  });

  it("detects dominant building tools", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "lovable", "chatgpt"],
    });
    expect(r.id).toBe("builder");
  });

  it("detects dominant automation tools as operator", () => {
    const r = classifyWorkingStyle({
      toolIds: ["n8n", "zapier", "make"],
    });
    expect(r.id).toBe("operator");
  });

  it("detects dominant research tools", () => {
    const r = classifyWorkingStyle({
      toolIds: ["elicit", "notebooklm", "kagi"],
    });
    expect(r.id).toBe("researcher");
  });

  it("detects dominant creative tools", () => {
    const r = classifyWorkingStyle({
      toolIds: ["midjourney", "runway", "elevenlabs"],
    });
    expect(r.id).toBe("creative");
  });

  it("maps local AI tools toward builder", () => {
    const r = classifyWorkingStyle({ toolIds: ["ollama", "lm-studio"] });
    expect(r.id).toBe("builder");
    expect(r.categoryCounts.local).toBe(2);
  });

  it("breaks ties deterministically favoring builder over operator", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "n8n"],
    });
    expect(r.id).toBe("builder");
  });

  it("ignores custom and unknown tools in category scoring", () => {
    const r = classifyWorkingStyle({
      toolIds: ["custom:my-bot", "not-a-real-tool", "cursor"],
    });
    expect(r.toolCount).toBe(3);
    expect(r.scoringToolCount).toBe(1);
    expect(r.id).toBe("builder");
    expect(r.categoryCounts.build).toBe(1);
  });

  it("counts a tool once even if it appears in several discovery categories", () => {
    // perplexity is daily+research; working style uses primary resolution once
    const r = classifyWorkingStyle({ toolIds: ["perplexity"] });
    expect(r.scoringToolCount).toBe(1);
    const total = Object.values(r.categoryCounts).reduce((a, n) => a + (n ?? 0), 0);
    expect(total).toBe(1);
  });

  it("personalizes tagline with role without changing classification", () => {
    const base = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code"],
    });
    const withRole = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code"],
      role: "product-manager",
    });
    expect(withRole.id).toBe(base.id);
    expect(withRole.id).toBe("builder");
    expect(withRole.tagline).toContain("product ideas");
    expect(withRole.tagline).not.toBe(base.tagline);
  });

  it("labels a deep narrow stack as specialist", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code", "github-copilot", "codex"],
    });
    expect(r.scoringToolCount).toBe(4);
    expect(r.categoryCount).toBe(1);
    expect(r.id).toBe("specialist");
  });

  it("treats business-ai work tools as strategist signal", () => {
    const r = classifyWorkingStyle({
      toolIds: ["hubspot-breeze", "notion-ai", "slack-ai"],
    });
    expect(r.id).toBe("strategist");
    expect(r.categoryCounts.work_apps).toBe(3);
  });

  it("maps creative tools to creative and meeting tools to meetings", () => {
    const r = classifyWorkingStyle({
      toolIds: ["figma-ai", "canva-ai", "midjourney", "runway", "capcut", "fathom", "notebooklm"],
    });
    expect(r.categoryCounts.create).toBe(5);
    expect(r.categoryCounts.meetings).toBe(1);
    expect(r.categoryCounts.research).toBe(1);
    expect(r.id).toBe("creative");
  });

  it("maps openclaw and hermes-agent to agents/operator", () => {
    const r = classifyWorkingStyle({
      toolIds: ["openclaw", "hermes-agent", "zapier"],
    });
    expect(r.id).toBe("operator");
    expect(r.categoryCounts.agents).toBe(3);
  });
});

describe("explainWorkingStyle", () => {
  it("explains orchestrator breadth from several categories", () => {
    const r = classifyWorkingStyle({
      toolIds: ["chatgpt", "cursor", "n8n", "midjourney", "elicit"],
    });
    const text = explainWorkingStyle(r);
    expect(r.id).toBe("generalist");
    expect(text).toMatch(/span several areas/i);
    expect(text).toMatch(/breadth/i);
    expect(text.toLowerCase()).toMatch(/building|automation|creative|research|assistance/);
  });

  it("explains builder from development tools", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code", "github-copilot"],
    });
    const text = explainWorkingStyle(r);
    expect(r.id).toBe("builder");
    expect(text).toMatch(/building and prototyping/i);
  });

  it("explains researcher", () => {
    const r = classifyWorkingStyle({
      toolIds: ["elicit", "notebooklm", "kagi"],
    });
    expect(explainWorkingStyle(r)).toMatch(/research and information-analysis/i);
  });

  it("explains a single assistant strategist with the tool name", () => {
    const r = classifyWorkingStyle({ toolIds: ["chatgpt"] });
    const text = explainWorkingStyle(r, { toolNames: ["ChatGPT"] });
    expect(r.id).toBe("strategist");
    expect(text).toMatch(/ChatGPT/);
    expect(text).toMatch(/Strategist/);
  });

  it("explains specialist concentration", () => {
    const r = classifyWorkingStyle({
      toolIds: ["cursor", "claude-code", "github-copilot", "codex"],
    });
    const text = explainWorkingStyle(r);
    expect(r.id).toBe("specialist");
    expect(text).toMatch(/concentrated/i);
    expect(text).toMatch(/Specialist/);
  });

  it("explains operator automation", () => {
    const r = classifyWorkingStyle({
      toolIds: ["n8n", "zapier", "make"],
    });
    expect(explainWorkingStyle(r)).toMatch(/automation and agent/i);
  });

  it("explains creative tools", () => {
    const r = classifyWorkingStyle({
      toolIds: ["midjourney", "runway", "elevenlabs"],
    });
    expect(explainWorkingStyle(r)).toMatch(/creative tools/i);
  });

  it("does not invent mastery or frequency claims", () => {
    const r = classifyWorkingStyle({
      toolIds: ["chatgpt", "cursor", "n8n", "midjourney", "elicit"],
    });
    const text = explainWorkingStyle(r).toLowerCase();
    expect(text).not.toMatch(/expert|master|skilled|frequent|years|proficien/);
  });
});
