import type { ProfileData, ProfileTool } from "@/lib/stackflex/profile";
import { BrowserFrame } from "./BrowserFrame";
import { PersonalProfile } from "./PersonalProfile";

type Props = {
  data: ProfileData;                 // real app state, mapped with your adapter
  onEditProfile: () => void;         // opens the EXISTING profile editor
  onAddTools?: () => void;           // existing "Edit stack"/add flow (empty state)
  onAddActivities?: () => void;      // existing activity picker (empty state)
  onToolClick?: (t: ProfileTool) => void;
};

/**
 * Results page, left column "Your page" canvas (Results v3 layout). It replaces the square grid with the
 * horizontal cards so it matches the public page exactly.
 * The title row above it (Your page · Public · LinkField · Preview) lives in LinkField.tsx.
 */
export function ResultsPagePreview({ data, onEditProfile, onAddTools, onAddActivities, onToolClick }: Props) {
  return (
    <BrowserFrame>
      <div className="relative px-11 pb-8 pt-9">
        <button
          type="button"
          onClick={onEditProfile}
          aria-label="Edit profile"
          className="absolute right-3.5 top-3 z-[1] flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-semibold text-sf-ver shadow-[0_0_0_1px_#E6E3DC] hover:text-sf-ink hover:shadow-[0_0_0_1px_#CFCBC1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2"
        >
          <span aria-hidden>✎</span> Edit profile
        </button>
        <PersonalProfile
          data={data}
          variant="preview"
          onToolClick={onToolClick}
          emptyTools={
            <button type="button" onClick={onAddTools} className="flex h-[66px] w-full items-center justify-center rounded-2xl border-[1.5px] border-dashed border-[#DAD7CF] text-sm font-semibold text-sf-muted hover:text-sf-ink">
              + Add your first tool
            </button>
          }
          emptyActivities={
            <button type="button" onClick={onAddActivities} className="self-start text-sm font-semibold text-sf-blue">
              + Add how you use AI
            </button>
          }
        />
      </div>
    </BrowserFrame>
  );
}
