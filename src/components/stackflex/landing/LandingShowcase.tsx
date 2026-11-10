"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AIProfileCard, LinkedInBanner, type AIProfile } from "@/components/stackflex/results";
import { ProfileFrame } from "./ProfileFrame";

export type LandingSamples = {
  /** Shown on the light card AND the banner — must be the same profile. */
  main: AIProfile;
  /** Other working style, dark, peeks out bottom-left. */
  altLeft: AIProfile;
  /** Other working style, light, peeks out right. */
  altRight: AIProfile;
  person: { name: string; headline: string; meta: string; initials: string; avatarUrl?: string };
};

/**
 * Desktop: one 784×660 composition, scaled as a unit so the layering never drifts.
 * Back → front: alt cards (under the frame), LinkedIn profile frame (dark banner), light main card.
 * Mobile (<768): simplified 358-wide stack with one alt card.
 */
export function LandingShowcase({ samples }: { samples: LandingSamples }) {
  const { main, altLeft, altRight, person } = samples;
  return (
    <div aria-hidden className="sf-landing-anim relative w-full select-none">
      {/* ≥768: authored at 784×660, scaled to the column width */}
      <div className="hidden md:block" style={{ containerType: "inline-size" }}>
        <div className="relative mx-auto aspect-[784/660] w-full max-w-[784px]">
          <ScaledStage width={784} height={660}>
            <Rot dataSfAlt left={150} top={300} width={290} deg={-8}>
              <AIProfileCard profile={altLeft} theme="dark" width={290} elevated={false} animate={false} />
            </Rot>
            <Rot dataSfAlt left={500} top={290} width={290} deg={8}>
              <AIProfileCard profile={altRight} theme="light" width={290} elevated={false} animate={false} />
            </Rot>
            <div data-sf-frame="" className="absolute left-0 top-0 w-[660px]">
              <ProfileFrame width={660} person={person}>
                <LinkedInBanner profile={main} theme="dark" animate={false} />
              </ProfileFrame>
            </div>
            <div className="absolute left-[352px] top-[236px] w-[330px] [filter:drop-shadow(0_30px_40px_rgba(30,20,90,.18))]">
              <AIProfileCard profile={main} theme="light" width={330} animate={false} />
            </div>
          </ScaledStage>
        </div>
      </div>

      {/* <768 */}
      <div className="relative mx-auto h-[440px] w-[358px] max-w-full md:hidden">
        <Rot dataSfAlt left={28} top={206} width={160} deg={-8}>
          <AIProfileCard profile={altLeft} theme="dark" width={160} elevated={false} animate={false} />
        </Rot>
        <div data-sf-frame="" className="absolute left-0 top-0 w-[358px] max-w-full">
          <ProfileFrame width={358} person={person} compact>
            <LinkedInBanner profile={main} theme="dark" animate={false} />
          </ProfileFrame>
        </div>
        <div className="absolute left-[150px] top-[198px] w-[190px] [filter:drop-shadow(0_18px_24px_rgba(30,20,90,.18))]">
          <AIProfileCard profile={main} theme="light" width={190} animate={false} />
        </div>
      </div>
    </div>
  );
}

/** Scales a fixed authored stage to the parent container width (ResizeObserver fallback for older engines). */
function ScaledStage({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={host} className="absolute inset-0 origin-top-left overflow-visible">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

function Rot({
  left,
  top,
  width,
  deg,
  children,
  dataSfAlt,
}: {
  left: number;
  top: number;
  width: number;
  deg: number;
  children: ReactNode;
  dataSfAlt?: boolean;
}) {
  return (
    <div
      data-sf-alt={dataSfAlt ? "" : undefined}
      className="absolute"
      style={{ left, top, width, transform: `rotate(${deg}deg)`, transformOrigin: "50% 100%" }}
    >
      {children}
    </div>
  );
}
