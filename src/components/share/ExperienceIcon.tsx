import type { ExperienceKind } from "@/lib/stackflex/experience";

type IconProps = {
  size?: number;
  className?: string;
  /** Stroke weight — thinner at larger display sizes. */
  strokeWidth?: number;
};

/**
 * Original StackFlex pictograms for AI experience categories.
 * One visual family: rounded geometry, currentColor strokes, subtle AI spark.
 * Distinct silhouettes even without color.
 */
export function ExperienceIcon({
  kind,
  size = 22,
  className = "",
  strokeWidth,
}: IconProps & { kind: ExperienceKind }) {
  const sw = strokeWidth ?? (size >= 20 ? 1.75 : size >= 14 ? 1.9 : 2);
  if (kind === "tools") return <AiToolsIcon size={size} className={className} strokeWidth={sw} />;
  if (kind === "work") return <AiWorkIcon size={size} className={className} strokeWidth={sw} />;
  return <AiWorkflowsIcon size={size} className={className} strokeWidth={sw} />;
}

/** Stacked app tiles + four-point AI spark — standalone AI tool collection. */
export function AiToolsIcon({ size = 22, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2.75"
        y="3.5"
        width="11.25"
        height="11.25"
        rx="2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <rect
        x="10"
        y="9.25"
        width="11.25"
        height="11.25"
        rx="2.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M18.15 2.45 18.9 4.45l2 .75-2 .75-.75 2-.75-2-2-.75 2-.75z"
        fill="currentColor"
      />
    </svg>
  );
}

/** App window with chrome + embedded AI spark — AI inside business software. */
export function AiWorkIcon({ size = 22, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2.75"
        y="3.75"
        width="18.5"
        height="16.5"
        rx="3"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        d="M2.75 9h18.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="6.4" cy="6.35" r="0.95" fill="currentColor" />
      <circle cx="9.2" cy="6.35" r="0.95" fill="currentColor" />
      <path
        d="M6 13.35h5.25M6 16.5h3.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M16.4 12.15 17.25 14.3l2.15.85-2.15.85-.85 2.15-.85-2.15-2.15-.85 2.15-.85z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Three connected nodes with directional flow — real AI workflows. */
export function AiWorkflowsIcon({ size = 22, className = "", strokeWidth = 1.75 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Connectors */}
      <path
        d="M8.15 12h2.6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M13.25 12h2.15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* Directional arrow into the last node */}
      <path
        d="M14.35 9.85 16.85 12l-2.5 2.15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.35" cy="12" r="2.85" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="2.85" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="18.65" cy="12" r="2.85" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}
