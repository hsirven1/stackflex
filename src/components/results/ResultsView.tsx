"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HomeLink } from "@/components/app/HomeLink";
import { BioPanel } from "@/components/preview/BioPanel";
import { Wordmark } from "@/components/stackflex/Brand";
import { focusRing, SecondaryButton } from "@/components/stackflex/Controls";
import { BannerArt } from "@/components/stackflex/ShareArt";
import { StackBoard } from "@/components/stackflex/StackBoard";
import { StartOver } from "@/components/stackflex/StartOver";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { copyText } from "@/lib/clipboard";
import { buildReadmeMarkdown } from "@/lib/selection/share";
import type { StackState } from "@/lib/selection/types";
import { cardColors, stackHeadline, stackTools, type Tool } from "@/lib/stackflex/tools";
import { artTheme, useArtExport, type AssetExporter } from "./artExport";
import { EditLoadoutDrawer } from "./EditLoadoutDrawer";
import { BannerPanel, StripPanel, type ArtExport } from "./FormatPanels";
import { GitHubReadmeCard } from "./GitHubReadmeCard";
import { ResumeSnippet } from "./ResumeSnippet";
import { ShareStackCard } from "./ShareStackCard";
import { SocialCardPanel } from "./SocialShare";

function useArt(stack: StackState, asset: "banner" | "xheader" | "strip" | "github", tools: Tool[], key: string): ArtExport {
  const theme = artTheme(stack, asset);
  return { ...useArtExport(asset, theme, key, tools.length), theme };
}

/** Your stack on the left, sharing on the right, every other format below. */
export function ResultsView({ stack }: { stack: StackState }) {
  const [editing, setEditing] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const tools = useMemo(() => stackTools(stack), [stack]);
  const key = JSON.stringify(tools);
  const banner = useArt(stack, "banner", tools, key);
  const xheader = useArt(stack, "xheader", tools, key);
  const strip = useArt(stack, "strip", tools, key);
  const github = useArt(stack, "github", tools, key);

  function openEditor(button: HTMLButtonElement) {
    opener.current = button;
    setEditing(true);
  }

  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex h-[88px] items-center justify-between px-5 md:px-10 xl:px-[120px]">
          <HomeLink className={`rounded-md ${focusRing}`}>
            <Wordmark />
          </HomeLink>
          <StartOver count={tools.length} label="Start over" className="text-[15px]" />
        </header>

        <div className="grid gap-12 px-5 pb-16 pt-4 md:px-10 lg:grid-cols-[480px_minmax(0,1fr)] lg:gap-[72px] xl:px-[120px]">
          <section aria-labelledby="stack-title" className="flex min-w-0 flex-col gap-7">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
              <h1
                id="stack-title"
                className="whitespace-nowrap font-display text-[40px] font-medium leading-none tracking-[-0.05em] md:text-5xl"
              >
                Your AI stack
              </h1>
              <div className="flex flex-none gap-1 whitespace-nowrap">
                <button
                  type="button"
                  onClick={(e) => openEditor(e.currentTarget)}
                  aria-label="Add tools"
                  className={`h-11 rounded-full px-3 text-[15px] font-medium text-sf-muted hover:text-sf-ink ${focusRing}`}
                >
                  + Add
                </button>
                <SecondaryButton size="sm" onClick={(e) => openEditor(e.currentTarget)}>
                  Edit stack
                </SecondaryButton>
              </div>
            </div>
            <StackBoard tools={tools} layout="square" gap={12} />
          </section>

          <section aria-labelledby="share-title" className="flex min-w-0 flex-col gap-5 pt-3">
            <div className="flex items-baseline justify-between">
              <h2 id="share-title" className="font-display text-[28px] font-medium tracking-[-0.035em]">
                Share it
              </h2>
              <a href="#all-formats" onClick={scrollToFormats} className={`rounded-sm text-[15px] font-medium text-sf-blue ${focusRing}`}>
                All formats →
              </a>
            </div>

            <SocialCardPanel stack={stack} tools={tools} />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DownloadTile label="LinkedIn banner" meta="1584 × 396" exporter={banner.exporter}>
                <BannerArt tools={tools} theme={banner.theme} className="w-full rounded-[7px] shadow-[0_10px_20px_-14px_rgba(11,11,12,.3)]" />
              </DownloadTile>
              <DownloadTile label="X header" meta="1500 × 500" exporter={xheader.exporter}>
                <BannerArt tools={tools} theme={xheader.theme} ratio="3 / 1" className="w-full rounded-[7px]" />
              </DownloadTile>
              <CopyTile label="GitHub README · badges" meta="Markdown, PNG" text={buildReadmeMarkdown(stack)} what="README Markdown">
                <div className="flex flex-wrap content-center gap-1">
                  {tools.map((t) => (
                    <span
                      key={t.id}
                      className="flex h-[22px] items-center gap-[5px] rounded-full bg-white pl-[3px] pr-2 text-[10.5px] font-semibold shadow-[0_0_0_1px_#ECEAE4]"
                    >
                      <span className="flex size-4 items-center justify-center rounded-full" style={{ background: cardColors(t.aura).tint }}>
                        <ToolLogo tool={t} size="9px" monogramSize="8px" />
                      </span>
                      {t.name}
                    </span>
                  ))}
                </div>
              </CopyTile>
              <CopyTile label="Headline, bio, resume" meta="Copy text" text={stackHeadline(tools)} what="Headline">
                <p className="text-[13px] leading-[1.45] text-sf-ver">{stackHeadline(tools)}</p>
              </CopyTile>
            </div>
          </section>
        </div>

        <section
          id="all-formats"
          aria-labelledby="all-formats-title"
          tabIndex={-1}
          className="flex scroll-mt-6 flex-col gap-5 px-5 pb-24 outline-none md:px-10 xl:px-[120px]"
        >
          <h2 id="all-formats-title" className="font-display text-[28px] font-medium tracking-[-0.035em]">
            All formats
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            <BannerPanel asset="banner" title="LinkedIn banner" tools={tools} art={banner} />
            <BannerPanel asset="xheader" title="X header" tools={tools} art={xheader} />
            <StripPanel tools={tools} art={strip} />
            <GitHubReadmeCard stack={stack} tools={tools} art={github} />
            <BioPanel stack={stack} />
            <ResumeSnippet stack={stack} />
            <ShareStackCard stack={stack} />
          </div>
        </section>
      </div>

      {editing && <EditLoadoutDrawer onClose={() => setEditing(false)} returnFocusTo={opener} />}
    </main>
  );
}

