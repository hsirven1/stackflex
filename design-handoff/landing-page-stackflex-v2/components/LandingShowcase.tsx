import { AIProfileCard, LinkedInBanner, type AIProfile } from "@/components/stackflex/results"; // from stackflex-results-final
import { ProfileFrame } from "./ProfileFrame";

export type LandingSamples = {
  main: AIProfile;      // shown on the light card AND the banner: must be the same profile
  altLeft: AIProfile;   // other working style, dark, peeks out bottom-left
  altRight: AIProfile;  // other working style, light, peeks out right
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
    <div aria-hidden className="relative w-full select-none">
      {/* ≥768: authored at 784×660, scaled to the column width */}
      <div className="hidden md:block" style={{ containerType: "inline-size" }}>
        <div className="relative mx-auto aspect-[784/660] w-full max-w-[784px]">
          <div className="absolute left-0 top-0 h-[660px] w-[784px] origin-top-left" style={{ transform: "scale(min(1, calc(100cqw / 784px)))" }}>
            <Rot left={150} top={300} width={290} deg={-8}><AIProfileCard profile={altLeft} theme="dark" width={290} elevated={false} /></Rot>
            <Rot left={500} top={290} width={290} deg={8}><AIProfileCard profile={altRight} theme="light" width={290} elevated={false} /></Rot>
            <div className="absolute left-0 top-0 w-[660px]">
              <ProfileFrame width={660} person={person}><LinkedInBanner profile={main} theme="dark" /></ProfileFrame>
            </div>
            <div className="absolute left-[352px] top-[236px] w-[330px] [filter:drop-shadow(0_30px_40px_rgba(30,20,90,.18))]">
              <AIProfileCard profile={main} theme="light" width={330} />
            </div>
          </div>
        </div>
      </div>

      {/* <768 */}
      <div className="relative mx-auto h-[440px] w-[358px] max-w-full md:hidden">
        <Rot left={28} top={206} width={160} deg={-8}><AIProfileCard profile={altLeft} theme="dark" width={160} elevated={false} /></Rot>
        <div className="absolute left-0 top-0 w-[358px] max-w-full">
          <ProfileFrame width={358} person={person} compact><LinkedInBanner profile={main} theme="dark" /></ProfileFrame>
        </div>
        <div className="absolute left-[150px] top-[198px] w-[190px] [filter:drop-shadow(0_18px_24px_rgba(30,20,90,.18))]">
          <AIProfileCard profile={main} theme="light" width={190} />
        </div>
      </div>
    </div>
  );
}

function Rot({ left, top, width, deg, children }: { left: number; top: number; width: number; deg: number; children: React.ReactNode }) {
  return (
    <div className="absolute" style={{ left, top, width, transform: `rotate(${deg}deg)`, transformOrigin: "50% 100%" }}>
      {children}
    </div>
  );
}
