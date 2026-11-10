import type { CSSProperties } from "react";
import { Mark } from "@/components/stackflex/Brand";
import { StackFlexMark } from "./StackFlexMark";

type Props = {
  /** CSS length for the mark (px or container units). */
  size?: number | string;
  /** Ring color cut out of the lime square — match the surrounding surface. */
  outline?: string;
  /** Text/mark color for the label. */
  color?: string;
  /** Font size for the label; defaults slightly smaller than prior wordmark. */
  fontSize?: number | string;
  /** Prefer the results-local StackFlexMark (inline styles) for export fidelity. */
  mark?: "brand" | "results";
  className?: string;
  style?: CSSProperties;
};

/**
 * Subtle asset signature: mark + "Made with StackFlex".
 * Used on the AI profile card and LinkedIn banner (and their PNG exports).
 */
export function MadeWithStackFlex({
  size = 13,
  outline = "#FFFFFF",
  color = "#55534D",
  fontSize,
  mark = "results",
  className = "",
  style,
}: Props) {
  const labelSize = fontSize ?? (typeof size === "number" ? size * 0.88 : size);
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: typeof size === "number" ? Math.max(5, size * 0.45) : "0.45em",
        fontSize: labelSize,
        fontWeight: 550,
        letterSpacing: "-0.01em",
        color,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {mark === "brand" ? <Mark size={size} outline={outline} /> : <StackFlexMark size={size} outline={outline} />}
      <span>
        <span style={{ fontWeight: 500, opacity: 0.72 }}>Made with </span>
        <span style={{ fontFamily: "var(--font-display), 'Funnel Display', sans-serif", fontWeight: 650, letterSpacing: "-0.03em" }}>
          StackFlex
        </span>
      </span>
    </span>
  );
}
