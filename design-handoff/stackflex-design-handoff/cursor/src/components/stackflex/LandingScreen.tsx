import type { Tool } from "@/lib/stackflex/tools";
import { EXAMPLE_STACK } from "@/lib/stackflex/demo";
import { Wordmark } from "./Brand";
import { PrimaryButton } from "./Controls";
import { BannerArt, SocialCardArt } from "./ShareArt";

// Desktop (lg+) reproduces the approved 1440×900 composition with absolute positions.
// Below lg the layout stacks. This mobile layout was NOT designed in the mocks; review it.
// `stack` defaults to the demo example: the landing page shows an example, not the user's stack.

export function LandingScreen({ onStart, stack = EXAMPLE_STACK }: { onStart?: () => void; stack?: Tool[] }) {
  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden lg:h-[900px]">
        {/* Approved background: 48px blueprint grid (option 2b) with four filled cells, desktop only. */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "linear-gradient(#EEECE6 1px, transparent 1px), linear-gradient(90deg, #EEECE6 1px, transparent 1px)",
          backgroundSize: "48px 48px", backgroundPosition: "0 -8px",
          maskImage: "linear-gradient(180deg, transparent 4%, #000 22%, #000 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 4%, #000 22%, #000 82%, transparent 100%)",
        }} />
        <div aria-hidden className="pointer-events-none absolute hidden lg:block" style={{ left: 673, top: 184, width: 47, height: 47, background: "rgba(58,46,255,.07)" }} />
        <div aria-hidden className="pointer-events-none absolute hidden lg:block" style={{ left: 1393, top: 424, width: 47, height: 47, background: "rgba(58,46,255,.07)" }} />
        <div aria-hidden className="pointer-events-none absolute hidden lg:block" style={{ left: 625, top: 808, width: 47, height: 47, background: "rgba(215,255,58,.35)" }} />
        <div aria-hidden className="pointer-events-none absolute hidden lg:block" style={{ left: 1393, top: 136, width: 47, height: 47, background: "rgba(215,255,58,.35)" }} />
        <header className="relative z-10 flex h-[88px] items-center justify-between px-5 md:px-10 lg:px-24">
          <Wordmark />
          <button type="button" onClick={onStart} className="text-base font-medium">
            Build my stack →
          </button>
        </header>

        <section className="flex flex-col gap-8 px-5 pt-10 md:px-10 lg:absolute lg:left-24 lg:top-[228px] lg:w-[620px] lg:p-0">
          <h1 className="font-display text-[56px] font-medium leading-[0.92] tracking-[-0.055em] md:text-[88px] lg:text-[116px]">
            Show off your AI <span className="text-sf-blue">stack.</span>
          </h1>
          <p className="text-xl leading-[1.35] tracking-[-0.01em] text-sf-body md:text-[26px]">Your tools. Your models. Your flex.</p>
          <div className="mt-3">
            <PrimaryButton size="lg" onClick={onStart}>
              Build my stack
            </PrimaryButton>
          </div>
        </section>

        <div className="relative mt-14 px-5 pb-16 md:px-10 lg:static lg:m-0 lg:p-0">
          <LinkedInPostMock stack={stack} className="ml-auto w-full max-w-[400px] lg:absolute lg:left-[940px] lg:top-12 lg:w-[400px]" />
          <LinkedInProfileMock stack={stack} className="relative -mt-20 w-[92%] max-w-[600px] lg:absolute lg:left-[720px] lg:top-[520px] lg:m-0 lg:w-[600px]" />
        </div>
      </div>
    </main>
  );
}

const SHADOW_POST = "shadow-[0_1px_2px_rgba(11,11,12,.06),0_40px_80px_-40px_rgba(11,11,12,.28)]";
const SHADOW_PROFILE = "shadow-[0_1px_2px_rgba(11,11,12,.06),0_40px_80px_-36px_rgba(11,11,12,.32)]";
const AVATAR = "linear-gradient(140deg, #FFC9A8, #B9A8FF)";
const LI = () => (
  <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#0A66C2] text-[13px] font-bold text-white">in</span>
);

/** Illustrative LinkedIn post (system font on purpose, it represents LinkedIn's UI). */
function LinkedInPostMock({ stack, className = "" }: { stack: Tool[]; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] ${SHADOW_POST} ${className}`}>
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
        <span>Like</span><span>Comment</span><span>Repost</span><span>Send</span>
      </div>
    </div>
  );
}

/** Illustrative LinkedIn profile header with the exported banner. Overlaps the bottom of the post. */
function LinkedInProfileMock({ stack, className = "" }: { stack: Tool[]; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] ${SHADOW_PROFILE} ${className}`}>
      <BannerArt tools={stack} className="border-b border-[#EEE] font-sans text-sf-ink" />
      <div className="relative flex items-start justify-between py-3 pb-4 pl-[140px] pr-5">
        <span className="absolute -top-[52px] left-5 h-[104px] w-[104px] rounded-full border-4 border-white" style={{ background: AVATAR }} />
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-semibold">Maya Chen</span>
          <span className="text-[13px] text-[#666]">Founder at Northbeam</span>
        </div>
        <LI />
      </div>
    </div>
  );
}
