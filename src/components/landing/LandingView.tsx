"use client";

import type { CSSProperties } from "react";
import { Wordmark } from "@/components/stackflex/Brand";
import { focusRing, PrimaryButton } from "@/components/stackflex/Controls";
import { BannerArt, SocialCardArt } from "@/components/stackflex/ShareArt";
import { StartOver } from "@/components/stackflex/StartOver";
import { restartGuide } from "@/lib/guide";
import type { StackState } from "@/lib/selection/types";
import { stackTools, type Tool } from "@/lib/stackflex/tools";
import { navigate } from "@/lib/view";

/** Display-only sample from the approved mocks; it is never written to the store or localStorage. */
const EXAMPLE_STACK: Tool[] = stackTools({
  primaryId: "claude",
  items: [
    { id: "claude", toolId: "claude", categoryId: "daily", modelId: "claude-opus", versionId: "4.6", showVersion: true },
    { id: "cursor", toolId: "cursor", categoryId: "coding", showVersion: true },
    { id: "claude-code", toolId: "claude-code", categoryId: "coding", modelId: "claude-opus", versionId: "4.6", showVersion: true },
    { id: "n8n", toolId: "n8n", categoryId: "automation", showVersion: true },
    { id: "midjourney", toolId: "midjourney", categoryId: "creative", modelId: "midjourney", versionId: "v7", showVersion: true },
    { id: "ollama", toolId: "ollama", categoryId: "local", modelId: "qwen", versionId: "3", showVersion: true },
  ],
});

