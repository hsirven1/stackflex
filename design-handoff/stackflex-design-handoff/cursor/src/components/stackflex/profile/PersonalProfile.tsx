import type { ReactNode } from "react";
import { resolveMainId, type ProfileData, type ProfileTool } from "@/lib/stackflex/profile";
import { Mark } from "../Brand";
import { HowIUseAI } from "./HowIUseAI";
import { ProfileIdentity } from "./ProfileIdentity";
import { StackSections } from "./StackSections";

export type ProfileVariant = "page" | "preview" | "showcase";

type Props = {
  data: ProfileData;
  variant?: ProfileVariant;
  showActivities?: boolean;          // default: true, except showcase
  showFooter?: boolean;              // "Made with StackFlex", default true on page
  onToolClick?: (t: ProfileTool) => void;
  emptyTools?: ReactNode;            // editable contexts only
  emptyActivities?: ReactNode;       // editable contexts only
};

/**
 * The personal AI profile: Identity → My AI Stack (AI Apps, AI-Powered Software) → How I use AI.
 * One component for the public page, the Results preview and the landing showcase. Only sizes change.
 */
export function PersonalProfile({ data, variant = "page", showActivities, showFooter, onToolClick, emptyTools, emptyActivities }: Props) {
  const acts = showActivities ?? variant !== "showcase";
  const footer = showFooter ?? variant === "page";
  const gap = variant === "page" ? "gap-9 sm:gap-[52px]" : variant === "preview" ? "gap-[30px]" : "gap-[26px]";
  return (
    <div className={`relative flex flex-col ${gap} ${variant === "page" ? "max-w-[894px]" : ""}`}>
      <ProfileIdentity identity={data.identity} variant={variant} />
      <StackSections tools={data.tools} mainToolId={resolveMainId(data)} variant={variant} onToolClick={onToolClick} emptyState={emptyTools} />
      {acts && <HowIUseAI activities={data.activities} tools={data.tools} variant={variant} emptyState={emptyActivities} />}
      {footer && (
        <div className="flex items-center gap-[7px]">
          <Mark size={13} />
          <span className="text-xs text-sf-faint">Made with StackFlex</span>
        </div>
      )}
    </div>
  );
}
