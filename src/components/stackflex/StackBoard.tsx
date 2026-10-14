import type { ReactNode } from "react";
import type { Tool } from "@/lib/stackflex/tools";
import { Mark } from "./Brand";
import { focusRing } from "./Controls";
import { StackCard, type CardTheme } from "./StackCard";

// The StackFlex board: main pick large (2×2) with five smaller cards around it.
//  square: 3 columns. Results page, social card (square post).
//  banner: 5 columns × 2 rows. LinkedIn banner / X header. The last cell is the StackFlex mark tile.
//  tray:   5 columns × 2 rows. Questionnaire live stack: picks, numbered empty slots, "+" tile.

type Props = {
  tools: Tool[];
  layout?: "square" | "banner" | "tray";
  theme?: CardTheme;
  /** px number or CSS length (cqw for exports). */
  gap?: number | string;
  highlightLast?: boolean;
  onAdd?: () => void;
  /** Tray: clicking a card, e.g. to jump to the question it answers. */
  onOpen?: (tool: Tool) => void;
  /** Tray: adds a remove control to each card. */
  onRemove?: (tool: Tool) => void;
  className?: string;
};

export const MAX_ON_BOARD = 6;
export const overflowCount = (tools: Tool[]) => Math.max(0, tools.length - MAX_ON_BOARD);

export function StackBoard({
  tools,
  layout = "square",
  theme = "light",
  gap,
  highlightLast,
  onAdd,
  onOpen,
  onRemove,
  className = "",
}: Props) {
  const [main, ...rest] = tools;
  const small = rest.slice(0, MAX_ON_BOARD - 1);
  const cols = layout === "square" ? "grid-cols-3" : "grid-cols-5";
  const g = gap ?? (layout === "square" ? 12 : layout === "tray" ? 9 : 6);

  return (
    <div className={`grid ${cols} ${className}`} style={{ gap: g }}>
      {main ? (
        <Interactive tool={main} onOpen={onOpen} onRemove={onRemove} className="col-span-2 row-span-2">
          <StackCard
            tool={main}
            variant="main"
            theme={theme}
            fill
            className={onOpen || onRemove ? "h-full" : "col-span-2 row-span-2"}
            showMainLabel={layout !== "banner"}
            showCategory={layout !== "banner"}
          />
        </Interactive>
      ) : (
        <EmptySlot n={1} big />
      )}

      {small.map((t, i) => (
        <Interactive key={t.id} tool={t} onOpen={onOpen} onRemove={onRemove}>
          <StackCard
            tool={t}
            variant={layout === "square" ? "standard" : "compact"}
            theme={theme}
            highlight={layout === "tray" && highlightLast && i === small.length - 1}
          />
        </Interactive>
      ))}

      {layout === "tray" && (
        <>
          {Array.from({ length: Math.max(0, MAX_ON_BOARD - 1 - small.length) }).map((_, i) => (
            <EmptySlot key={i} n={small.length + 2 + i} />
          ))}
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add a tool"
            className="flex aspect-square items-center justify-center rounded-[14px] bg-[#F1EFE9] font-display text-[26px] font-light text-sf-subtle"
          >
            {overflowCount(tools) > 0 ? "+" + overflowCount(tools) : "+"}
          </button>
        </>
      )}

      {layout === "banner" && (
        <div
          className="flex aspect-square items-center justify-center"
          style={{ borderRadius: "21%", background: theme === "dark" ? "#16161A" : "#0B0B0C" }}
        >
          <Mark size={14} outline={theme === "dark" ? "#16161A" : "#0B0B0C"} />
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
  children,
}: {
  tool: Tool;
  onOpen?: (tool: Tool) => void;
  onRemove?: (tool: Tool) => void;
  className?: string;
  children: ReactNode;
}) {
  if (!onOpen && !onRemove) return children;
  return (
    <div className={`group/card relative min-w-0 ${className}`}>
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(tool)}
          aria-label={`${tool.name}: go to its question`}
          className={`block h-full w-full rounded-[14px] text-left ${focusRing}`}
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

function EmptySlot({ n, big }: { n: number; big?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center border-[1.5px] border-dashed border-[#DAD7CF] font-display text-[17px] text-[#C9C6BD] ${
        big ? "col-span-2 row-span-2 rounded-[22px]" : "aspect-square rounded-[14px]"
      }`}
    >
      {n}
    </div>
  );
}
