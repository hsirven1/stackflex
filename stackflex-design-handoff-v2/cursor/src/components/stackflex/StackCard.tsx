/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { cardColors, categoryLabel, logoFor, type Tool } from "@/lib/stackflex/tools";

// The StackFlex card, final version. Styles: src/styles/stackflex-card.css.
// One component at every size and on every surface (landing, questionnaire, results, exports).
// main = expressive holo material; it is independent of the tool, so any tool can be Main.
// Every card keeps its centered category header, logo, name and version line at every size.

type Props = {
  tool: Tool;
  main?: boolean;
  highlight?: boolean; // newest pick in the questionnaire tray
  className?: string;
  style?: CSSProperties;
};

export function StackCard({ tool, main = false, highlight = false, className = "", style }: Props) {
  const c = cardColors(tool.aura);
  const logo = logoFor(tool);
  const vars = { "--sf-tint": c.tint, "--sf-ring": c.ring, "--sf-glow": c.glow, "--sf-top": c.top, "--sf-edge": c.edge, ...style } as CSSProperties;

  return (
    <div className={`sf-card ${main ? "sf-card--main" : ""} ${highlight ? "sf-card--new" : ""} ${className}`} style={vars}>
      <div className="sf-card__body">
        {main && <div aria-hidden className="sf-card__layer sf-card__holo" />}
        {main && <div aria-hidden className="sf-card__layer sf-card__glow" />}
        <div aria-hidden className="sf-card__layer sf-card__light" />
        {main && <div aria-hidden className="sf-card__layer sf-card__streak2" />}

        <div className="sf-card__header">{categoryLabel(tool.category)}</div>

        <div className="sf-card__stage">
          <span className="sf-card__coin">
            {logo ? <img src={logo} alt="" className="sf-card__logo" /> : <span className="sf-card__mono">{tool.monogram ?? tool.name[0]}</span>}
            {main && <span className="sf-card__main" title="Main tool" aria-label="Main tool">✦</span>}
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

/** Below 88px (badges, inline lists). Keeps the category. */
export function StackChip({ tool }: { tool: Tool }) {
  const c = cardColors(tool.aura);
  const logo = logoFor(tool);
  return (
    <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-white pl-1.5 pr-3.5 shadow-[0_0_0_1px_#ECEAE4]">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white" style={{ boxShadow: `0 0 0 2px ${c.ring}` }}>
        {logo ? <img src={logo} alt="" className="h-3 w-3 object-contain" /> : <span className="font-display text-[11px] font-semibold">{tool.monogram}</span>}
      </span>
      <span className="text-[13px] font-semibold">{tool.name}</span>
      <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-sf-muted">{categoryLabel(tool.category)}</span>
    </span>
  );
}
