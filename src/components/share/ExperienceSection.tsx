import type { ReactNode } from "react";
import { ExperienceIcon } from "@/components/share/ExperienceIcon";
import {
  EXPERIENCE_SECTIONS,
  type ExperienceKind,
  type ExperienceSectionDef,
  type ExperienceWorkflow,
} from "@/lib/stackflex/experience";

export type ExperienceHeaderSize = "full" | "compact" | "mini";

/**
 * Prominent experience-section header: tinted icon square + bold title + optional subtitle.
 * Used on the public personal page (full) and Results preview (compact / mini).
 */
export function ExperienceSectionHeader({
  kind,
  size = "full",
  className = "",
  def = EXPERIENCE_SECTIONS[kind],
}: {
  kind: ExperienceKind;
  size?: ExperienceHeaderSize;
  className?: string;
  def?: ExperienceSectionDef;
}) {
  const full = size === "full";
  const mini = size === "mini";
  const box = full ? "size-[48px] rounded-[14px]" : mini ? "size-7 rounded-[8px]" : "size-9 rounded-[10px]";
  const iconPx = full ? 24 : mini ? 14 : 18;
  const showSubtitle = full;

  const titleId = `exp-${kind}-title`;

  return (
    <header className={`flex items-start gap-3 text-left sm:gap-3.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center ${box}`}
        style={{ background: def.accent.tint, color: def.accent.ink }}
      >
        <ExperienceIcon kind={kind} size={iconPx} strokeWidth={full ? 1.7 : 1.9} />
      </span>
      <div className="min-w-0 pt-0.5">
        <h3
          id={titleId}
          className={`font-display font-semibold tracking-[-0.035em] text-sf-ink ${
            full ? "text-[22px] leading-tight sm:text-[24px]" : mini ? "text-[11px] leading-tight" : "text-[14px] leading-snug"
          }`}
        >
          {def.title}
        </h3>
        {showSubtitle && (
          <p className="mt-1 max-w-[36ch] text-[14px] leading-snug text-sf-muted sm:text-[14.5px]">
            {def.subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

/**
 * Full experience block: header, hairline, then content.
 * No outer card chrome — spacing and the accent line carry hierarchy.
 */
export function ExperienceSection({
  kind,
  size = "full",
  children,
  className = "",
  def = EXPERIENCE_SECTIONS[kind],
}: {
  kind: ExperienceKind;
  size?: ExperienceHeaderSize;
  children: ReactNode;
  className?: string;
  def?: ExperienceSectionDef;
}) {
  const full = size === "full";
  const mini = size === "mini";
  // Indent content to the title text (icon box + header gap), not the icon edge.
  const contentIndent = full
    ? "pl-[60px] sm:pl-[62px]"
    : mini
      ? "pl-10"
      : "pl-12";

  return (
    <section className={`w-full text-left ${className}`} aria-labelledby={`exp-${kind}-title`}>
      <ExperienceSectionHeader kind={kind} size={size} def={def} />
      <div
        aria-hidden="true"
        className={`mt-3 w-full ${full ? "h-px" : mini ? "mt-1.5 h-px" : "mt-2 h-px"}`}
        style={{ background: def.accent.line }}
      />
      <div className={`${contentIndent} ${full ? "mt-5 sm:mt-6" : mini ? "mt-2" : "mt-3"}`}>
        {children}
      </div>
    </section>
  );
}

/** Future-ready list for user-authored workflows — never invented from tool selection. */
export function ExperienceWorkflowList({
  workflows,
  size = "full",
}: {
  workflows: ExperienceWorkflow[];
  size?: ExperienceHeaderSize;
}) {
  if (workflows.length === 0) return null;
  const full = size === "full";
  return (
    <ul className={`flex w-full max-w-[560px] flex-col ${full ? "gap-3" : "gap-2"}`}>
      {workflows.map((w) => (
        <li
          key={w.id}
          className={`rounded-[12px] border border-[#EFECE5] bg-[#FAF9F6]/80 text-left ${
            full ? "px-4 py-3.5" : "px-3 py-2"
          }`}
        >
          <p className={`font-semibold text-sf-ink ${full ? "text-[15px]" : "text-[12px]"}`}>{w.title}</p>
          {w.description?.trim() && (
            <p className={`mt-1 text-sf-muted ${full ? "text-[13.5px] leading-relaxed" : "text-[11px] leading-snug"}`}>
              {w.description.trim()}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
