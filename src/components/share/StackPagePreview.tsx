import {
  ActivitiesSection,
  type DisplayActivity,
} from "@/components/share/ActivitiesSection";
import { StackProfileCards } from "@/components/share/StackProfileCards";
import { StackProfileIdentity } from "@/components/share/StackProfileIdentity";
import type { Tool } from "@/lib/stackflex/tools";

/**
 * Compact personal-page chrome shared by Results and the landing showcase.
 * Hierarchy matches the real `/s/[snapshot]` page:
 * identity → My AI Stack → How I use AI.
 */
export function StackPagePreview({
  tools,
  urlHint,
  name,
  title,
  avatarSrc,
  activities = [],
  density = "compact",
  showChrome = true,
  className = "",
}: {
  tools: Tool[];
  urlHint?: string;
  name?: string;
  title?: string;
  avatarSrc?: string | null;
  activities?: DisplayActivity[];
  density?: "compact" | "mini";
  showChrome?: boolean;
  className?: string;
}) {
  const mini = density === "mini";

  return (
    <div
      className={`overflow-hidden rounded-[16px] border border-[#E3E0D8] bg-white shadow-[0_16px_40px_-28px_rgba(11,11,12,.45)] ${className}`}
    >
      {showChrome && (
        <div className={`flex items-center gap-1.5 border-b border-[#ECEAE4] bg-[#F7F5F0] ${mini ? "px-2 py-1" : "px-3 py-2"}`}>
          <span className={`rounded-full bg-[#E4DFD6] ${mini ? "size-1.5" : "size-2"}`} />
          <span className={`rounded-full bg-[#E4DFD6] ${mini ? "size-1.5" : "size-2"}`} />
          <span className={`rounded-full bg-[#E4DFD6] ${mini ? "size-1.5" : "size-2"}`} />
          <div
            className={`ml-1.5 min-w-0 flex-1 truncate rounded-md bg-white text-sf-subtle shadow-[0_0_0_1px_#ECEAE4] ${
              mini ? "px-1.5 py-0.5 text-[7.5px]" : "px-2 py-1 text-[10px]"
            }`}
          >
            {urlHint || "stackflex.app/s/…"}
          </div>
        </div>
      )}
      <div
        className={`bg-[linear-gradient(180deg,#FFFFFF_0%,#FAF9F6_100%)] ${
          mini ? "px-3.5 pb-3.5 pt-3 sm:px-4" : "px-5 pb-4 pt-4 sm:px-7 sm:pb-5 sm:pt-5"
        }`}
      >
        <StackProfileIdentity name={name} title={title} avatarSrc={avatarSrc} size={mini ? "mini" : "compact"} />
        {tools.length > 0 ? (
          <>
            <StackProfileCards
              tools={tools.slice(0, 6)}
              density={mini ? "mini" : "compact"}
              groupByExperience
              className={mini ? "mt-2.5" : "mt-3.5"}
            />
            {tools.length > 6 && (
              <p className={`mt-2 text-left font-medium text-sf-muted ${mini ? "text-[9px]" : "text-[11px]"}`}>
                +{tools.length - 6} more on your page
              </p>
            )}
            <ActivitiesSection
              activities={activities}
              tools={tools}
              density={mini ? "mini" : "compact"}
              previewLimit={mini ? 2 : 3}
              className={mini ? "mt-2.5" : "mt-3.5"}
            />
          </>
        ) : (
          <p className={`mt-4 text-left text-sf-muted ${mini ? "text-[10px]" : "text-[12px]"}`}>
            Add tools to preview your page.
          </p>
        )}
      </div>
    </div>
  );
}
