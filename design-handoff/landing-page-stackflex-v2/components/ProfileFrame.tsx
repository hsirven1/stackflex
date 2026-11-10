/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import type { LandingSamples } from "./LandingShowcase";

/**
 * Minimal, generic profile context around the banner: photo, name, headline, one meta line.
 * No LinkedIn logo, nav, buttons or brand colors. Landing only; never exported.
 */
export function ProfileFrame({ width, person, compact = false, children }: {
  width: number; person: LandingSamples["person"]; compact?: boolean; children: ReactNode;
}) {
  const av = compact ? 76 : 128;
  const inset = compact ? 14 : 24;
  return (
    <div className={`overflow-hidden bg-white ${compact ? "rounded-xl shadow-[0_0_0_1px_#E6E3DC,0_24px_40px_-26px_rgba(30,20,90,.4)]" : "rounded-2xl shadow-[0_0_0_1px_#E6E3DC,0_40px_80px_-44px_rgba(30,20,90,.4)]"}`} style={{ width }}>
      <div className="relative">
        {children}
        <span className="absolute flex items-center justify-center overflow-hidden rounded-full border-white bg-[linear-gradient(135deg,#FFD9C2,#C9B8FF)] font-display font-medium tracking-[-0.03em] text-[#3A2EFF]"
          style={{ left: inset, bottom: -av / 2 - (compact ? 0 : 4), width: av, height: av, borderWidth: compact ? 3 : 4, fontSize: Math.round(av * 0.32) }}>
          {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" /> : person.initials}
        </span>
      </div>
      <div className={`flex flex-col ${compact ? "gap-0.5" : "gap-1"}`} style={{ padding: `${compact ? 44 : 74}px ${inset + 4}px ${compact ? 13 : 22}px` }}>
        <span className={`font-semibold leading-[1.2] ${compact ? "text-[17px]" : "text-[22px]"}`}>{person.name}</span>
        <span className={`leading-[1.3] text-[#3B3A36] ${compact ? "text-[13px]" : "text-[15px]"}`}>{person.headline}</span>
        <span className={`leading-[1.3] text-[#8C897F] ${compact ? "text-xs" : "text-[13.5px]"}`}>{person.meta}</span>
      </div>
    </div>
  );
}
