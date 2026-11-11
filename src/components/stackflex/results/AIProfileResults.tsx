"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "@/styles/profile-results.css";
import type { AIProfile, CardLook, CardTheme } from "./lib/types";
import { AIProfileCard } from "./AIProfileCard";
import { BannerProfilePreview } from "./BannerProfilePreview";
import { BannerViewer } from "./BannerViewer";
import { CardReveal, usePackReveal } from "./CardReveal";
import { BANNER_MAX_TOOLS, LinkedInBanner } from "./LinkedInBanner";
import { StackFlexMark } from "./StackFlexMark";

type ExportArgs = { node: HTMLDivElement; theme: CardTheme; look: CardLook };

export type AIProfileResultsProps = {
  profile: AIProfile;
  /** Theme for the AI profile card (and its PNG). */
  cardTheme?: CardTheme;
  defaultCardTheme?: CardTheme;
  onCardThemeChange?: (t: CardTheme) => void;
  /** Theme for the LinkedIn banner (and its PNG). */
  bannerTheme?: CardTheme;
  defaultBannerTheme?: CardTheme;
  onBannerThemeChange?: (t: CardTheme) => void;
  look?: CardLook;

  /** Card node (4:5) → PNG export at 1080×1350. */
  onDownloadCard: (args: ExportArgs) => void | Promise<void>;
  /** Banner node (4:1) → PNG export at true 2× (3168×792). */
  onDownloadBanner: (args: ExportArgs) => void | Promise<void>;
  /**
   * Native share of the card PNG where supported, otherwise copy the profile link.
   * Return "copied" when falling back so the button reads "Link copied".
   */
  onShareCard?: (args: ExportArgs) => Promise<"shared" | "copied" | void> | "shared" | "copied" | void;
  onCustomize?: () => void;
  avatarUrl?: string;
  displayName?: string;
  headline?: string;
  /** Legacy sheen-only reveal. Prefer `playReveal` for the collectible flip. */
  animateReveal?: boolean;
  /** Play the single-card flip once after generation. */
  playReveal?: boolean;
  header?: ReactNode;
  /** Extra header control (e.g. Start over). */
  headerEnd?: ReactNode;
};

const FLASH_MS = 1600;

function useFlash() {
  const [on, setOn] = useState<string | null>(null);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  return [
    on,
    (k: string) => {
      setOn(k);
      clearTimeout(t.current);
      t.current = setTimeout(() => setOn(null), FLASH_MS);
    },
  ] as const;
}

function useThemeState(
  controlled: CardTheme | undefined,
  onChange: ((t: CardTheme) => void) | undefined,
  fallback: CardTheme,
) {
  const [local, setLocal] = useState<CardTheme>(fallback);
  const value = controlled ?? local;
  const set = (t: CardTheme) => (onChange ? onChange(t) : setLocal(t));
  return [value, set] as const;
}

