/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { logoFor, type Tool } from "@/lib/stackflex/tools";

/** Tiny tool tag used under "How I use AI". No model, no foil. */
export function ToolTag({ tool, onClick }: { tool: Tool; onClick?: () => void }) {
  const logo = logoFor(tool);
  const style = { "--sf-aura": tool.aura } as CSSProperties;
  const inner = (
    <>
      <span className="sf-tag__coin">{logo ? <img src={logo} alt="" /> : <span>{tool.monogram ?? tool.name[0]}</span>}</span>
      {tool.name}
    </>
  );
  return onClick ? (
    <button type="button" className="sf-tag" style={style} onClick={onClick}>{inner}</button>
  ) : (
    <span className="sf-tag" style={style}>{inner}</span>
  );
}
