"use client";

import type { ReactNode } from "react";
import "@/styles/landing.css";
import { StackFlexMark } from "@/components/stackflex/results";
import { LandingShowcase } from "./LandingShowcase";
import { LANDING_SAMPLES } from "./landing-samples";

/**
 * StackFlex landing hero v2: copy + Start on the left, card + LinkedIn banner showcase on the right.
 * Showcase is decorative (aria-hidden); the copy carries the message.
 */
export function LandingHero({
  start,
  headerEnd,
}: {
  /** Primary CTA (Start / StartOver). */
  start: ReactNode;
  /** Optional top-right action (e.g. View my profile). */
  headerEnd?: ReactNode;
}) {
  return (
    <section className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-white text-[#0B0B0C]">
      <div aria-hidden className="sf-landing-grid pointer-events-none absolute inset-0 -z-10" />
      <span
        aria-hidden
        className="pointer-events-none absolute -z-10 hidden h-[47px] w-[47px] bg-[rgba(58,46,255,.07)] lg:block"
        style={{ left: "83.4%", top: 145 }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -z-10 hidden h-[47px] w-[47px] bg-[rgba(215,255,58,.45)] lg:block"
        style={{ left: "90%", top: 721 }}
      />

      <header className="relative z-20 flex h-14 flex-none items-center justify-between px-5 md:h-[88px] md:px-12 xl:px-24">
        <span className="flex items-center gap-2.5">
          <StackFlexMark size={22} />
          <span className="font-display text-[19px] font-semibold tracking-[-0.035em] md:text-[22px]">
            StackFlex
          </span>
        </span>
        {headerEnd}
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 content-start gap-10 px-5 pb-10 pt-5 md:px-12 lg:min-h-0 lg:grid-cols-[400px_minmax(0,1fr)] lg:content-center lg:items-center lg:gap-12 lg:pb-12 lg:pt-0 xl:grid-cols-[430px_minmax(0,1fr)] xl:gap-[58px] xl:px-24">
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 className="font-display text-[46px] font-medium leading-[0.98] tracking-[-0.05em] md:text-[64px] xl:text-[72px] xl:leading-[0.96]">
            Generate your <span className="text-[#3A2EFF]">AI profile.</span>
          </h1>
          <p className="text-pretty text-[17px] leading-[1.4] tracking-[-0.01em] text-[#55534D] md:text-[21px]">
            Choose your AI tools and get a personalized profile card and LinkedIn banner.
          </p>
          <div className="mt-1.5 flex md:mt-3.5">{start}</div>
        </div>

        <LandingShowcase samples={LANDING_SAMPLES} />
      </div>
    </section>
  );
}
