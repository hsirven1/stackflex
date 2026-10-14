import { getBrandIcon } from "@/lib/catalog/icons";
import type { Tool } from "@/lib/stackflex/tools";
import { resolveIconColor, THEMES } from "@/lib/themes";

/**
 * Official logo in full color (Simple Icons, bundled), always drawn on a white coin. Brands without
 * a Simple Icons entry show a Funnel Display monogram. Sizes are CSS lengths so cards can use cqw.
 */
export function ToolLogo({
  tool,
  size,
  monogramSize,
}: {
  tool: Pick<Tool, "iconSlug" | "monogram">;
  size: string;
  monogramSize: string;
}) {
  const icon = getBrandIcon(tool.iconSlug);
  if (icon) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: size, height: size, display: "block" }}>
        <path d={icon.path} fill={resolveIconColor(THEMES.light, icon.hex)} />
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="font-display font-medium leading-none tracking-[-0.04em] text-sf-ink"
      style={{ fontSize: monogramSize }}
    >
      {tool.monogram}
    </span>
  );
}
