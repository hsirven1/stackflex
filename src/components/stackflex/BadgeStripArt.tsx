import type { CSSProperties, Ref } from "react";
import { cardColors, type Tool } from "@/lib/stackflex/tools";
import { ToolLogo } from "./ToolLogo";

/** Export-scale pill size; the strip is sized by its content. */
const PILL_HEIGHT = 56;

/**
 * Inline badges (README tile and card close-up "small sizes"): logo coin on the tool's tint,
 * name, then version in a quieter weight. One row on a transparent background.
 */
export function BadgeStripArt({ tools, theme = "light", ref }: { tools: Tool[]; theme?: "light" | "dark"; ref?: Ref<HTMLDivElement> }) {
  const dark = theme === "dark";
  return (
    <div ref={ref} className="inline-flex gap-3 p-1" style={{ background: "transparent" }}>
      {tools.map((t) => {
        const c = cardColors(t.aura);
        const coin: CSSProperties = dark
          ? { background: "#FFFFFF", boxShadow: `0 0 0 3px ${c.haloDark}` }
          : { background: c.tint };
        return (
          <span
            key={t.id}
            className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full pl-2 pr-6 font-sans"
            style={{
              height: PILL_HEIGHT,
              background: dark ? "#121216" : "#FFFFFF",
              boxShadow: `0 0 0 2px ${dark ? "#23232A" : "#ECEAE4"}`,
              color: dark ? "#FFFFFF" : "#0B0B0C",
            }}
          >
            <span className="flex size-10 items-center justify-center rounded-full" style={coin}>
              <ToolLogo tool={t} size="22px" monogramSize="18px" />
            </span>
            <span className="text-[22px] font-semibold tracking-[-0.01em]">{t.name}</span>
            {t.version && (
              <span className="text-[20px] font-medium" style={{ color: dark ? "#A8A59C" : "#6F6D66" }}>
                {t.version}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