function scrollToFormats(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const target = document.getElementById("all-formats");
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

function Tile({
  label,
  meta,
  ariaLabel,
  onClick,
  children,
}: {
  label: string;
  meta: string;
  ariaLabel: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={`group flex flex-col gap-2.5 rounded-[18px] text-left ${focusRing}`}>
      <div className="flex min-h-24 w-full flex-1 items-center rounded-[18px] bg-sf-paper px-4 py-3.5 transition-colors group-hover:bg-sf-chip">
        {children}
      </div>
      <div className="flex w-full items-center justify-between gap-3">
        <span className="text-[15px] font-semibold">{label}</span>
        <span className="text-[13px] text-sf-muted">{meta}</span>
      </div>
    </button>
  );
}

function DownloadTile({ label, meta, exporter, children }: { label: string; meta: string; exporter: AssetExporter; children: ReactNode }) {
  const status = exporter.status;
  return (
    <>
      <Tile
        label={label}
        meta={status === "working" ? "Preparing…" : status === "done" ? "Downloaded ✓" : status === "error" ? "Couldn’t create image" : meta}
        ariaLabel={`Download ${label} PNG, ${meta}`}
        onClick={() => void exporter.download()}
      >
        {children}
      </Tile>
      <span className="sr-only" role="status">
        {status === "done" ? `Downloaded ${exporter.filename}` : ""}
      </span>
    </>
  );
}

function CopyTile({ label, meta, text, what, children }: { label: string; meta: string; text: string; what: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <Tile label={label} meta={copied ? "Copied ✓" : meta} ariaLabel={`Copy ${what}`} onClick={async () => setCopied(await copyText(text))}>
        {children}
      </Tile>
      <span className="sr-only" role="status">
        {copied ? `${what} copied to clipboard` : ""}
      </span>
    </>
  );
}
