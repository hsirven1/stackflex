"use client";
import { EXAMPLE_STACK, logoFor, stackHeadline, type Tool, cardColors } from "@/lib/stackflex/tools";
import { Wordmark } from "./Brand";
import { SecondaryButton, TextButton } from "./Controls";
import { StackBoard } from "./StackBoard";
import { BannerArt, SocialCardArt } from "./ShareArt";

type Props = {
  stack?: Tool[];
  onStartOver?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onAllFormats?: () => void;
  onShare?: (target: "linkedin" | "x") => void;
  onDownload?: (format: "social" | "linkedin-banner" | "x-header") => void;
  onCopy?: (format: "caption" | "readme" | "headline") => void;
  socialTheme?: "light" | "dark";
  onSocialThemeChange?: (t: "light" | "dark") => void;
};

export function ResultsScreen({
  stack = EXAMPLE_STACK,
  onStartOver,
  onAdd,
  onEdit,
  onAllFormats,
  onShare,
  onDownload,
  onCopy,
  socialTheme = "light",
  onSocialThemeChange,
}: Props) {
  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex h-[88px] items-center justify-between px-5 md:px-10 xl:px-[120px]">
          <Wordmark />
          <TextButton onClick={onStartOver} className="text-[15px]">Start over</TextButton>
        </header>

        <div className="grid gap-12 px-5 pb-16 pt-4 md:px-10 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-[72px] xl:px-[120px]">
          {/* Stack */}
          <section className="flex flex-col gap-7">
            <div className="flex items-end justify-between gap-4">
              <h1 className="whitespace-nowrap font-display text-[40px] font-medium leading-none tracking-[-0.05em] md:text-5xl">Your AI stack</h1>
              <div className="flex flex-none gap-1 whitespace-nowrap">
                <button type="button" onClick={onAdd} className="h-11 rounded-full px-3 text-[15px] font-medium text-sf-muted hover:text-sf-ink">+ Add</button>
                <SecondaryButton size="sm" onClick={onEdit}>Edit stack</SecondaryButton>
              </div>
            </div>
            <StackBoard tools={stack} layout="square" gap={12} />
          </section>

          {/* Share */}
          <section className="flex flex-col gap-5 pt-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[28px] font-medium tracking-[-0.035em]">Share it</h2>
              <button type="button" onClick={onAllFormats} className="text-[15px] font-medium text-sf-blue">All formats →</button>
            </div>

            <div className="flex flex-col items-start gap-7 rounded-3xl bg-sf-paper p-6 sm:flex-row sm:items-center">
              <SocialCardArt tools={stack} className="w-[232px] flex-none rounded-[14px] shadow-[0_20px_40px_-24px_rgba(11,11,12,.3)]" />
              <div className="flex flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-semibold tracking-[-0.015em]">Social card</span>
                  <span className="text-sm text-sf-muted">Square post for LinkedIn and X</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => onShare?.("linkedin")} className="h-10 rounded-full bg-[#0A66C2] px-[18px] text-sm font-semibold text-white">Post on LinkedIn</button>
                  <button type="button" onClick={() => onShare?.("x")} className="h-10 rounded-full bg-sf-ink px-[18px] text-sm font-semibold text-white">Post on X</button>
                </div>
                <div className="flex gap-[18px] text-sm font-medium">
                  <button type="button" onClick={() => onDownload?.("social")}>Download</button>
                  <button type="button" onClick={() => onCopy?.("caption")}>Copy caption</button>
                  <span className="text-sf-muted">
                    <button type="button" onClick={() => onSocialThemeChange?.("light")} className={socialTheme === "light" ? "text-sf-ink" : ""}>Light</button>
                    {" · "}
                    <button type="button" onClick={() => onSocialThemeChange?.("dark")} className={socialTheme === "dark" ? "text-sf-ink" : ""}>Dark</button>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Format label="LinkedIn banner" meta="1584 × 396" onClick={() => onDownload?.("linkedin-banner")}>
                <BannerArt tools={stack} className="w-full rounded-[7px] shadow-[0_10px_20px_-14px_rgba(11,11,12,.3)]" />
              </Format>
              <Format label="X header" meta="1500 × 500" onClick={() => onDownload?.("x-header")}>
                <BannerArt tools={stack} theme="dark" ratio="3 / 1" className="w-full rounded-[7px]" />
              </Format>
              <Format label="GitHub README · badges" meta="Markdown, SVG" onClick={() => onCopy?.("readme")}>
                <div className="flex flex-wrap content-center gap-1">
                  {stack.map((t) => (
                    <span key={t.id} className="flex h-[22px] items-center gap-[5px] rounded-full bg-white pl-[3px] pr-2 text-[10.5px] font-semibold shadow-[0_0_0_1px_#ECEAE4]">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: cardColors(t.aura).tint }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {logoFor(t) ? <img src={logoFor(t)} alt="" className="h-[9px] w-[9px]" /> : <span className="text-[8px]">{t.monogram}</span>}
                      </span>
                      {t.name}
                    </span>
                  ))}
                </div>
              </Format>
              <Format label="Headline, bio, resume" meta="Copy text" onClick={() => onCopy?.("headline")}>
                <p className="text-[13px] leading-[1.45] text-sf-ver">{stackHeadline(stack)}</p>
              </Format>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Format({ label, meta, onClick, children }: { label: string; meta: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col gap-2.5 text-left">
      <div className="flex min-h-24 w-full items-center rounded-[18px] bg-sf-paper px-4 py-3.5">{children}</div>
      <div className="flex w-full items-center justify-between">
        <span className="text-[15px] font-semibold">{label}</span>
        <span className="text-[13px] text-sf-muted">{meta}</span>
      </div>
    </button>
  );
}
