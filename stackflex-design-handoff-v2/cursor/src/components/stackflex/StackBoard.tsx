import type { Tool } from "@/lib/stackflex/tools";
import { StackCard } from "./StackCard";

// Equal-size cards for 1 to 6 tools. The first tool is Main (foil), never larger.
//  grid: 1 tool = one card (64% width) · 2–4 = 2 columns · 5–6 = 3 columns · incomplete rows centered.
//        Results panel, social card.
//  row:  all cards in one row, equal width. LinkedIn banner, X header.
//  tray: questionnaire live stack. Up to 6 slots at 88px + "+" tile.

export const MAX_ON_BOARD = 6;
export const overflowCount = (tools: Tool[]) => Math.max(0, tools.length - MAX_ON_BOARD);
export const columnsFor = (n: number) => (n <= 1 ? 1 : n <= 4 ? 2 : 3);

type Props = {
  tools: Tool[];
  layout?: "grid" | "row" | "tray";
  gap?: string; // CSS length, e.g. "6px", or "2cqw" in exports
  highlightLast?: boolean;
  onAdd?: () => void;
  className?: string;
};

export function StackBoard({ tools, layout = "grid", gap, highlightLast, onAdd, className = "" }: Props) {
  const shown = tools.slice(0, MAX_ON_BOARD);
  const n = shown.length;
  const g = gap ?? (layout === "row" ? "8px" : "6px");

  if (layout === "row") {
    return (
      <div className={`flex ${className}`} style={{ gap: g }}>
        {shown.map((t, i) => <StackCard key={t.id} tool={t} main={i === 0} className="flex-1" />)}
      </div>
    );
  }

  if (layout === "tray") {
    return (
      <div className={`flex ${className}`} style={{ gap: "8px" }}>
        {shown.map((t, i) => (
          <StackCard key={t.id} tool={t} main={i === 0} highlight={highlightLast && i === n - 1} className="w-[88px] flex-none" />
        ))}
        {Array.from({ length: MAX_ON_BOARD - n }).map((_, i) => (
          <div key={i} className="flex h-[88px] w-[88px] flex-none items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-[#DAD7CF] font-display text-[17px] text-[#C9C6BD]">
            {n + 1 + i}
          </div>
        ))}
        <button type="button" onClick={onAdd} aria-label="Add a tool" className="flex h-[88px] w-[88px] flex-none items-center justify-center rounded-[12px] bg-[#F1EFE9] font-display text-[26px] font-light text-sf-subtle">
          {overflowCount(tools) > 0 ? "+" + overflowCount(tools) : "+"}
        </button>
      </div>
    );
  }

  const cols = columnsFor(n);
  const width = n === 1 ? "64%" : `calc((100% - (${cols - 1} * ${g})) / ${cols})`;
  return (
    <div className={`flex flex-wrap justify-center ${className}`} style={{ gap: g }}>
      {shown.map((t, i) => <StackCard key={t.id} tool={t} main={i === 0} style={{ width }} />)}
    </div>
  );
}
