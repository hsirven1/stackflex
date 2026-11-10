"use client";

import type { CSSProperties, Ref } from "react";
import { Mark } from "@/components/stackflex/Brand";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import type { WorkingStyleResult } from "@/lib/profile/workingStyle";
import type { Tool } from "@/lib/stackflex/tools";

const MAX_LOGOS = 8;

type Props = {
  name?: string;
  roleLabel?: string;
  style: WorkingStyleResult;
  tools: Tool[];
  /** Fixed export size (used off-screen). */
  exportSize?: { width: number; height: number };
  className?: string;
  cardRef?: Ref<HTMLDivElement>;
};

/**
 * Professional AI working-style profile card.
 * Holographic pearl surface; no scores or percentiles.
 */
export function WorkingStyleProfileCard({
  name,
  roleLabel,
  style,
  tools,
  exportSize,
  className = "",
  cardRef,
}: Props) {
  const visible = tools.slice(0, MAX_LOGOS);
  const overflow = Math.max(0, tools.length - visible.length);
  const fixed = Boolean(exportSize);
  const shellStyle: CSSProperties | undefined = exportSize
    ? { width: exportSize.width, height: exportSize.height }
    : undefined;

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-[24px] text-sf-ink ${
        fixed ? "" : "w-full shadow-[0_24px_60px_-36px_rgba(60,40,140,.45),0_0_0_1px_rgba(11,11,12,.06)]"
      } ${className}`}
      style={{
        ...shellStyle,
        background:
          "linear-gradient(115deg, rgba(255,255,255,0) 20%, rgba(186,170,255,.14) 55%, rgba(255,200,170,.12) 100%), linear-gradient(165deg, #FFFFFF 0%, #F7F5F1 55%, #F0EDE7 100%)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(118deg, transparent 28%, rgba(140,190,255,.18) 40%, rgba(255,255,255,.75) 46%, rgba(255,190,150,.16) 52%, transparent 64%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          background:
            "conic-gradient(from 210deg at 28% 40%, rgba(255,150,170,0), rgba(255,200,110,.45), rgba(130,235,185,.35), rgba(110,180,255,.5), rgba(195,150,255,.45), rgba(255,150,170,0))",
        }}
      />

      <div
        className={`relative flex h-full flex-col ${
          fixed ? "justify-between px-14 py-12" : "gap-6 px-6 py-7 sm:px-8 sm:py-8"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-sf-muted uppercase">
              Your AI Profile
            </p>
            {name ? (
              <h2
                className={`mt-2 font-display font-medium tracking-[-0.04em] ${
                  fixed ? "text-[42px] leading-none" : "text-[28px] leading-none sm:text-[34px]"
                }`}
              >
                {name}
              </h2>
            ) : null}
            {roleLabel ? (
              <p
                className={`mt-1.5 font-medium text-sf-body ${
                  fixed ? "text-[20px]" : "text-[14px] sm:text-[15px]"
                }`}
              >
                {roleLabel}
              </p>
            ) : null}
          </div>
          <Mark size={fixed ? 36 : 28} outline="#FFFFFF" />
        </div>

        <div className={fixed ? "mt-8" : ""}>
          <p
            className={`font-display font-medium tracking-[-0.045em] text-sf-ink ${
              fixed ? "text-[56px] leading-none" : "text-[36px] leading-none sm:text-[44px]"
            }`}
          >
            {style.name}
          </p>
          <p
            className={`mt-3 max-w-[36ch] leading-snug text-sf-body ${
              fixed ? "text-[22px]" : "text-[15px] sm:text-[16px]"
            }`}
          >
            {style.tagline}
          </p>
        </div>

        <div className={`flex flex-col gap-3 ${fixed ? "mt-10" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            {visible.map((t) => (
              <span
                key={t.id}
                className={`inline-flex items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#E6E3DC] ${
                  fixed ? "size-14" : "size-10"
                }`}
                title={t.name}
              >
                <ToolLogo tool={t} size={fixed ? "28px" : "20px"} monogramSize={fixed ? "22px" : "16px"} />
              </span>
            ))}
            {overflow > 0 && (
              <span
                className={`inline-flex items-center justify-center rounded-full bg-white font-semibold text-sf-muted shadow-[0_0_0_1px_#E6E3DC] ${
                  fixed ? "h-14 px-4 text-[18px]" : "h-10 px-3 text-[13px]"
                }`}
              >
                +{overflow}
              </span>
            )}
          </div>
          <p
            className={`font-medium text-sf-muted ${fixed ? "text-[18px]" : "text-[13px]"}`}
          >
            {style.toolCount} tool{style.toolCount === 1 ? "" : "s"}
            <span className="text-sf-faint"> · </span>
            {style.categoryCount} categor{style.categoryCount === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>
    </div>
  );
}

export const PROFILE_CARD_EXPORT = { width: 1200, height: 1500 } as const;
