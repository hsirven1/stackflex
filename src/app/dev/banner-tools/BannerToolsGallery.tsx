"use client";

import { catalog } from "@/lib/catalog/adapter";
import { monogramFor, toolIconSlug } from "@/lib/selection/derive";
import {
  BannerProfilePreview,
  BANNER_MAX_TOOLS,
  LinkedInBanner,
  planBannerToolLayout,
  type AIProfile,
  type CardTheme,
  type CardTool,
} from "@/components/stackflex/results";
import { logoDataUrl } from "@/lib/stackflex/logoDataUrl";
import { useState } from "react";

type Fixture = {
  id: string;
  title: string;
  note?: string;
  toolIds: string[];
};

const FIXTURES: Fixture[] = [
  { id: "1", title: "1 tool", toolIds: ["chatgpt"] },
  { id: "2", title: "2 tools", toolIds: ["chatgpt", "cursor"] },
  { id: "3", title: "3 tools", toolIds: ["chatgpt", "cursor", "claude"] },
  { id: "4", title: "4 tools", toolIds: ["chatgpt", "cursor", "claude", "gemini"] },
  {
    id: "5-short",
    title: "5 tools · short names",
    toolIds: ["chatgpt", "claude", "gemini", "cursor", "v0"],
  },
  {
    id: "5-long",
    title: "5 tools · long names (screenshot case)",
    note: "ChatGPT, Cursor, Hermes Agent, Claude Design, ElevenLabs — all names should read in full.",
    toolIds: ["chatgpt", "cursor", "hermes-agent", "claude-design", "elevenlabs"],
  },
  {
    id: "6",
    title: "6 tools",
    toolIds: ["chatgpt", "cursor", "claude", "gemini", "perplexity", "n8n"],
  },
  {
    id: "8",
    title: "8 tools",
    toolIds: [
      "chatgpt",
      "cursor",
      "claude",
      "gemini",
      "perplexity",
      "n8n",
      "github-copilot",
      "midjourney",
    ],
  },
  {
    id: "10",
    title: "10 tools",
    toolIds: [
      "chatgpt",
      "cursor",
      "claude",
      "gemini",
      "perplexity",
      "n8n",
      "github-copilot",
      "midjourney",
      "zapier",
      "notion-ai",
    ],
  },
  {
    id: "12",
    title: "12 tools → capped",
    note: `Banner shows first ${BANNER_MAX_TOOLS} only.`,
    toolIds: [
      "chatgpt",
      "cursor",
      "claude",
      "gemini",
      "perplexity",
      "n8n",
      "github-copilot",
      "midjourney",
      "zapier",
      "notion-ai",
      "grok",
      "make",
    ],
  },
  {
    id: "long-enterprise",
    title: "Long enterprise names",
    note: "Includes Salesforce Agentforce and Microsoft 365 Copilot.",
    toolIds: [
      "salesforce-agentforce",
      "m365-copilot",
      "github-copilot",
      "gemini-workspace",
      "hubspot-breeze",
    ],
  },
];

function sampleTool(toolId: string): CardTool {
  const tool = catalog.tool(toolId);
  if (!tool) {
    return { id: toolId, name: toolId, category: "Custom", monogram: monogramFor(toolId) };
  }
  const categoryId = tool.categories[0];
  const category =
    (categoryId && catalog.category(categoryId)?.cardLabel) || tool.descriptor || "AI";
  const logo = logoDataUrl(toolIconSlug(tool));
  return {
    id: tool.id,
    name: tool.name,
    category,
    ...(logo ? { logo } : {}),
    monogram: tool.monogram ?? monogramFor(tool.name),
    accent: tool.aura,
  };
}

function profileFor(toolIds: string[]): AIProfile {
  const tools = toolIds.map(sampleTool);
  return {
    workingStyle: {
      id: "builder",
      title: "AI Builder",
      tagline: "Ships real products, with AI as a co-builder.",
    },
    tools,
    toolCount: tools.length,
    categoryCount: new Set(tools.map((t) => t.category)).size,
  };
}

export function BannerToolsGallery() {
  const [theme, setTheme] = useState<CardTheme>("dark");

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-10 text-[#0B0B0C]">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C897F]">Dev</p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[-0.04em]">
              LinkedIn banner tool layouts
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#6F6D66]">
              Adaptive grid from name length · cap {BANNER_MAX_TOOLS} · no “+N more” · 1584×396.
              Fewer tools should mean more breathing room, not more truncation.
            </p>
          </div>
          <div className="flex h-9 gap-0.5 rounded-full bg-white p-1 shadow-sm" role="radiogroup" aria-label="Theme">
            {(["dark", "light"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`rounded-full px-3 text-sm font-semibold capitalize ${
                  theme === t ? "bg-[#0B0B0C] text-white" : "text-[#6F6D66]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {FIXTURES.map((fixture) => {
          const profile = profileFor(fixture.toolIds);
          const shown = Math.min(profile.tools.length, BANNER_MAX_TOOLS);
          const plan = planBannerToolLayout(profile.tools.slice(0, BANNER_MAX_TOOLS));
          return (
            <section key={fixture.id} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.02em]">{fixture.title}</h2>
                  {fixture.note && <p className="mt-1 text-sm text-[#6F6D66]">{fixture.note}</p>}
                </div>
                <p className="text-xs text-[#8C897F]">
                  {shown} on banner · {plan.cols} col · {plan.density}
                  {profile.tools.length > BANNER_MAX_TOOLS && ` · capped from ${profile.tools.length}`}
                </p>
              </div>
              <LinkedInBanner profile={profile} theme={theme} />
              <div className="max-w-[720px]">
                <BannerProfilePreview
                  profile={profile}
                  theme={theme}
                  displayName="Alex Morgan"
                  headline="Product Manager at Northwind"
                  avatarUrl={undefined}
                />
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
