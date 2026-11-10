"use client";

import Link from "next/link";
import { Mark } from "@/components/stackflex/Brand";
import { StackBoard } from "@/components/stackflex/StackBoard";
import { derivedCapabilities } from "@/lib/portfolio/store";
import {
  WORK_STATUS_LABEL,
  WORK_TYPE_LABEL,
  type PortfolioExperience,
  type PortfolioProfile,
  type PortfolioState,
} from "@/lib/portfolio/types";
import type { Tool } from "@/lib/stackflex/tools";

/**
 * The live portfolio webpage composition — used in the builder preview and the full preview route.
 * Renders user text as text nodes only (never HTML).
 */
export function PortfolioDocument({
  portfolio,
  tools,
  className = "",
  compact = false,
}: {
  portfolio: PortfolioState;
  tools: Tool[];
  className?: string;
  /** Tighter spacing for the builder column. */
  compact?: boolean;
}) {
  const { profile, experiences, showCapabilities } = portfolio;
  const visible = experiences.filter((e) => e.visible).sort((a, b) => a.order - b.order);
  const caps = showCapabilities ? derivedCapabilities(experiences) : [];
  const name = profile.name.trim() || "Your name";
  const headline = profile.headline.trim() || "I build, create and solve problems with AI.";
  const pad = compact ? "px-6 py-8 md:px-8" : "px-8 py-12 md:px-14 md:py-16";

  return (
    <article
      className={`overflow-hidden rounded-[24px] border border-[#E5E1D8] bg-white text-sf-ink shadow-[0_24px_60px_-40px_rgba(11,11,12,.35)] ${className}`}
    >
      <header className={`relative border-b border-[#EEECE6] ${pad}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full opacity-80"
          style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.10), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 left-10 size-40 rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, rgba(215,255,58,.18), transparent)" }}
        />
        <div className="relative flex flex-col gap-4">
          <p className="font-display text-[40px] font-medium leading-[0.95] tracking-[-0.045em] md:text-[52px]">
            Hi, I’m <span className="text-sf-blue">{name}.</span>
          </p>
          <p className="max-w-[36ch] text-lg leading-snug text-sf-body md:text-[22px]">{headline}</p>
          {profile.bio.trim() && (
            <p className="max-w-[52ch] text-[15px] leading-snug text-sf-muted">{profile.bio.trim()}</p>
          )}
          <ProfileMeta profile={profile} />
        </div>
      </header>

      <section className={`border-b border-[#EEECE6] ${pad}`}>
        <SectionLabel>My AI Stack</SectionLabel>
        {tools.length > 0 ? (
          <StackBoard tools={tools} layout="grid" gap="8px" className="mt-5 max-w-[540px]" />
        ) : (
          <p className="mt-4 text-sm text-sf-muted">
            No tools in your stack yet.{" "}
            <Link href="/#results" className="font-semibold text-sf-blue underline-offset-2 hover:underline">
              Build your stack
            </Link>{" "}
            first, then return here.
          </p>
        )}
      </section>

      <section className={`border-b border-[#EEECE6] ${pad}`}>
        <SectionLabel>Selected work</SectionLabel>
        {visible.length === 0 ? (
          <p className="mt-4 max-w-[42ch] text-sm leading-snug text-sf-muted">
            Import experiences from ChatGPT or Claude, or add work manually. Nothing appears here until you choose it.
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {visible.map((exp) => (
              <li key={exp.id}>
                <WorkCard experience={exp} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {caps.length > 0 && (
        <section className={`border-b border-[#EEECE6] ${pad}`}>
          <SectionLabel>Capabilities</SectionLabel>
          <p className="mt-2 max-w-[48ch] text-[13px] text-sf-subtle">
            Descriptive areas drawn from your selected work — not skill ratings or certifications.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {caps.map((c) => (
              <li
                key={c}
                className="rounded-full bg-[#FAF9F6] px-3.5 py-1.5 text-[13px] font-medium text-sf-ink shadow-[0_0_0_1px_#ECEAE4]"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className={`flex items-center justify-between gap-4 ${compact ? "px-6 py-5" : "px-8 py-6 md:px-14"}`}>
        <span className="flex items-center gap-2 text-[13px] text-sf-subtle">
          <Mark size={16} />
          Built with StackFlex
        </span>
        <span className="text-[12px] text-sf-faint">Local preview · not a public link</span>
      </footer>
    </article>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <h2 className="font-display text-[22px] font-medium tracking-[-0.03em]">{children}</h2>;
}

function ProfileMeta({ profile }: { profile: PortfolioProfile }) {
  const bits: { label: string; href?: string }[] = [];
  if (profile.location?.trim()) bits.push({ label: profile.location.trim() });
  if (profile.linkedinUrl?.trim()) bits.push({ label: "LinkedIn", href: profile.linkedinUrl.trim() });
  if (profile.websiteUrl?.trim()) bits.push({ label: "Website", href: profile.websiteUrl.trim() });
  if (bits.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-sf-muted">
      {bits.map((b) => (
        <li key={b.label + (b.href ?? "")}>
          {b.href ? (
            <a href={b.href} target="_blank" rel="noopener noreferrer" className="font-medium text-sf-blue hover:underline">
              {b.label}
            </a>
          ) : (
            b.label
          )}
        </li>
      ))}
    </ul>
  );
}

function WorkCard({ experience }: { experience: PortfolioExperience }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-[18px] border border-[#ECEAE4] bg-[#FAF9F6] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sf-blue">
          {WORK_TYPE_LABEL[experience.type]}
        </span>
        <span className="text-[11px] font-medium text-sf-subtle">{WORK_STATUS_LABEL[experience.status]}</span>
      </div>
      <h3 className="font-display text-[18px] font-medium leading-snug tracking-[-0.025em]">{experience.title}</h3>
      <p className="flex-1 text-[13px] leading-snug text-sf-body">{experience.description}</p>
      {experience.outcome && (
        <p className="text-[12px] leading-snug text-sf-muted">
          <span className="font-semibold text-sf-ink">Outcome: </span>
          {experience.outcome}
        </p>
      )}
      {(experience.tools.length > 0 || experience.capabilities.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {experience.tools.map((t) => (
            <span key={`t-${t}`} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium shadow-[0_0_0_1px_#ECEAE4]">
              {t}
            </span>
          ))}
          {experience.capabilities.map((c) => (
            <span key={`c-${c}`} className="rounded-full bg-sf-blue/8 px-2.5 py-1 text-[11px] font-medium text-sf-blue">
              {c}
            </span>
          ))}
        </div>
      )}
      {experience.link && (
        <a
          href={experience.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-semibold text-sf-blue hover:underline"
        >
          View link ↗
        </a>
      )}
    </article>
  );
}
