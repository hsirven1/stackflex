"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { focusRing } from "@/components/stackflex/Controls";
import type { StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { BadgeExportNodes, BadgeRows } from "./BadgesSection";
import type { ArtExport } from "./FormatPanels";
import { MODULE } from "./ResultsUI";
import { TextRows } from "./TextSection";

/** Secondary formats (badges + text). Expanded by default so the options are visible; can collapse. */
export function MoreWaysSection({
  stack,
  tools,
  strip,
  github,
}: {
  stack: StackState;
  tools: Tool[];
  strip: ArtExport;
  github: ArtExport;
}) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  return (
    <section aria-labelledby="format-more" className={MODULE}>
      <h3 id="format-more">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center justify-between gap-4 rounded-[22px] px-5 py-5 text-left sm:px-6 ${focusRing}`}
        >
          <span className="flex flex-col gap-1">
            <span className="font-display text-[22px] font-medium leading-[1.1] tracking-[-0.035em]">More ways to share</span>
            <span className="text-sm font-normal leading-snug text-sf-muted">
              Badges for your website and GitHub, plus copy-ready text for your profiles and resume.
            </span>
          </span>
          <span className="flex size-10 flex-none items-center justify-center rounded-full bg-sf-chip">
            <ChevronDown aria-hidden="true" className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </h3>
      {open && (
        <div id={panelId} className="flex flex-col gap-8 border-t border-[#EEECE6] px-5 pb-6 pt-6 sm:px-6">
          <SubHeading>Badges</SubHeading>
          <BadgeRows stack={stack} tools={tools} strip={strip} github={github} />
          <SubHeading>Text</SubHeading>
          <div className="-mt-4">
            <TextRows stack={stack} />
          </div>
        </div>
      )}
      <BadgeExportNodes tools={tools} strip={strip} github={github} />
    </section>
  );
}

const SubHeading = ({ children }: { children: string }) => (
  <h4 className="-mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-sf-subtle">{children}</h4>
);
