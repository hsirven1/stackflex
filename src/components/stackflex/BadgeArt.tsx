import type { Ref } from "react";
import type { Tool } from "@/lib/stackflex/tools";
import { Mark } from "./Brand";
import { MAX_ON_BOARD } from "./StackBoard";
import { StackChip } from "./StackCard";

// Badge artwork: StackChip rows (logo circle and name), the same chips the Results page shows.
// Exported as transparent PNGs at 2× by the Results page.

/** Website badge: the stack's chips, then "Built with N AI tools". Exported as one content-sized row. */
export function WebsiteBadgeArt({ tools, wrap = false, ref }: { tools: Tool[]; wrap?: boolean; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={`items-center gap-2.5 px-px font-sans text-sf-ink ${wrap ? "flex flex-wrap" : "inline-flex"}`}>
      {tools.slice(0, MAX_ON_BOARD).map((t) => (
        <StackChip key={t.id} tool={t} />
      ))}
      <span className="flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-sf-ink pl-[11px] pr-4 text-[13.5px] font-semibold text-white">
        <Mark size={16} outline="#0B0B0C" /> Built with {tools.length} AI {tools.length === 1 ? "tool" : "tools"}
      </span>
    </div>
  );
}

/** GitHub README image: the heading with every chip. Exported 800px wide (EXPORT_SPEC); the preview fills its column. */
export function ReadmeArt({
  tools,
  heading,
  className = "w-[800px]",
  ref,
}: {
  tools: Tool[];
  heading: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={`p-0.5 font-sans text-sf-ink ${className}`}>
      <div className="flex flex-col gap-2.5 rounded-[10px] bg-white p-4 shadow-[0_0_0_1px_#E6E3DC]">
        <span className="border-b border-[#EEECE6] pb-[7px] text-sm font-bold">{heading}</span>
        <div className="flex flex-wrap gap-1.5">
          {tools.map((t) => (
            <StackChip key={t.id} tool={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
