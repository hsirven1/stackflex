"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AIProfile, CardLook, CardTheme } from "../lib/types";
import { AIProfileCard } from "./AIProfileCard";
import { LinkedInBanner } from "./LinkedInBanner";
import { BannerProfilePreview } from "./BannerProfilePreview";
import { BannerViewer } from "./BannerViewer";
import { StackFlexMark } from "./StackFlexMark";

type ExportArgs = { node: HTMLDivElement; theme: CardTheme; look: CardLook };

export type AIProfileResultsProps = {
  profile: AIProfile;
  theme?: CardTheme;                  // controlled if onThemeChange is given
  defaultTheme?: CardTheme;           // default "dark"
  onThemeChange?: (t: CardTheme) => void;
  look?: CardLook;                    // default "holo"

  /** REQUIRED. Card node (4:5) → existing PNG export at 1080×1350. */
  onDownloadCard: (args: ExportArgs) => void | Promise<void>;
  /** REQUIRED. Banner node (4:1) → existing PNG export at exactly 1584×396. */
  onDownloadBanner: (args: ExportArgs) => void | Promise<void>;
  /**
   * Optional. Native share of the card PNG where supported, otherwise copy the profile link.
   * Return "copied" when you fell back to copying so the button reads "Link copied". Omitted → Share hidden.
   */
  onShareCard?: (args: ExportArgs) => Promise<"shared" | "copied" | void> | "shared" | "copied" | void;
  onCustomize?: () => void;           // omitted → header button hidden
  avatarUrl?: string;                 // "On profile" preview only
  animateReveal?: boolean;            // default true: card reveal, then banner at +450ms
  header?: ReactNode;                 // replaces the built-in header
};

const FLASH_MS = 1600;

function useFlash() {
  const [on, setOn] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(t.current), []);
  return [on, (k: string) => { setOn(k); clearTimeout(t.current); t.current = setTimeout(() => setOn(null), FLASH_MS); }] as const;
}

