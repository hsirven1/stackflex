/* eslint-disable @next/next/no-img-element */
import type { AIProfile, CardTheme } from "../lib/types";
import { LinkedInBanner } from "./LinkedInBanner";

/**
 * Lightweight, approximate profile context for the banner ("On profile" view). Preview only; never exported.
 * No LinkedIn logo or brand colors. Photo ≈ 16% of banner width, overlapping the bottom-left edge.
 * Name/headline are neutral placeholder bars (we don't collect them); pass avatarUrl if you have one.
 */
export function BannerProfilePreview({ profile, theme, avatarUrl }: { profile: AIProfile; theme: CardTheme; avatarUrl?: string }) {
  return (
    <div className="w-full overflow-hidden rounded-[14px] bg-white shadow-[0_0_0_1px_#E6E3DC,0_30px_60px_-40px_rgba(30,20,90,.35)]" style={{ containerType: "inline-size" }}>
      <div className="relative">
        <LinkedInBanner profile={profile} theme={theme} />
        <span
          aria-hidden
          className="absolute overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(135deg,#E3DEFA,#C9D6F2)]"
          style={{ left: "3%", bottom: "-8cqw", width: "16.8cqw", height: "16.8cqw" }}
        >
          {avatarUrl && <img src={avatarUrl} alt="" className="h-full w-full object-cover" />}
        </span>
      </div>
      <div aria-hidden className="flex flex-col gap-2 px-[22px] pb-4" style={{ paddingTop: "calc(8cqw + 14px)" }}>
        <span className="h-3 w-[180px] rounded-md bg-[#E6E3DC]" />
        <span className="h-[9px] w-[260px] max-w-full rounded-[5px] bg-[#EFEDE8]" />
      </div>
    </div>
  );
}
