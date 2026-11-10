import { AiToolsIcon, AiWorkIcon } from "@/components/share/ExperienceIcon";

/**
 * Section icons for "AI Apps" and "AI-Powered Software".
 * Reuses the approved ExperienceIcon pictograms on the existing accent fills.
 */
export function AiAppsIcon({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[6.6px] text-[#6B5CE0]"
      style={{
        width: size,
        height: size,
        background: "rgba(107, 92, 224, 0.12)",
      }}
      aria-hidden
    >
      <AiToolsIcon size={Math.round(size * 0.68)} strokeWidth={1.85} />
    </span>
  );
}

export function AiSoftwareIcon({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[6.6px] text-[#3A6FE8]"
      style={{
        width: size,
        height: size,
        background: "rgba(58, 111, 232, 0.11)",
      }}
      aria-hidden
    >
      <AiWorkIcon size={Math.round(size * 0.68)} strokeWidth={1.85} />
    </span>
  );
}