/** Final Results page, direction B "Profile studio": card (hero) and LinkedIn banner on one shared stage. */
export function AIProfileResults({
  profile, theme: themeProp, defaultTheme = "dark", onThemeChange, look = "holo",
  onDownloadCard, onDownloadBanner, onShareCard, onCustomize, avatarUrl, animateReveal = true, header,
}: AIProfileResultsProps) {
  const [localTheme, setLocalTheme] = useState<CardTheme>(defaultTheme);
  const theme = themeProp ?? localTheme;
  const setTheme = (t: CardTheme) => (onThemeChange ? onThemeChange(t) : setLocalTheme(t));
  const [view, setView] = useState<"banner" | "profile">("banner");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [busy, setBusy] = useState<"card" | "banner" | null>(null);
  const [flash, fire] = useFlash();
  const cardRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const run = async (kind: "card" | "banner") => {
    const node = (kind === "card" ? cardRef : bannerRef).current;
    if (!node || busy) return;
    setBusy(kind);
    try { await (kind === "card" ? onDownloadCard : onDownloadBanner)({ node, theme, look }); fire(kind); }
    finally { setBusy(null); }
  };
  const share = async () => {
    if (!cardRef.current || !onShareCard) return;
    const r = await onShareCard({ node: cardRef.current, theme, look });
    if (r === "copied") fire("copied");
  };
  const label = (kind: "card" | "banner", idle: string) => (busy === kind ? "Saving…" : flash === kind ? "Saved ✓" : idle);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#0B0B0C]">
      <div aria-hidden className="sfr-grid-top pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative">
        {header ?? (
          <header className="flex h-14 items-center justify-between px-4 md:h-[72px] md:px-10 xl:px-20">
            <span className="flex items-center gap-2.5">
              <StackFlexMark size={22} />
              <span className="font-display text-[19px] font-semibold tracking-[-0.035em] md:text-[21px]">StackFlex</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden md:block"><ThemeToggle value={theme} onChange={setTheme} labels /></span>
              {onCustomize && (
                <button type="button" onClick={onCustomize} className="flex h-10 items-center gap-2 rounded-full bg-[#F4F3EF] px-3.5 text-[13.5px] font-semibold hover:bg-[#ECEAE4] md:px-[18px] md:text-sm">
                  ✎ <span className="md:hidden">Customize</span><span className="hidden md:inline">Customize profile</span>
                </button>
              )}
            </div>
          </header>
        )}

        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-[18px] px-4 pb-7 pt-2 md:gap-[22px] md:px-10 md:pb-8 md:pt-1 xl:px-0">
          {/* Title */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-display text-[30px] font-medium leading-none tracking-[-0.04em] md:text-[40px]">Your AI profile</h1>
              <span className="hidden text-base text-[#6F6D66] md:inline">Two assets from your stack, ready to use.</span>
            </div>
            <span className="md:hidden"><ThemeToggle value={theme} onChange={setTheme} /></span>
          </div>

          {/* Shared stage */}
          <section className="sfr-stage relative grid grid-cols-1 items-center gap-5 overflow-hidden rounded-3xl px-3 py-4 md:gap-10 md:rounded-[32px] md:p-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-16 xl:px-12 xl:py-9">
            <div aria-hidden className="sfr-stage-dots pointer-events-none absolute inset-0" />
            <div aria-hidden className="pointer-events-none absolute -left-16 top-10 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(58,46,255,.10),rgba(124,196,255,.06)_55%,transparent)]" />

            {/* Asset 1: card */}
            <div className="relative flex flex-col gap-3.5 md:mx-auto md:w-[400px] md:gap-[18px] lg:mx-0 lg:w-auto">
              <AIProfileCard ref={cardRef} profile={profile} theme={theme} look={look} animate={animateReveal} width="100%" />
              <div className="flex items-center gap-2 md:gap-2.5">
                <button type="button" onClick={() => run("card")} disabled={busy === "card"}
                  className="flex h-[52px] flex-1 items-center justify-between gap-4 rounded-full bg-[#0B0B0C] pl-6 pr-1.5 text-base font-semibold text-white hover:bg-[#24232A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 disabled:opacity-70 md:flex-none">
                  {label("card", "Download card")}
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7FF3A] text-[17px] text-[#0B0B0C]">↓</span>
                </button>
                {onShareCard && (
                  <button type="button" onClick={share} aria-label="Share card"
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_#E6E3DC] hover:shadow-[inset_0_0_0_1.5px_#0B0B0C] md:w-auto md:px-5">
                    <span className="md:hidden" aria-hidden>↗</span>
                    <span className="hidden md:inline">{flash === "copied" ? "Link copied" : "Share"}</span>
                  </button>
                )}
              </div>
            </div>

            <div aria-hidden className="relative h-px bg-[#E6E3DC] md:hidden" />

            {/* Asset 2: banner */}
            <div className="relative flex min-w-0 flex-col gap-3.5 md:gap-[18px]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-2 md:gap-3">
                  <h2 className="font-display text-xl font-medium leading-none tracking-[-0.035em] md:text-[22px]">LinkedIn banner</h2>
                  <span className="text-xs text-[#8C897F] md:text-[13px]">1584 × 396</span>
                </div>
                <div className="hidden h-9 gap-0.5 rounded-full bg-[#ECEAE4] p-[3px] md:flex" role="tablist" aria-label="Banner preview">
                  {(["banner", "profile"] as const).map((v) => (
                    <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
                      className={`h-[30px] rounded-full px-3.5 text-[13px] font-semibold transition-colors ${view === v ? "bg-white text-[#0B0B0C] shadow-[0_1px_2px_rgba(11,11,12,.12)]" : "text-[#6F6D66]"}`}>
                      {v === "banner" ? "Banner" : "On profile"}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setViewerOpen(true)} className="flex h-11 items-center text-[13.5px] font-semibold text-[#3A2EFF] md:hidden">⤢ View larger</button>
              </div>

              {/* Fixed slot on desktop so the Banner/On profile switch never shifts layout. The real banner stays mounted for export. */}
              <div className="relative flex items-center md:h-[300px]">
                <button type="button" onClick={() => setViewerOpen(true)} aria-label="View banner larger"
                  className={`block w-full overflow-hidden rounded-lg text-left shadow-[0_0_0_1px_rgba(11,11,12,.06),0_16px_30px_-20px_rgba(30,20,90,.45)] transition-opacity duration-150 md:pointer-events-none md:rounded-xl md:shadow-[0_0_0_1px_rgba(11,11,12,.06),0_30px_60px_-36px_rgba(30,20,90,.5)] ${view === "banner" ? "opacity-100" : "md:opacity-0"}`}>
                  <LinkedInBanner ref={bannerRef} profile={profile} theme={theme} animate={animateReveal} />
                </button>
                {view === "profile" && (
                  <div className="absolute inset-x-0 top-1/2 hidden -translate-y-1/2 md:block">
                    <BannerProfilePreview profile={profile} theme={theme} avatarUrl={avatarUrl} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button type="button" onClick={() => run("banner")} disabled={busy === "banner"}
                  className="h-12 flex-none whitespace-nowrap rounded-full bg-white px-5 text-[15px] font-semibold text-[#0B0B0C] shadow-[inset_0_0_0_1.5px_#0B0B0C] hover:bg-[#0B0B0C] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 disabled:opacity-70">
                  ↓ {label("banner", "Download banner")}
                </button>
                <span className="hidden text-[13px] leading-[1.45] text-[#6F6D66] md:inline">Upload it on LinkedIn: your profile → ✎ on the background photo.</span>
              </div>
            </div>
          </section>
          <span className="sr-only" aria-live="polite">{flash === "copied" ? "Profile link copied" : flash ? "Downloaded" : ""}</span>
        </div>
      </div>

      <BannerViewer open={viewerOpen} onClose={() => setViewerOpen(false)} profile={profile} theme={theme}
        onDownload={() => run("banner")} downloadLabel={label("banner", "Download banner")} />
    </main>
  );
}

function ThemeToggle({ value, onChange, labels = false }: { value: CardTheme; onChange: (t: CardTheme) => void; labels?: boolean }) {
  return (
    <div className="flex h-10 gap-0.5 rounded-full bg-[#F4F3EF] p-1" role="radiogroup" aria-label="Theme for card and banner">
      {(["dark", "light"] as const).map((t) => (
        <button key={t} type="button" role="radio" aria-checked={value === t} aria-label={t === "dark" ? "Dark" : "Light"} onClick={() => onChange(t)}
          className={`flex h-8 items-center justify-center gap-[7px] rounded-full text-[13.5px] font-semibold ${labels ? "px-3.5" : "w-8"} ${value === t ? "bg-white text-[#0B0B0C] shadow-[0_1px_2px_rgba(11,11,12,.12)]" : "text-[#6F6D66]"}`}>
          <span aria-hidden className={`rounded-full ${labels ? "h-2.5 w-2.5" : "h-3 w-3"} ${t === "dark" ? "bg-[#0B0B0C]" : "bg-white shadow-[inset_0_0_0_1.5px_#C9C6BE]"}`} />
          {labels && (t === "dark" ? "Dark" : "Light")}
        </button>
      ))}
    </div>
  );
}
