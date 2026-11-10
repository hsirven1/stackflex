"use client";

import type { ReactNode, RefObject } from "react";
import { Pencil } from "lucide-react";
import type { ProfileData, ProfileTool } from "@/lib/stackflex/profile";
import { BrowserFrame } from "./BrowserFrame";
import { PersonalProfile } from "./PersonalProfile";

type Props = {
  data: ProfileData;
  onEditProfile: () => void;
  editProfileRef?: RefObject<HTMLButtonElement | null>;
  /** Results-only inline How I use AI editor. */
  activitiesSlot?: ReactNode;
  onToolClick?: (t: ProfileTool) => void;
};

/**
 * Results "Your page" canvas — horizontal cards matching the public profile.
 * Activity editing is inline inside the preview (never on public pages).
 */
export function ResultsPagePreview({
  data,
  onEditProfile,
  editProfileRef,
  activitiesSlot,
  onToolClick,
}: Props) {
  return (
    <BrowserFrame>
      <div className="relative px-5 pb-8 pt-9 sm:px-8 lg:px-11">
        <button
          ref={editProfileRef}
          type="button"
          onClick={onEditProfile}
          aria-label="Edit profile"
          className="absolute top-3 right-3.5 z-[1] inline-flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-semibold text-[#2A2925] shadow-[0_0_0_1px_#E6E3DC] outline-none transition-[box-shadow,color] hover:text-[#0B0B0C] hover:shadow-[0_0_0_1px_#CFCBC1] focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2"
        >
          <Pencil size={13} strokeWidth={2.25} aria-hidden="true" />
          Edit profile
        </button>
        <PersonalProfile
          data={data}
          variant="preview"
          onToolClick={onToolClick}
          emptyTools={
            <p className="text-[14px] text-sf-muted">Add tools to preview your page.</p>
          }
          activitiesSlot={activitiesSlot}
        />
      </div>
    </BrowserFrame>
  );
}
