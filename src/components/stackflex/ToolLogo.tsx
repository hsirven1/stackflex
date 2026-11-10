import { getLogo } from "@/lib/catalog/icons";
import type { Tool } from "@/lib/stackflex/tools";
import { resolveIconColor, THEMES } from "@/lib/themes";

/**
 * Official logo in full color (Simple Icons or bundled Lobe Icons SVGs; no CDN at render or export
 * time). Brands with no logo in either show a Funnel Display monogram. Size either with CSS lengths
 * (`size`, `monogramSize`) or with classes from stackflex-card.css.
 */
export function ToolLogo({
  tool,
  size,
  monogramSize,
  className = "",
  monogramClassName = "",
}: {
  tool: Pick<Tool, "iconSlug" | "monogram">;
  size?: string;
  monogramSize?: string;
  className?: string;
  monogramClassName?: string;
}) {
  const logo = getLogo(tool.iconSlug);
  if (logo) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={className}
        style={size ? { width: size, height: size, display: "block" } : { display: "block" }}
      >
        {logo.kind === "path" ? (
          <path d={logo.path} fill={resolveIconColor(THEMES.light, logo.hex)} />
        ) : (
          <image href={logo.src} width="24" height="24" />
        )}
      </svg>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={monogramClassName || "font-display font-medium leading-none tracking-[-0.04em] text-sf-ink"}
      style={monogramSize ? { fontSize: monogramSize } : undefined}
    >
      {tool.monogram}
    </span>
  );
}
