"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AIProfile, CardLook, CardTheme } from "../lib/types";
import { AIProfileCard } from "./AIProfileCard";
import { CardThemeSwitch } from "./CardThemeSwitch";
import { StackFlexMark } from "./StackFlexMark";

export type AIProfileResultsProps = {
  profile: AIProfile;

  /** Card theme. Controlled if `onThemeChange` is given; otherwise local state starting at `defaultTheme`. */
  theme?: CardTheme;
  defaultTheme?: CardTheme;          // default "dark"
  onThemeChange?: (t: CardTheme) => void;
  look?: CardLook;                   // default "holo"

  /** REQUIRED. Receives the card DOM node; connect to the existing StackFlex PNG export. */
  onDownloadCard: (args: { node: HTMLDivElement; theme: CardTheme; look: CardLook }) => void | Promise<void>;
  downloading?: boolean;

  /** Optional. When omitted, the "Copy profile link" button is not rendered. */
  onCopyProfileLink?: () => void | Promise<void>;
  /** Optional. When omitted, the header "Edit stack" link is not rendered. */
  onEditStack?: () => void;

  /** Optional explanation shown in a collapsible "How we got this". Omitted → not rendered. */
  howDerived?: ReactNode;

  /** The existing horizontal-card toolkit (e.g. <StackSections variant="page" …/>). Omitted → section hidden. */
  toolkit?: ReactNode;

  /** Plays the reveal once on mount (honors prefers-reduced-motion). Default true. */
  animateReveal?: boolean;
  /** Optional slot for the app header if you already render one; replaces the built-in minimal header. */
  header?: ReactNode;
};

/** Page entry point: Results / AI working-style reveal. Layout only; all data and actions come from props. */
export function AIProfileResults({
  profile, theme: themeProp, defaultTheme = "dark", onThemeChange, look = "holo",
  onDownloadCard, downloading, onCopyProfileLink, onEditStack, howDerived, toolkit, animateReveal = true, header,
}: AIProfileResultsProps) {
  const [localTheme, setLocalTheme] = useState<CardTheme>(defaultTheme);
  const theme = themeProp ?? localTheme;
  const setTheme = (t: CardTheme) => (onThemeChange ? onThemeChange(t) : setLocalTheme(t));
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const toolCount = profile.toolCount ?? profile.tools.length;
  const categoryCount = profile.categoryCount ?? new Set(profile.tools.map((t) => t.category)).size;

  const download = () => cardRef.current && onDownloadCard({ node: cardRef.current, theme, look });
  const copy = async () => {
    await onCopyProfileLink?.();
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#0B0B0C]">
      {/* Background: masked 48px grid + soft ultramarine glow (approved 1e) */}
      <div aria-hidden className="sfr-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[80px] h-[560px] w-[140%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(58,46,255,.08),rgba(124,196,255,.05)_50%,transparent)] md:top-[120px] md:h-[700px] md:w-[900px]" />

      <div className="relative">
        {header ?? (
          <header className="flex h-14 items-center justify-between px-4 md:h-[72px] md:px-16">
            <span className="flex items-center gap-2 md:gap-[9px]">
              <StackFlexMark size={20} />
              <span className="font-display text-[17px] font-semibold tracking-[-0.035em] md:text-[19px]">StackFlex</span>
            </span>
            {onEditStack && (
              <button type="button" onClick={onEditStack} className="text-[13.5px] font-medium text-[#6F6D66] hover:text-[#0B0B0C] md:text-sm">
                Edit stack
              </button>
            )}
          </header>
        )}

        <section className="flex flex-col px-4 pt-3 md:items-center md:px-0 md:pt-5 md:text-center">
          <h1 className="font-display text-[32px] font-medium leading-[1.02] tracking-[-0.045em] md:text-[52px] md:leading-none md:tracking-[-0.05em]">
            Meet your AI working style.
          </h1>
          <p className="mt-2 text-[15px] text-[#6F6D66] md:mt-3 md:text-lg">Your tools tell a story. Here&apos;s yours.</p>

          <div className="mt-5 flex flex-col items-center gap-3.5 md:mt-6 md:gap-4">
            <CardThemeSwitch value={theme} onChange={setTheme} />
            <AIProfileCard ref={cardRef} profile={profile} theme={theme} look={look} animate={animateReveal} width="min(432px, 100%)" className="w-full md:w-[432px]" />
          </div>

          <div className="mt-4 flex flex-col gap-2 md:mt-6 md:flex-row md:justify-center md:gap-2.5">
            <button
              type="button"
              onClick={download}
              disabled={downloading}
              className="flex h-[52px] items-center justify-between gap-3.5 rounded-full bg-[#0B0B0C] pl-6 pr-1.5 text-base font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {downloading ? "Preparing…" : "Download card"}
              <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7FF3A] text-[17px] text-[#0B0B0C]">↓</span>
            </button>
            {onCopyProfileLink && (
              <button
                type="button"
                onClick={copy}
                className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-[22px] text-[15px] font-semibold shadow-[inset_0_0_0_1px_#D6D3CA] outline-none hover:shadow-[inset_0_0_0_1px_#A8A59C] focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2"
              >
                <span aria-hidden>{copied ? "✓" : "⧉"}</span>
                {copied ? "Copied" : "Copy profile link"}
              </button>
            )}
            <span className="sr-only" aria-live="polite">{copied ? "Profile link copied" : ""}</span>
          </div>

          {howDerived && (
            <details className="mt-3.5 self-center text-[13.5px] text-[#6F6D66]">
              <summary className="flex cursor-pointer list-none items-center gap-1.5">
                <span aria-hidden className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] shadow-[inset_0_0_0_1px_#CFCBC1]">i</span>
                How we got this
              </summary>
              <div className="mx-auto mt-2 max-w-[432px] text-left leading-relaxed">{howDerived}</div>
            </details>
          )}
        </section>

        {toolkit && (
          <section className="mx-auto mt-10 flex w-full max-w-[894px] flex-col gap-4 px-4 pb-9 md:mt-[72px] md:gap-[22px] md:px-0 md:pb-24">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[22px] font-medium leading-none tracking-[-0.035em] md:text-[26px]">Your AI toolkit</h2>
              <span className="text-[13px] text-[#6F6D66] md:text-sm">
                {toolCount} tools<span className="hidden md:inline"> · {categoryCount} categories</span>
              </span>
            </div>
            {toolkit}
          </section>
        )}
      </div>
    </main>
  );
}
