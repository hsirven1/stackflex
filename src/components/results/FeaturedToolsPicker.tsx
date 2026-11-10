"use client";

import { useId, useState } from "react";
import { focusRing } from "@/components/stackflex/Controls";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { featuredSummary, featuredTools } from "@/lib/selection/featured";
import { clearFeaturedIds, setFeaturedIds } from "@/lib/selection/store";
import { MAX_FEATURED_TOOLS, type StackState } from "@/lib/selection/types";
import { stackTools } from "@/lib/stackflex/tools";

/**
 * Compact control to choose which tools appear in Social / Banner image exports.
 * Full stack is unchanged; Main always stays featured.
 */
export function FeaturedToolsPicker({ stack }: { stack: StackState }) {
  const summary = featuredSummary(stack);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  if (!summary && stack.items.length <= MAX_FEATURED_TOOLS) return null;

  const all = stackTools(stack);
  const featured = featuredTools(stack);
  const featuredSet = new Set(featured.map((t) => t.id));
  const mainId = all[0]?.id;

  function toggle(id: string) {
    if (id === mainId) return;
    const next = featured.map((t) => t.id);
    if (featuredSet.has(id)) {
      setFeaturedIds(next.filter((x) => x !== id));
    } else if (next.length < MAX_FEATURED_TOOLS) {
      setFeaturedIds([...next, id]);
    }
  }

  return (
    <div className="mt-0.5">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <p className="text-[12.5px] font-medium text-sf-muted">
          {summary ?? `Featuring ${featured.length} tool${featured.length === 1 ? "" : "s"}`}
          <span className="text-sf-subtle"> · </span>
        </p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={`rounded-sm text-[12.5px] font-semibold text-sf-blue hover:underline ${focusRing}`}
        >
          {open ? "Done" : "Choose tools"}
        </button>
        {stack.featuredIds && stack.featuredIds.length > 0 && (
          <button
            type="button"
            onClick={() => clearFeaturedIds()}
            className={`text-[12px] font-medium text-sf-subtle hover:text-sf-muted ${focusRing} rounded-sm`}
          >
            Reset
          </button>
        )}
      </div>
      {open && (
        <div
          id={panelId}
          role="group"
          aria-label="Featured tools for image exports"
          className="mt-2 flex flex-wrap gap-1.5 rounded-[14px] border border-[#EFECE5] bg-[#FAF9F6] p-2.5"
        >
          {all.map((tool) => {
            const on = featuredSet.has(tool.id);
            const isMain = tool.id === mainId;
            const lockedOut = !on && featured.length >= MAX_FEATURED_TOOLS;
            return (
              <button
                key={tool.id}
                type="button"
                disabled={isMain || lockedOut}
                aria-pressed={on}
                onClick={() => toggle(tool.id)}
                title={isMain ? "Main tool is always featured" : tool.name}
                className={[
                  "inline-flex h-9 max-w-full items-center gap-1.5 rounded-full pl-1 pr-2.5 text-[12px] font-semibold transition-colors",
                  on
                    ? "bg-white text-sf-ink shadow-[0_0_0_1.5px_#3A2EFF]"
                    : "bg-white/70 text-sf-muted shadow-[0_0_0_1px_#E3E0D8]",
                  (isMain || lockedOut) && !on ? "opacity-40" : "",
                  focusRing,
                ].join(" ")}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#ECEAE4]">
                  <ToolLogo tool={tool} size="14px" monogramSize="11px" />
                </span>
                <span className="truncate">{tool.name}</span>
                {isMain && <span className="text-[10px] font-bold text-sf-blue">Main</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
