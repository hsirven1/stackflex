"use client";

import { ScaledStage } from "@/components/renderer/ScaledStage";
import { ART_SIZE, BannerArt, SocialCardArt } from "@/components/stackflex/ShareArt";
import { LinkedInProfileMock, SocialPostMock } from "@/components/stackflex/SocialMocks";
import type { ProfileData } from "@/lib/stackflex/profile";
import type { Tool } from "@/lib/stackflex/tools";
import { BrowserFrame } from "./BrowserFrame";
import { PersonalProfile } from "./PersonalProfile";

type Props = {
  data: ProfileData;
  socialTools: Tool[];
  className?: string;
};

/**
 * Landing hero outputs: personal AI page (primary), LinkedIn profile+banner (secondary),
 * square social post (tertiary). Uses real export art and the approved profile components.
 */
export function LandingProfileShowcase({ data, socialTools, className = "" }: Props) {
  const { width: squareW, height: squareH } = ART_SIZE.square;
  const { width: bannerW, height: bannerH } = ART_SIZE.banner;
  const name = data.identity.name;
  const title = data.identity.title ?? "";
  const artTools = socialTools.slice(0, 6);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Mobile: readable personal page, then secondary previews stacked */}
      <div className="flex flex-col items-stretch gap-4 lg:hidden">
        <BrowserFrame barHeight={32} className="rounded-2xl shadow-[0_20px_44px_-28px_rgba(11,11,12,.5)]">
          <div className="px-5 pb-5 pt-5 sm:px-7">
            <PersonalProfile data={data} variant="showcase" showFooter={false} />
          </div>
        </BrowserFrame>
        <div className="w-full max-w-[420px]">
          <LinkedInProfileMock compact name={name} headline={title}>
            <ScaledStage width={bannerW} height={bannerH}>
              <BannerArt
                tools={artTools}
                theme="light"
                ratio={`${bannerW} / ${bannerH}`}
                className="font-sans text-sf-ink"
              />
            </ScaledStage>
          </LinkedInProfileMock>
        </div>
        <div className="mx-auto w-full max-w-[220px]">
          <SocialPostMock compact name={name} headline={title} caption="My AI stack →">
            <ScaledStage width={squareW} height={squareH}>
              <SocialCardArt
                tools={artTools}
                theme="light"
                balanced
                className="font-sans text-sf-ink"
              />
            </ScaledStage>
          </SocialPostMock>
        </div>
      </div>

      {/*
        Desktop hierarchy:
        1. Personal page — largest, left-anchored
        2. LinkedIn profile header — secondary, lower-left, mild overlap
        3. Square social post — tertiary, upper-right
      */}
      <div className="relative mx-auto hidden min-h-[min(640px,72svh)] w-full max-w-[640px] lg:block xl:max-w-[680px]">
        <div className="absolute left-0 top-0 z-[1] w-[74%] max-w-[490px] shadow-[0_28px_56px_-32px_rgba(11,11,12,.5)]">
          <BrowserFrame barHeight={30} className="rounded-2xl !shadow-none">
            <div className="px-6 pb-5 pt-5 xl:px-7">
              <PersonalProfile data={data} variant="showcase" showFooter={false} />
            </div>
          </BrowserFrame>
        </div>

        <div className="absolute right-0 top-[4%] z-[3] w-[36%] max-w-[220px] overflow-hidden rounded-[10px] shadow-[0_0_0_1px_#ECEAE4,0_22px_48px_-26px_rgba(11,11,12,.42)]">
          <SocialPostMock compact name={name} headline={title} caption="My AI stack →">
            <ScaledStage width={squareW} height={squareH}>
              <SocialCardArt
                tools={artTools}
                theme="light"
                balanced
                className="font-sans text-sf-ink"
              />
            </ScaledStage>
          </SocialPostMock>
        </div>

        <div className="absolute bottom-[2%] left-0 z-[2] w-[70%] max-w-[450px] shadow-[0_0_0_1px_#ECEAE4,0_24px_48px_-30px_rgba(11,11,12,.4)]">
          <LinkedInProfileMock compact name={name} headline={title}>
            <ScaledStage width={bannerW} height={bannerH}>
              <BannerArt
                tools={artTools}
                theme="light"
                ratio={`${bannerW} / ${bannerH}`}
                className="font-sans text-sf-ink"
              />
            </ScaledStage>
          </LinkedInProfileMock>
        </div>
      </div>
    </div>
  );
}
