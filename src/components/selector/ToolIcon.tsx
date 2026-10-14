import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { monogramFor } from "@/lib/selection/derive";

interface ToolIconProps {
  slug?: string;
  label: string;
  size?: number;
  rounded?: boolean;
}

/** Small brand mark for app chrome (pills, loadout slots, rows). */
export function ToolIcon({ slug, label, size = 16, rounded = false }: ToolIconProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center border border-sf-line bg-white ${rounded ? "rounded-full" : "rounded-[5px]"}`}
      style={{ width: size + 10, height: size + 10 }}
    >
      <ToolLogo tool={{ iconSlug: slug, monogram: monogramFor(label) }} size={`${size}px`} monogramSize={`${Math.round(size * 0.7)}px`} />
    </span>
  );
}
