"use client";

import type { RefObject } from "react";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { focusRing } from "@/components/stackflex/Controls";
import type { Tool } from "@/lib/stackflex/tools";

export type DisplayActivity = {
  id?: string;
  label: string;
  toolIds: string[];
};

/**
 * Compact “How I use AI” list for the personal page / Results preview / landing demo.
 * Public pages pass activities only — empty → hidden.
 * Editable Results preview can show an empty-state CTA inside the page canvas.
 */
export function ActivitiesSection({
  activities,
  tools,
  density = "full",
  previewLimit,
  editable = false,
  onAdd,
  onEdit,
  addButtonRef,
  className = "",
}: {
  activities: DisplayActivity[];
  tools: Tool[];
  density?: "full" | "compact" | "mini";
  /** When set, truncate the list and show a “+N more” hint. */
  previewLimit?: number;
  /** Results preview only — never on public snapshots. */
  editable?: boolean;
  onAdd?: () => void;
  onEdit?: () => void;
  addButtonRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
}) {
  const byId = new Map(tools.map((t) => [t.id, t]));
  const compact = density === "compact";
  const mini = density === "mini";
  const headingClass = mini
    ? "text-[9px] font-semibold tracking-[0.04em] text-sf-muted uppercase"
    : compact
      ? "text-[11px] font-semibold tracking-[0.04em] text-sf-muted uppercase"
      : "text-[12px] font-semibold tracking-[0.05em] text-sf-muted uppercase sm:text-[12.5px]";

  if (!activities.length) {
    if (!editable || !onAdd) return null;
    return (
      <section aria-labelledby="how-i-use-ai" className={`text-left ${className}`}>
        <h3 id="how-i-use-ai" className={headingClass}>
          How I use AI
        </h3>
        <p
          className={
            compact
              ? "mt-1.5 text-[12.5px] leading-snug text-sf-muted"
              : "mt-2 text-[13.5px] leading-snug text-sf-muted"
          }
        >
          Show what you do with your AI tools.
        </p>
        <button
          ref={addButtonRef}
          type="button"
          onClick={onAdd}
          className={`mt-2.5 inline-flex h-8 items-center rounded-full bg-sf-ink px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-sf-ink/90 ${focusRing}`}
        >
          + Add AI activities
        </button>
      </section>
    );
  }

  const limit = previewLimit && previewLimit > 0 ? previewLimit : activities.length;
  const visible = activities.slice(0, limit);
  const remaining = activities.length - visible.length;

  return (
    <section aria-labelledby="how-i-use-ai" className={`text-left ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="how-i-use-ai" className={headingClass}>
          How I use AI
        </h3>
        {editable && onEdit && (
          <button
            ref={addButtonRef}
            type="button"
            onClick={onEdit}
            className={`shrink-0 text-[12px] font-semibold text-sf-muted transition-colors hover:text-sf-ink ${focusRing} rounded-md`}
          >
            Edit activities
          </button>
        )}
      </div>
      <ul
        className={
          mini
            ? "mt-1.5 space-y-1.5"
            : compact
              ? "mt-2.5 space-y-2.5"
              : "mt-3.5 space-y-3.5 sm:mt-4 sm:space-y-4"
        }
      >
        {visible.map((activity, i) => {
          const associated = activity.toolIds
            .map((id) => byId.get(id))
            .filter((t): t is Tool => Boolean(t));
          return (
            <li key={activity.id ?? `${activity.label}-${i}`} className="min-w-0">
              <p
                className={
                  mini
                    ? "text-[11px] font-medium leading-snug tracking-[-0.015em] text-sf-ink"
                    : compact
                      ? "text-[13.5px] font-medium leading-snug tracking-[-0.015em] text-sf-ink"
                      : "text-[15px] font-medium leading-snug tracking-[-0.02em] text-sf-ink sm:text-[16px]"
                }
              >
                {activity.label}
              </p>
              {associated.length > 0 && (
                <div
                  className={
                    mini
                      ? "mt-1 flex flex-wrap gap-1"
                      : compact
                        ? "mt-1.5 flex flex-wrap gap-1.5"
                        : "mt-2 flex flex-wrap gap-1.5"
                  }
                >
                  {associated.map((tool) => (
                    <span
                      key={tool.id}
                      className={`inline-flex items-center gap-1 rounded-full bg-[#F3F1EB] font-medium text-sf-muted ${
                        mini
                          ? "h-5 px-1.5 text-[8.5px]"
                          : compact
                            ? "h-6 px-2 text-[11px]"
                            : "h-7 px-2.5 text-[12px]"
                      }`}
                    >
                      <ToolLogo
                        tool={tool}
                        size={mini ? "10px" : compact ? "11px" : "13px"}
                        className="shrink-0"
                      />
                      {tool.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {remaining > 0 && (
        <p className={compact || mini ? "mt-2 text-[11px] text-sf-subtle" : "mt-3 text-[12.5px] text-sf-subtle"}>
          +{remaining} more on the full page
        </p>
      )}
    </section>
  );
}
