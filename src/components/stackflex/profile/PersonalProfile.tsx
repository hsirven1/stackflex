import type { ReactNode } from "react";
import { Mark } from "@/components/stackflex/Brand";
import { resolveMainId, type ProfileData, type ProfileTool } from "@/lib/stackflex/profile";
import "@/styles/stackflex-profile.css";
import { HowIUseAI } from "./HowIUseAI";
import { ProfileIdentity } from "./ProfileIdentity";
import { StackSections } from "./StackSections";

export type ProfileVariant = "page" | "preview" | "showcase";

type Props = {
  data: ProfileData;
  variant?: ProfileVariant;
  showActivities?: boolean;
  showFooter?: boolean;
  onToolClick?: (t: ProfileTool) => void;
  emptyTools?: ReactNode;
  emptyActivities?: ReactNode;
  activitiesHeaderAction?: ReactNode;
  /** Results editing — replaces the read-only How I use AI section. */
  activitiesSlot?: ReactNode;
};

/**
 * Personal AI profile: Identity → My AI Stack → How I use AI.
 * Shared by public page, Results preview, and landing showcase.
 */
export function PersonalProfile({
  data,
  variant = "page",
  showActivities,
  showFooter,
  onToolClick,
  emptyTools,
  emptyActivities,
  activitiesHeaderAction,
  activitiesSlot,
}: Props) {
  const acts = showActivities ?? true;
  const footer = showFooter ?? variant === "page";
  const gap =
    variant === "page" ? "gap-9 sm:gap-[52px]" : variant === "preview" ? "gap-[30px]" : "gap-[26px]";

  return (
    <div className={`relative flex flex-col ${gap} ${variant === "page" ? "max-w-[894px]" : ""}`}>
      <ProfileIdentity identity={data.identity} variant={variant} />
      <StackSections
        tools={data.tools}
        mainToolId={resolveMainId(data)}
        variant={variant}
        onToolClick={onToolClick}
        emptyState={emptyTools}
      />
      {acts &&
        (activitiesSlot ?? (
          <HowIUseAI
            activities={data.activities}
            tools={data.tools}
            variant={variant}
            emptyState={emptyActivities}
            headerAction={activitiesHeaderAction}
          />
        ))}
      {footer && (
        <div className="flex items-center gap-[7px]">
          <Mark size={13} />
          <span className="text-xs text-sf-faint">Made with StackFlex</span>
        </div>
      )}
    </div>
  );
}
