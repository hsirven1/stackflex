/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { categoryLabel, logoFor, type Tool } from "@/lib/stackflex/tools";

export type RowCardSize = "auto" | "md" | "preview" | "sm";

type Props = {
  tool: Tool;
  main?: boolean;
  size?: RowCardSize;       // auto = sm on mobile, md from 640px (public page)
  href?: string;            // makes the card interactive (hover/focus states)
  onClick?: () => void;
  className?: string;
};

/** Horizontal collectible card. Same data, colors and Main treatment as the square StackCard. */
export function StackCardRow({ tool, main = false, size = "auto", href, onClick, className = "" }: Props) {
  const logo = logoFor(tool);
  const interactive = Boolean(href || onClick);
  const cls = `sf-row sf-row--${size} ${main ? "sf-row--main" : ""} ${interactive ? "sf-row--interactive" : ""} ${className}`;
  const style = { "--sf-aura": tool.aura } as CSSProperties;
  const body = (
    <>
      {main ? (
        <>
          <span aria-hidden className="sf-row__foil" />
          <span aria-hidden className="sf-row__glow" />
          <span aria-hidden className="sf-row__streak" />
        </>
      ) : (
        <span aria-hidden className="sf-row__pearl" />
      )}
      <span className="sf-row__coin">
        {logo ? <img src={logo} alt="" className="sf-row__logo" /> : <span className="sf-row__mono">{tool.monogram ?? tool.name[0]}</span>}
        {main && <span className="sf-row__badge" aria-hidden>✦</span>}
      </span>
      <span className="sf-row__text">
        <span className="sf-row__cat">
          {categoryLabel(tool.category)}
          {main && <span className="sf-row__main"> · Main</span>}
        </span>
        <span className="sf-row__name">{tool.name}</span>
        {tool.version && <span className="sf-row__model">{tool.version}</span>}
      </span>
    </>
  );
  const label = `${tool.name}${tool.version ? ", " + tool.version : ""}${main ? ", main tool" : ""}`;
  if (href) return <a href={href} className={cls} style={style} aria-label={label}>{body}</a>;
  if (onClick) return <button type="button" onClick={onClick} className={`${cls} text-left`} style={style} aria-label={label}>{body}</button>;
  return <div className={cls} style={style} aria-label={label} role="listitem">{body}</div>;
}