// From xl the approved 1440×900 composition is reproduced with absolute positions; the showcase is
// anchored to the right edge so it stays clear of the headline down to 1280. Below xl the layout
// stacks (a proposal from the handoff, not an approved design).
export function LandingView({ stack, guideActive }: { stack: StackState; guideActive: boolean }) {
  const count = stack.items.length;
  const primary =
    count === 0
      ? {
          label: "Build my stack",
          go: () => {
            restartGuide();
            navigate("guide");
          },
        }
      : guideActive
        ? { label: "Continue my stack", go: () => navigate("guide") }
        : { label: "View my stack", go: () => navigate("results") };

  return (
    <div className="flex-1 bg-white text-sf-ink">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden xl:h-[900px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRID} />
        {FILLED_CELLS.map((cell) => (
          <div
            key={`${cell.left}-${cell.top}`}
            aria-hidden="true"
            className="pointer-events-none absolute hidden size-[47px] xl:block"
            style={cell}
          />
        ))}
        <header className="relative z-10 flex h-[88px] items-center justify-between px-5 md:px-10 lg:px-24">
          <Wordmark />
          <button type="button" onClick={primary.go} className={`rounded-full text-base font-medium ${focusRing}`}>
            {primary.label} →
          </button>
        </header>

        <main>
          <section className="relative z-10 flex flex-col gap-8 px-5 pt-10 md:px-10 lg:px-24 xl:absolute xl:left-24 xl:top-[228px] xl:w-[620px] xl:p-0">
            <h1 className="font-display text-[56px] font-medium leading-[0.92] tracking-[-0.055em] md:text-[88px] xl:text-[116px]">
              Show off your AI <span className="text-sf-blue">stack.</span>
            </h1>
            <p className="text-xl leading-[1.35] tracking-[-0.01em] text-sf-body md:text-[26px]">
              Your tools. Your models. Your flex.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
              <PrimaryButton size="lg" onClick={primary.go}>
                {primary.label}
              </PrimaryButton>
              {count > 0 && <StartOver count={count} />}
            </div>
          </section>

          <div
            aria-label="Example: a StackFlex social card in a LinkedIn post, and a StackFlex LinkedIn banner"
            role="img"
            className="relative z-10 mt-14 px-5 pb-16 md:px-10 lg:px-24 xl:static xl:m-0 xl:p-0"
          >
            <LinkedInPostMock
              stack={EXAMPLE_STACK}
              className="ml-auto w-full max-w-[400px] xl:absolute xl:right-[100px] xl:top-12 xl:z-10 xl:w-[400px]"
            />
            <LinkedInProfileMock
              stack={EXAMPLE_STACK}
              className="relative -mt-20 w-[92%] max-w-[600px] xl:absolute xl:right-[120px] xl:top-[520px] xl:z-10 xl:m-0 xl:w-[600px]"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

const GRID_FADE = "linear-gradient(180deg, transparent 4%, #000 22%, #000 82%, transparent 100%)";
const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(var(--color-sf-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-sf-grid) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  backgroundPosition: "0 -8px",
  maskImage: GRID_FADE,
  WebkitMaskImage: GRID_FADE,
};

/** Positions in the 1440×900 desktop frame, each inside one grid cell. Hidden once the layout stacks. */
const ULTRAMARINE_CELL = "rgba(58,46,255,.07)";
const LIME_CELL = "rgba(215,255,58,.35)";
const FILLED_CELLS: CSSProperties[] = [
  { left: 673, top: 184, background: ULTRAMARINE_CELL },
  { left: 1393, top: 424, background: ULTRAMARINE_CELL },
  { left: 625, top: 808, background: LIME_CELL },
  { left: 1393, top: 136, background: LIME_CELL },
];

const SHADOW_POST = "shadow-[0_1px_2px_rgba(11,11,12,.06),0_40px_80px_-40px_rgba(11,11,12,.28)]";
const SHADOW_PROFILE = "shadow-[0_1px_2px_rgba(11,11,12,.06),0_40px_80px_-36px_rgba(11,11,12,.32)]";
const AVATAR = "linear-gradient(140deg, #FFC9A8, #B9A8FF)";
const LI = () => (
  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-sf-linkedin text-[13px] font-bold text-white">
    in
  </span>
);

/** Illustrative LinkedIn post (system font on purpose, it represents LinkedIn's UI). */
function LinkedInPostMock({ stack, className = "" }: { stack: Tool[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] ${SHADOW_POST} ${className}`}>
      <div className="flex items-center gap-2.5 px-4 pb-2.5 pt-3.5">
        <span className="h-11 w-11 rounded-full" style={{ background: AVATAR }} />
        <div className="flex flex-1 flex-col gap-px">
          <span className="text-sm font-semibold">
            Maya Chen <span className="font-normal text-[#666]">· 1st</span>
          </span>
          <span className="text-xs text-[#666]">Founder at Northbeam</span>
          <span className="text-xs text-[#666]">2h · Edited</span>
        </div>
        <LI />
      </div>
      <SocialCardArt tools={stack} className="border-y border-[#EEE] font-sans text-sf-ink" />
      <div className="flex justify-between border-b border-[#EEE] px-4 py-2 text-xs text-[#666]">
        <span>Daniel Ortiz and 247 others</span>
        <span>32 comments · 14 reposts</span>
      </div>
      <div className="flex justify-around px-4 py-1.5 text-[13px] font-semibold text-[#555]">
        <span>Like</span>
        <span>Comment</span>
        <span>Repost</span>
        <span>Send</span>
      </div>
    </div>
  );
}

/** Illustrative LinkedIn profile header with the exported banner. Overlaps the bottom of the post. */
function LinkedInProfileMock({ stack, className = "" }: { stack: Tool[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] ${SHADOW_PROFILE} ${className}`}>
      <BannerArt tools={stack} className="border-b border-[#EEE] font-sans text-sf-ink" />
      <div className="relative flex items-start justify-between py-3 pb-4 pl-[140px] pr-5">
        <span
          className="absolute -top-[52px] left-5 h-[104px] w-[104px] rounded-full border-4 border-white"
          style={{ background: AVATAR }}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-semibold">Maya Chen</span>
          <span className="text-[13px] text-[#666]">Founder at Northbeam</span>
        </div>
        <LI />
      </div>
    </div>
  );
}
