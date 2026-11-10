import type { CSSProperties } from "react";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { cardColors, categoryLabel, type Tool } from "@/lib/stackflex/tools";

export type RowCardSize = "auto" | "md" | "preview" | "sm";

type Props = {
  tool: Tool;
  main?: boolean;
  size?: RowCardSize;
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** Horizontal collectible card. Same data/colors/Main treatment as the square StackCard. */
export function StackCardRow({
  tool,
  main = false,
  size = "auto",
  href,
  onClick,
  className = "",
}: Props) {
  const interactive = Boolean(href || onClick);
  const cls = `sf-row sf-row--${size} ${main ? "sf-row--main" : ""} ${interactive ? "sf-row--interactive" : ""} ${className}`;
  const c = cardColors(tool.aura);
  const style = {
    "--sf-aura": tool.aura,
    "--sf-tint": c.tint,
    "--sf-glow": c.glow,
    "--sf-top": c.top,
    "--sf-edge": c.edge,
  } as CSSProperties;
  const body = (
    <>
      {main ? (
        <>
          <span aria-hidden className="sf-row__foil" />
          <span aria-hidden className="sf-row__glow" />
          <span aria-hidden className="sf-row__streak" />
          <span aria-hidden className="sf-row__streak2" />
        </>
      ) : (
        <span aria-hidden className="sf-row__pearl" />
      )}
      <span className="sf-row__coin">
        <ToolLogo
          tool={tool}
          className="sf-row__logo"
          size="52%"
          monogramClassName="sf-row__mono"
          monogramSize="42%"
        />
        {main && (
          <span className="sf-row__badge" aria-hidden>
            ✦
          </span>
        )}
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
  const label = `${tool.name}${tool.version ? `, ${tool.version}` : ""}${main ? ", main tool" : ""}`;
  if (href) {
    return (
      <a href={href} className={cls} style={style} aria-label={label}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} text-left`} style={style} aria-label={label}>
        {body}
      </button>
    );
  }
  return (
    <div className={cls} style={style} aria-label={label} role="listitem">
      {body}
    </div>
  );
}
