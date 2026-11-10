"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useFlip } from "@/lib/useFlip";
import { MAX_FEATURED_TOOLS } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { focusRing } from "./Controls";
import { StackCard } from "./StackCard";

/**
 * Equal-size cards. The first tool is Main (foil), never larger.
 *  grid: responsive columns; incomplete rows centered. Social card / previews.
 *  row:  equal-width row sized for featured exports (≤ MAX_FEATURED_TOOLS). Banner.
 *  tray: compact picker tray with numbered empties only while under featured count.
 *  slots: live stack preview — dynamic grid, no forced empty category slots.
 */

export const MAX_ON_BOARD = MAX_FEATURED_TOOLS;
export const overflowCount = (tools: Tool[]) => Math.max(0, tools.length - MAX_ON_BOARD);

/** Column count for grid boards — works for 1…N tools. */
export const columnsFor = (n: number) => {
  if (n <= 1) return 1;
  if (n <= 4) return 2;
  if (n <= 9) return 3;
  return 4;
};

type Props = {
  tools: Tool[];
  layout?: "grid" | "row" | "tray" | "slots";
  /** Cap how many cards render (exports). Omit to show all. */
  max?: number;
  /** CSS length, e.g. "6px", or "2cqw" in exports. */
  gap?: string;
  /**
   * Relative card scale for export grids (1 = default).
   * Use ~0.78 for social posts to leave more whitespace.
   */
  scale?: number;
  onAdd?: () => void;
  onOpen?: (tool: Tool) => void;
  onRemove?: (tool: Tool) => void;
  className?: string;
};

export function StackBoard({
  tools,
  layout = "grid",
  max,
  gap,
  scale = 1,
  onAdd,
  onOpen,
  onRemove,
  className = "",
}: Props) {
  const limit = max ?? (layout === "row" || layout === "tray" ? MAX_ON_BOARD : undefined);
  const shown = limit != null ? tools.slice(0, limit) : tools;
  const n = shown.length;
  const g = gap ?? (layout === "row" ? "8px" : "6px");

  if (layout === "row") {
    // Size as if featuring up to MAX_FEATURED_TOOLS so short stacks stay banner-height.
    const slots = MAX_ON_BOARD;
    const width = `calc((100% - ${slots - 1} * ${g}) / ${slots})`;
    return (
      <div className={`flex justify-center ${className}`} style={{ gap: g }}>
        {shown.map((t, i) => (
          <StackCard key={t.id} tool={t} main={i === 0} className="flex-none" style={{ width }} />
        ))}
      </div>
    );
  }

  if (layout === "tray") {
    const extra = overflowCount(tools);
    const empties = Math.max(0, Math.min(2, MAX_ON_BOARD - n));
    return (
      <div className={`flex flex-wrap ${className}`} style={{ gap: "8px" }}>
        {shown.map((t, i) => (
          <Interactive key={t.id} tool={t} onOpen={onOpen} onRemove={onRemove} className="w-[88px] flex-none">
            <StackCard tool={t} main={i === 0} />
          </Interactive>
        ))}
        {Array.from({ length: empties }).map((_, i) => (
          <div
            key={`empty-${i}`}
            aria-hidden="true"
            className="flex h-[88px] w-[88px] flex-none items-center justify-center rounded-[12px] border-[1.5px] border-dashed border-[#DAD7CF] font-display text-[17px] text-[#C9C6BD]"
          >
            {n + 1 + i}
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          aria-label={extra > 0 ? `Add a tool (${extra} more not shown)` : "Add a tool"}
          className={`flex h-[88px] w-[88px] flex-none items-center justify-center rounded-[12px] bg-[#F1EFE9] font-display text-[26px] font-light text-sf-subtle hover:text-sf-ink ${focusRing}`}
        >
          {extra > 0 ? "+" + extra : "+"}
        </button>
      </div>
    );
  }

  if (layout === "slots") {
    return <SlotsBoard shown={shown} gap={g} onAdd={onAdd} onOpen={onOpen} onRemove={onRemove} className={className} />;
  }

  const cols = columnsFor(n);
  const widthPct = n === 1 ? 64 * scale : undefined;
  const width =
    widthPct != null
      ? `${widthPct}%`
      : `calc((100% - (${cols - 1} * ${g})) / ${cols}${scale !== 1 ? ` * ${scale}` : ""})`;
  // When scaled down, wrap in a centered flex so whitespace grows around the board.
  const cell: CSSProperties = scale !== 1 && n > 1
    ? { width: `calc((100% - (${cols - 1} * ${g})) / ${cols})`, maxWidth: `${Math.round(100 / cols) * scale}%` }
    : { width };
  const interactive = Boolean(onOpen || onRemove);
  return (
    <div className={`flex flex-wrap justify-center ${className}`} style={{ gap: g }}>
      {shown.map((t, i) =>
        interactive ? (
          <Interactive key={t.id} tool={t} onOpen={onOpen} onRemove={onRemove} style={cell}>
            <StackCard tool={t} main={i === 0} />
          </Interactive>
        ) : (
          <StackCard key={t.id} tool={t} main={i === 0} style={cell} />
        ),
      )}
    </div>
  );
}

/** Live stack preview — grows with selection; no forced 6 empty slots. */
function SlotsBoard({
  shown,
  gap,
  onAdd,
  onOpen,
  onRemove,
  className,
}: {
  shown: Tool[];
  gap: string;
  onAdd?: () => void;
  onOpen?: (tool: Tool) => void;
  onRemove?: (tool: Tool) => void;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFlip(ref);
  const n = shown.length;
  const cols = columnsFor(Math.max(n, 1));
  return (
    <div
      ref={ref}
      className={`relative grid ${className}`}
      style={{ gap, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {shown.map((t, i) => (
        <Interactive key={t.id} tool={t} onOpen={onOpen} onRemove={onRemove} flipKey={t.id} main={i === 0}>
          <StackCard tool={t} main={i === 0} />
        </Interactive>
      ))}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add a tool"
          className={`flex aspect-square items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-[#CFCBC1] bg-white/60 font-display text-[28px] font-light text-sf-muted transition-colors hover:border-sf-ink hover:text-sf-ink ${focusRing}`}
        >
          +
        </button>
      )}
      {n === 0 && !onAdd && (
        <div
          aria-hidden="true"
          className="flex aspect-square items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-[#DAD7CF] font-display text-[17px] text-[#C9C6BD]"
        >
          1
        </div>
      )}
    </div>
  );
}

/** Wraps a card in open/remove controls when the board is interactive; otherwise renders it as is. */
function Interactive({
  tool,
  onOpen,
  onRemove,
  className = "",
  style,
  flipKey,
  main,
  children,
}: {
  tool: Tool;
  onOpen?: (tool: Tool) => void;
  onRemove?: (tool: Tool) => void;
  className?: string;
  style?: CSSProperties;
  flipKey?: string;
  main?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`group/card relative min-w-0 ${className}`}
      style={style}
      data-flip={flipKey}
      data-main={flipKey && main ? "" : undefined}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(tool)}
          aria-label={`Edit ${tool.name}`}
          className={`block w-full rounded-[12px] text-left ${focusRing}`}
        >
          {children}
        </button>
      ) : (
        children
      )}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tool)}
          aria-label={`Remove ${tool.name}`}
          className={`absolute -right-1.5 -top-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-white text-[15px] leading-none text-sf-ink opacity-0 shadow-[0_0_0_1px_#ECEAE4,0_4px_10px_-4px_rgba(11,11,12,.3)] transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100 ${focusRing}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
