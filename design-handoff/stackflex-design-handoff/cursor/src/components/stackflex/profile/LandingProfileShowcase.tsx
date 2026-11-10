import type { Tool } from "@/lib/stackflex/tools";
import type { ProfileData } from "@/lib/stackflex/profile";
import { SocialCardArt } from "../ShareArt";
import { BrowserFrame } from "./BrowserFrame";
import { PersonalProfile } from "./PersonalProfile";

type Props = {
  data: ProfileData;     // pass MOCK_PROFILE_SHOWCASE from lib/stackflex/mock-profile on the landing page
  socialTools: Tool[];   // up to 6 tools for the square social post (square StackCards, unchanged)
};

/**
 * Landing hero (1i, desktop lg+): browser mock with the horizontal-card profile, plus the square social post
 * overlapping its lower-right corner. The positions match the 1440×900 composition.
 * Place it inside the existing landing hero container (position: relative, 1440 max width).
 * Below lg, render the two pieces stacked (see README).
 */
export function LandingProfileShowcase({ data, socialTools }: Props) {
  return (
    <>
      <div className="absolute left-[770px] top-[120px] w-[580px] shadow-[0_1px_2px_rgba(11,11,12,.06),0_40px_80px_-40px_rgba(11,11,12,.3)] rounded-2xl">
        <BrowserFrame barHeight={32} className="!rounded-2xl !shadow-none">
          <div className="px-8 pb-7 pt-[30px]">
            <PersonalProfile data={data} variant="showcase" showActivities={false} showFooter={false} />
          </div>
        </BrowserFrame>
      </div>
      <div className="absolute left-[1150px] top-[612px] w-[248px] overflow-hidden rounded-[10px] shadow-[0_0_0_1px_#ECEAE4,0_40px_80px_-36px_rgba(11,11,12,.35)]">
        <SocialCardArt tools={socialTools} />
      </div>
    </>
  );
}
