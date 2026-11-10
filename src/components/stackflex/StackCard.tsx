import type { CSSProperties } from "react";
import { cardColors, categoryLabel, type Tool } from "@/lib/stackflex/tools";
import { ToolLogo } from "./ToolLogo";

// The StackFlex card. Styles: src/styles/stackflex-card.css.
// One component at every size and on every surface (landing, questionnaire, results, exports).
// main = expressive holographic material, independent of the tool: whichever tool is first is Main.
// Every card keeps its centered category header, logo, name and version line at every size.

type Props = {
  tool: Tool;
  main?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function StackCard({ tool, main = false, className = "", style }: Props) {
  const c = cardColors(tool.aura);
  const vars = {
    "--sf-tint": c.tint,
    "--sf-ring": c.ring,
    "--sf-glow": c.glow,
    "--sf-top": c.top,
    "--sf-edge": c.edge,
    ...style,
  } as CSSProperties;

  return (
    <div className={`sf-card ${main ? "sf-card--main" : ""} ${className}`} style={vars}>
      <div className="sf-card__body">
        {main && <div aria-hidden="true" className="sf-card__layer sf-card__holo" />}
        {main && <div aria-hidden="true" className="sf-card__layer sf-card__glow" />}
        <div aria-hidden="true" className="sf-card__layer sf-card__light" />
        {main && <div aria-hidden="true" className="sf-card__layer sf-card__streak2" />}

        <div className="sf-card__header">{categoryLabel(tool.category)}</div>

        <div className="sf-card__stage">
          <span className="sf-card__coin">
            <ToolLogo tool={tool} className="sf-card__logo" monogramClassName="sf-card__mono" />
            {main && (
              <span className="sf-card__main" title="Main tool">
                <span aria-hidden="true">✦</span>
                <span className="sr-only">Main tool</span>
              </span>
            )}
          </span>
        </div>

        <div className="sf-card__text">
          <span className="sf-card__name">{tool.name}</span>
          <span className="sf-card__ver">{tool.version ?? ""}</span>
        </div>
      </div>
    </div>
  );
}

/** Below 88px (badges, inline lists): logo circle and name. Category labels stay on the cards. */
export function StackChip({ tool }: { tool: Tool }) {
  const c = cardColors(tool.aura);
  return (
    <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-white pl-1.5 pr-3.5 text-sf-ink shadow-[0_0_0_1px_#ECEAE4]">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white" style={{ boxShadow: `0 0 0 2px ${c.ring}` }}>
        <ToolLogo tool={tool} size="12px" monogramSize="11px" monogramClassName="font-display font-semibold leading-none" />
      </span>
      <span className="text-[13px] font-semibold">{tool.name}</span>
    </span>
  );
}
