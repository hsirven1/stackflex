import type { CSSProperties } from "react";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import type { Tool } from "@/lib/stackflex/tools";

/** Tiny tool tag used under "How I use AI". No model, no foil. */
export function ToolTag({ tool, onClick }: { tool: Tool; onClick?: () => void }) {
  const style = { "--sf-aura": tool.aura } as CSSProperties;
  const inner = (
    <>
      <span className="sf-tag__coin">
        <ToolLogo tool={tool} size="12px" monogramSize="10px" />
      </span>
      {tool.name}
    </>
  );
  return onClick ? (
    <button type="button" className="sf-tag" style={style} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <span className="sf-tag" style={style}>
      {inner}
    </span>
  );
}