/** Direction B "Profile studio": card (hero) and LinkedIn banner on one shared stage. */
export function AIProfileResults({
  profile,
  cardTheme: cardThemeProp,
  defaultCardTheme = "light",
  onCardThemeChange,
  bannerTheme: bannerThemeProp,
  defaultBannerTheme = "dark",
  onBannerThemeChange,
  look = "holo",
  onDownloadCard,
  onDownloadBanner,
  onShareCard,
  onCustomize,
  avatarUrl,
  displayName,
  headline,
  animateReveal = false,
  playReveal = false,
  header,
  headerEnd,
}: AIProfileResultsProps) {
  const [cardTheme, setCardTheme] = useThemeState(cardThemeProp, onCardThemeChange, defaultCardTheme);
  const [bannerTheme, setBannerTheme] = useThemeState(bannerThemeProp, onBannerThemeChange, defaultBannerTheme);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [busy, setBusy] = useState<"card" | "banner" | null>(null);
  const [flash, fire] = useFlash();
  const cardRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const pack = usePackReveal(playReveal);

  // Banner entrance is secondary: once on reveal, not for the whole session / theme changes.
  const bannerEnter = (animateReveal && !playReveal) || pack.playing;

  const run = async (kind: "card" | "banner") => {
    const node = (kind === "card" ? cardRef : bannerRef).current;
    if (!node || busy) return;
    const theme = kind === "card" ? cardTheme : bannerTheme;
    setBusy(kind);
    try {
      await (kind === "card" ? onDownloadCard : onDownloadBanner)({ node, theme, look });
      fire(kind);
    } finally {
      setBusy(null);
    }
  };
  const share = async () => {
    if (!cardRef.current || !onShareCard) return;
    const r = await onShareCard({ node: cardRef.current, theme: cardTheme, look });
    if (r === "copied") fire("copied");
  };
  const label = (kind: "card" | "banner", idle: string) =>
    busy === kind ? "Saving…" : flash === kind ? "Saved ✓" : idle;

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white text-[#0B0B0C]">
      <div aria-hidden className="sfr-grid-top pointer-events-none absolute inset-x-0 top-0 h-[520px]" />

      <div className="relative">
        {header === undefined ? (
          <header className="flex h-14 items-center justify-between px-4 md:h-[72px] md:px-10 xl:px-20">
            <span className="flex items-center gap-2.5">
              <StackFlexMark size={22} />
              <span className="font-display text-[19px] font-semibold tracking-[-0.035em] md:text-[21px]">StackFlex</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              {onCustomize && (
                <button
                  type="button"
                  onClick={onCustomize}
                  className="flex h-10 items-center gap-2 rounded-full bg-[#F4F3EF] px-3.5 text-[13.5px] font-semibold hover:bg-[#ECEAE4] md:px-[18px] md:text-sm"
                >
                  ✎ <span className="md:hidden">Edit</span>
                  <span className="hidden md:inline">Edit my profile</span>
                </button>
              )}
              {headerEnd}
            </div>
          </header>
        ) : (
          header
        )}

        <div className="mx-auto w-full max-w-[1280px] px-4 pb-7 pt-4 md:px-10 md:pb-8 md:pt-7 xl:px-0">
          <section className="sfr-stage relative grid grid-cols-1 items-start gap-6 overflow-hidden rounded-3xl px-3 py-4 md:gap-10 md:rounded-[32px] md:p-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-14 xl:px-12 xl:py-9">
            <div aria-hidden className="sfr-stage-dots pointer-events-none absolute inset-0" />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 top-10 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(58,46,255,.10),rgba(124,196,255,.06)_55%,transparent)]"
            />

            {/* Asset 1: card */}
            <div className="relative flex flex-col gap-3.5 md:mx-auto md:w-[360px] md:gap-[18px] lg:mx-0 lg:w-auto">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-medium leading-none tracking-[-0.035em] md:text-[22px]">
                  AI profile card
                </h2>
                <ThemeToggle value={cardTheme} onChange={setCardTheme} labels ariaLabel="Card theme" />
              </div>

              <CardReveal playing={pack.playing} run={pack.run}>
                <AIProfileCard
                  ref={cardRef}
                  profile={profile}
                  theme={cardTheme}
                  look={look}
                  animate={animateReveal && !playReveal}
                  width="100%"
                />
              </CardReveal>
              <div className={`flex items-center gap-2 md:gap-2.5 ${pack.playing ? "sfr-cta-in" : ""}`}>
                <button
                  type="button"
                  onClick={() => void run("card")}
                  disabled={busy === "card"}
                  className="flex h-[52px] flex-1 items-center justify-between gap-4 rounded-full bg-[#0B0B0C] pl-6 pr-1.5 text-base font-semibold text-white hover:bg-[#24232A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 disabled:opacity-70 md:flex-none"
                >
                  {label("card", "Download card")}
                  <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7FF3A] text-[17px] text-[#0B0B0C]">
                    ↓
                  </span>
                </button>
                {onShareCard && (
                  <button
                    type="button"
                    onClick={() => void share()}
                    aria-label="Share card"
                    className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[15px] font-semibold shadow-[inset_0_0_0_1.5px_#E6E3DC] hover:shadow-[inset_0_0_0_1.5px_#0B0B0C] md:w-auto md:px-5"
                  >
                    <span className="md:hidden" aria-hidden>
                      ↗
                    </span>
                    <span className="hidden md:inline">{flash === "copied" ? "Link copied" : "Share"}</span>
                  </button>
                )}
              </div>
            </div>

            <div aria-hidden className="relative h-px bg-[#E6E3DC] md:hidden" />

            {/* Asset 2: banner — LinkedIn mockup in normal flow (not absolute), so the CTA never overlaps */}
            <div className="relative flex min-w-0 flex-col gap-3.5 md:gap-[18px]">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-baseline gap-2 md:gap-3">
                  <h2 className="font-display text-xl font-medium leading-none tracking-[-0.035em] md:text-[22px]">
                    LinkedIn banner
                  </h2>
                  <span className="text-xs text-[#8C897F] md:text-[13px]">3168 × 792 · 2×</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="flex h-10 items-center text-[13.5px] font-semibold text-[#3A2EFF] md:hidden"
                  >
                    ⤢ View larger
                  </button>
                  <ThemeToggle value={bannerTheme} onChange={setBannerTheme} labels ariaLabel="Banner theme" />
                </div>
              </div>

              <div className={`relative flex flex-col gap-6 ${bannerEnter ? "sfr-banner-in" : ""}`}>
                <BannerProfilePreview
                  profile={profile}
                  theme={bannerTheme}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  headline={headline}
                />
                {/* Live banner node for the download API; twins still do the PNG. Never shown. */}
                <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
                  <LinkedInBanner ref={bannerRef} profile={profile} theme={bannerTheme} animate={false} />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => void run("banner")}
                    disabled={busy === "banner"}
                    className="flex h-[52px] flex-none items-center justify-between gap-4 rounded-full bg-[#0B0B0C] pl-6 pr-1.5 text-base font-semibold text-white hover:bg-[#24232A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 disabled:opacity-70"
                  >
                    {label("banner", "Download banner")}
                    <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D7FF3A] text-[17px] text-[#0B0B0C]">
                      ↓
                    </span>
                  </button>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="hidden text-[13px] leading-[1.45] text-[#6F6D66] md:inline">
                      Upload it on LinkedIn: your profile → ✎ on the background photo.
                    </span>
                    {profile.tools.length > BANNER_MAX_TOOLS && (
                      <span className="text-[12.5px] leading-[1.4] text-[#8C897F]">
                        Showing {BANNER_MAX_TOOLS} of {profile.tools.length} tools on the banner
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <span className="sr-only" aria-live="polite">
            {flash === "copied" ? "Profile link copied" : flash ? "Downloaded" : ""}
          </span>
        </div>
      </div>

      <BannerViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        profile={profile}
        theme={bannerTheme}
        onDownload={() => void run("banner")}
        downloadLabel={label("banner", "Download banner")}
      />
    </div>
  );
}

function ThemeToggle({
  value,
  onChange,
  labels = false,
  ariaLabel,
}: {
  value: CardTheme;
  onChange: (t: CardTheme) => void;
  labels?: boolean;
  ariaLabel: string;
}) {
  return (
    <div className="flex h-9 gap-0.5 rounded-full bg-[#F4F3EF] p-1 md:h-10" role="radiogroup" aria-label={ariaLabel}>
      {(["dark", "light"] as const).map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={value === t}
          aria-label={t === "dark" ? "Dark" : "Light"}
          onClick={() => onChange(t)}
          className={`flex h-7 items-center justify-center gap-[7px] rounded-full text-[13px] font-semibold md:h-8 md:text-[13.5px] ${
            labels ? "px-3 md:px-3.5" : "w-7 md:w-8"
          } ${value === t ? "bg-white text-[#0B0B0C] shadow-[0_1px_2px_rgba(11,11,12,.12)]" : "text-[#6F6D66]"}`}
        >
          <span
            aria-hidden
            className={`rounded-full ${labels ? "h-2.5 w-2.5" : "h-3 w-3"} ${
              t === "dark" ? "bg-[#0B0B0C]" : "bg-white shadow-[inset_0_0_0_1.5px_#C9C6BE]"
            }`}
          />
          {labels && (t === "dark" ? "Dark" : "Light")}
        </button>
      ))}
    </div>
  );
}
