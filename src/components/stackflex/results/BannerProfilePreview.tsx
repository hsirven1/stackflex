/* eslint-disable @next/next/no-img-element */
import type { AIProfile, CardTheme } from "./lib/types";
import { LinkedInBanner } from "./LinkedInBanner";
import { LinkedInIcon } from "@/components/stackflex/Controls";

const SAMPLE_NAME = "Alex Rivera";
const SAMPLE_HEADLINE = "Product lead · building with AI";

/**
 * Realistic LinkedIn profile chrome wrapping the generated banner as cover.
 * Preview only — never included in the 1584×396 PNG export.
 */
export function BannerProfilePreview({
  profile,
  theme,
  avatarUrl,
  displayName,
  headline,
}: {
  profile: AIProfile;
  theme: CardTheme;
  avatarUrl?: string;
  displayName?: string;
  headline?: string;
}) {
  const name = displayName?.trim() || SAMPLE_NAME;
  const title = headline?.trim() || profile.role?.trim() || SAMPLE_HEADLINE;
  const initials = initialsFrom(name);

  return (
    <div
      className="w-full overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] shadow-[0_0_0_1px_#E6E3DC,0_30px_60px_-40px_rgba(30,20,90,.35)]"
      style={{ containerType: "inline-size" }}
    >
      <div className="relative">
        <LinkedInBanner profile={profile} theme={theme} />
        <span
          aria-hidden
          className="absolute overflow-hidden rounded-full border-[3px] border-white bg-[radial-gradient(circle_at_35%_28%,#FFFFFF_0%,#F3F0FF_42%,#E8E4F8_70%,#D7D2EC_100%)] shadow-[0_0_0_1px_rgba(11,11,12,.06)]"
          style={{ left: "3.2%", bottom: "-9cqw", width: "17.5cqw", height: "17.5cqw" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : initials ? (
            <span className="flex h-full w-full items-center justify-center font-display text-[min(28px,5.5cqw)] font-semibold tracking-[-0.04em] text-[#3A2EFF]">
              {initials}
            </span>
          ) : (
            <GenericSilhouette />
          )}
        </span>
      </div>

      <div className="relative flex items-start justify-between gap-3 px-[18px] pb-4" style={{ paddingTop: "calc(9.5cqw + 12px)" }}>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">{name}</div>
          <div className="mt-0.5 truncate text-[12.5px] leading-snug text-[#666666]">{title}</div>
          <div className="mt-1.5 truncate text-[12px] text-[#8C897F]">San Francisco Bay Area</div>
        </div>
        <span aria-hidden className="flex-none pt-0.5 text-[#0A66C2]">
          <LinkedInIcon size={18} />
        </span>
      </div>
    </div>
  );
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function GenericSilhouette() {
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" aria-hidden>
      <circle cx="48" cy="36" r="16" fill="#3A2EFF" opacity="0.18" />
      <path d="M18 86c4.5-18 16-28 30-28s25.5 10 30 28" fill="#3A2EFF" opacity="0.16" />
      <circle cx="48" cy="36" r="12.5" fill="#FFFFFF" />
      <path d="M27 84c3.8-14.5 12.8-22 21-22s17.2 7.5 21 22" fill="#FFFFFF" />
    </svg>
  );
}
