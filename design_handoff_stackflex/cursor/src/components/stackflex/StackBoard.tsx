import type { Tool } from "@/lib/stackflex/tools";
import { StackCard, type CardTheme } from "./StackCard";
import { Mark } from "./Brand";

// The StackFlex board: main pick large (2×2) with five smaller cards around it.
//  square: 3 columns. Results page, social card (square post).
//  banner: 5 columns × 2 rows. LinkedIn banner / X header. The last cell is the StackFlex mark tile.
//  tray:   5 columns × 2 rows. Questionnaire live stack: picks, numbered empty slots, "+" tile.

type Props = {
  tools: Tool[];
  layout?: "square" | "banner" | "tray";
  theme?: CardTheme;
  gap?: number | string; // px number or CSS length (cqw for exports)
  highlightLast?: boolean;
  onAdd?: () => void;
  className?: string;
};

export const MAX_ON_BOARD = 6;
export const overflowCount = (tools: Tool[]) => Math.max(0, tools.length - MAX_ON_BOARD);

export function StackBoard({ tools, layout = "square", theme = "light", gap, highlightLast, onAdd, className = "" }: Props) {
  const [main, ...rest] = tools;
  const small = rest.slice(0, MAX_ON_BOARD - 1);
  const cols = layout === "square" ? "grid-cols-3" : "grid-cols-5";
  const g = gap ?? (layout === "square" ? 12 : layout === "tray" ? 9 : 6);

  return (
    <div className={`grid ${cols} ${className}`} style={{ gap: g }}>
      {main ? (
        <StackCard
          tool={main}
          variant="main"
          theme={theme}
          fill
          className="col-span-2 row-span-2"
          showMainLabel={layout !== "banner"}
          showCategory={layout !== "banner"}
        />
      ) : (
        <EmptySlot n={1} big />
      )}

      {small.map((t, i) => (
        <StackCard
          key={t.id}
          tool={t}
          variant={layout === "square" ? "standard" : "compact"}
          theme={theme}
          highlight={layout === "tray" && highlightLast && i === small.length - 1}
        />
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

function EmptySlot({ n, big }: { n: number; big?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center border-[1.5px] border-dashed border-[#DAD7CF] font-display text-[17px] text-[#C9C6BD] ${
        big ? "col-span-2 row-span-2 rounded-[22px]" : "aspect-square rounded-[14px]"
      }`}
    >
      {n}
    </div>
  );
}
