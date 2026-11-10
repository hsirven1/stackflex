"use client";

import { Download } from "lucide-react";
import { useEffect, useEffectEvent, useId, useState, type ReactNode } from "react";
import { ScaledStage } from "@/components/renderer/ScaledStage";
import { focusRing, Segmented, ThemeSwitch, type ArtTheme } from "@/components/stackflex/Controls";
import { BannerArt, SocialCardArt } from "@/components/stackflex/ShareArt";
import { LinkedInProfileMock, SocialPostMock, XProfileMock } from "@/components/stackflex/SocialMocks";
import { copyImageDataUrl, copyText } from "@/lib/clipboard";
import { saveDataUrl } from "@/lib/export/download";
import { track } from "@/lib/integrations/analytics";
import { buildBio } from "@/lib/selection/bio";
import { buildCopyStack } from "@/lib/selection/copyStack";
import {
  LINKEDIN_HEADLINE_LIMIT,
  buildLinkedInBio,
  defaultLinkedInStyle,
  linkedInHeadlineLength,
  type LinkedInFormat,
  type LinkedInVisualStyle,
} from "@/lib/selection/linkedinBio";
import { setLinkedInTitle, useLinkedInTitle } from "@/lib/selection/linkedinTitle";
import { linkedInOpenUrl, xOpenUrl } from "@/lib/selection/profileUrls";
import { useProfile } from "@/lib/profile/store";
import { buildLinkedInPost, buildXPost } from "@/lib/selection/share";
import { setAssetTheme } from "@/lib/selection/store";
import type { StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { ART_SIZE, artTheme, useArtExport } from "./artExport";
import { FeaturedToolsPicker } from "./FeaturedToolsPicker";
import type { ArtExport } from "./FormatPanels";

type ShareTab = "banner" | "post" | "bio";
type BannerPlatform = "linkedin" | "x";
type DownloadStage = "idle" | "preparing" | "started" | "error";

/** Full-size banner capture target — keeps attach/theme as plain props for the React Compiler. */
function BannerCaptureNode({
  width,
  height,
  tools,
  attach,
  theme,
}: {
  width: number;
  height: number;
  tools: Tool[];
  attach: ArtExport["attach"];
  theme: ArtTheme;
}) {
  return (
    <div ref={attach} style={{ width }}>
      <BannerArt tools={tools} theme={theme} ratio={`${width} / ${height}`} />
    </div>
  );
}

const TABS: { id: ShareTab; label: string; sub: string; icon: ReactNode }[] = [
  { id: "banner", label: "Banner", sub: "LinkedIn · X", icon: <BannerMini /> },
  { id: "post", label: "Post", sub: "Square image", icon: <PostMini /> },
  { id: "bio", label: "Bio", sub: "Headline · About", icon: <BioMini /> },
];

const PLATFORM_OPTIONS: { value: BannerPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
];

const BIO_FORMATS: { value: LinkedInFormat; label: string }[] = [
  { value: "headline", label: "Headline" },
  { value: "about", label: "About" },
];

const BIO_STYLES: { value: LinkedInVisualStyle; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "emojis", label: "With emojis" },
  { value: "bold", label: "Bold" },
];

/**
 * Results v3 right column: Banner · Post · Bio tabs with one live preview + controls.
 */
export function ShareElsewhere({
  stack,
  featured,
  linkedin,
  x,
}: {
  stack: StackState;
  featured: Tool[];
  linkedin: ArtExport;
  x: ArtExport;
}) {
  const [tab, setTab] = useState<ShareTab>("banner");
  const profile = useProfile();
  const headline = buildBio(stack, "linkedin");
  const name = profile.displayName.trim() || "Your name";
  const title = profile.professionalTitle.trim() || headline || "Your professional title";

  return (
    <section aria-labelledby="share-elsewhere-title" className="flex min-w-0 flex-col gap-4">
      <h2 id="share-elsewhere-title" className="font-display text-[26px] font-medium leading-none tracking-[-0.035em]">
        Share elsewhere
      </h2>

      <div role="tablist" aria-label="Share formats" className="grid grid-cols-3 gap-2">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex h-[60px] flex-col items-start justify-center gap-0.5 rounded-[14px] px-3 text-left transition-shadow lg:h-[60px] max-lg:h-[72px] max-lg:items-center max-lg:px-2 max-lg:text-center ${
                active
                  ? "bg-white shadow-[0_0_0_1.5px_#0B0B0C]"
                  : "bg-[#F6F5F1] hover:bg-[#F1EFEA]"
              } ${focusRing}`}
            >
              <span className="max-lg:mb-0.5">{t.icon}</span>
              <span className="text-[14px] font-semibold leading-none text-sf-ink">{t.label}</span>
              <span className="text-[11.5px] leading-none text-[#8C897F] max-lg:hidden">{t.sub}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="flex min-w-0 flex-col gap-3.5">
        {tab === "banner" && (
          <BannerPanel stack={stack} tools={featured} name={name} headline={title} linkedin={linkedin} x={x} />
        )}
        {tab === "post" && <PostPanel stack={stack} tools={featured} name={name} headline={title} />}
        {tab === "bio" && <BioPanel stack={stack} />}
      </div>
    </section>
  );
}

function BannerPanel({
  stack,
  tools,
  name,
  headline,
  linkedin,
  x,
}: {
  stack: StackState;
  tools: Tool[];
  name: string;
  headline: string;
  linkedin: ArtExport;
  x: ArtExport;
}) {
  const [platform, setPlatform] = useState<BannerPlatform>("linkedin");
  const [stage, setStage] = useState<DownloadStage>("idle");
  const [copyNotice, setCopyNotice] = useState("");
  const art = platform === "linkedin" ? linkedin : x;
  const asset = (platform === "linkedin" ? "banner" : "xheader") as "banner" | "xheader";
  const { width, height } = ART_SIZE[asset];
  const preparing = stage === "preparing";

  function setTheme(theme: ArtTheme) {
    setAssetTheme("banner", theme);
    setAssetTheme("xheader", theme);
    setStage("idle");
    setCopyNotice("");
  }

  async function downloadBanner() {
    if (preparing) return;
    setCopyNotice("");
    setStage("preparing");
    try {
      const ok = await art.exporter.download();
      setStage(ok ? "started" : "error");
    } catch {
      setStage("error");
    }
  }

  async function copyImage() {
    setCopyNotice("");
    try {
      const dataUrl = await art.exporter.render();
      if (await copyImageDataUrl(dataUrl)) {
        setCopyNotice("Image copied");
        return;
      }
      setCopyNotice("Copy isn’t supported — use Download.");
    } catch {
      setCopyNotice("Couldn’t create the image.");
    }
  }

  function openProfile() {
    window.open(platform === "linkedin" ? linkedInOpenUrl() : xOpenUrl(), "_blank", "noopener,noreferrer");
  }

  const linkedinAttach = linkedin.attach;
  const linkedinTheme = linkedin.theme;
  const xAttach = x.attach;
  const xTheme = x.theme;

  return (
    <>
      <div aria-hidden="true" className="w-full">
        {platform === "linkedin" ? (
          <LinkedInProfileMock name={name} headline={headline}>
            <ScaledStage width={width} height={height}>
              <BannerCaptureNode width={width} height={height} tools={tools} attach={linkedinAttach} theme={linkedinTheme} />
            </ScaledStage>
          </LinkedInProfileMock>
        ) : (
          <XProfileMock name={name} handle="@you">
            <ScaledStage width={width} height={height}>
              <BannerCaptureNode width={width} height={height} tools={tools} attach={xAttach} theme={xTheme} />
            </ScaledStage>
          </XProfileMock>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented label="Banner platform" value={platform} options={PLATFORM_OPTIONS} onChange={(p) => { setPlatform(p); setStage("idle"); setCopyNotice(""); }} />
        <ThemeSwitch label="Banner theme" value={art.theme} onChange={setTheme} />
      </div>

      <FeaturingRow stack={stack} />

      <ExportRow
        onCopy={() => void copyImage()}
        onDownload={() => void downloadBanner()}
        preparing={preparing}
        stage={stage}
        status={
          copyNotice ||
          (stage === "preparing"
            ? "Preparing your banner…"
            : stage === "started"
              ? "Download started"
              : stage === "error"
                ? "Couldn’t create the image. Try again."
                : "")
        }
        onOpenAfterDownload={openProfile}
        openLabel={platform === "linkedin" ? "Open LinkedIn ↗" : "Open X ↗"}
        onDownloadAgain={() => void downloadBanner()}
      />
    </>
  );
}

function PostPanel({
  stack,
  tools,
  name,
  headline,
}: {
  stack: StackState;
  tools: Tool[];
  name: string;
  headline: string;
}) {
  const theme = artTheme(stack, "square");
  const { attach, exporter } = useArtExport("square", theme, JSON.stringify(tools), tools.length);
  const [prepared, setPrepared] = useState<{ key: string; dataUrl: string } | null>(null);
  const [stage, setStage] = useState<DownloadStage>("idle");
  const [stageForKey, setStageForKey] = useState(exporter.cacheKey);
  const [copyNotice, setCopyNotice] = useState("");
  const ready = prepared?.key === exporter.cacheKey ? prepared : null;
  const caption = buildLinkedInPost(stack);
  const xText = buildXPost(stack);
  const preparing = stage === "preparing";
  const { width, height } = ART_SIZE.square;

  if (stageForKey !== exporter.cacheKey) {
    setStageForKey(exporter.cacheKey);
    setStage("idle");
    setCopyNotice("");
  }

  const prepare = useEffectEvent(async (key: string) => ({ key, dataUrl: await exporter.render() }));

  useEffect(() => {
    let cancelled = false;
    const key = exporter.cacheKey;
    const timer = setTimeout(() => {
      prepare(key).then(
        (next) => !cancelled && setPrepared(next),
        () => {},
      );
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [exporter.cacheKey]);

  async function ensureDataUrl() {
    if (ready) return ready.dataUrl;
    return exporter.render();
  }

  async function downloadPng() {
    if (preparing) return;
    setCopyNotice("");
    setStage("preparing");
    try {
      const dataUrl = await ensureDataUrl();
      saveDataUrl(dataUrl, exporter.filename);
      setPrepared({ key: exporter.cacheKey, dataUrl });
      setStage("started");
    } catch {
      setStage("error");
    }
  }

  async function copyImage() {
    setCopyNotice("");
    try {
      const dataUrl = await ensureDataUrl();
      if (await copyImageDataUrl(dataUrl)) {
        setCopyNotice("Image copied");
        return;
      }
      setCopyNotice("Copy isn’t supported — use Download.");
    } catch {
      setCopyNotice("Couldn’t create the image.");
    }
  }

  return (
    <>
      <div aria-hidden="true" className="mx-auto w-full max-w-[360px]">
        <SocialPostMock name={name} headline={headline} caption={caption.split("\n")[0]}>
          <ScaledStage width={width} height={height}>
            <div ref={attach} style={{ width }}>
              <SocialCardArt tools={tools} theme={theme} balanced />
            </div>
          </ScaledStage>
        </SocialPostMock>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <FeaturingRow stack={stack} />
        <ThemeSwitch
          label="Post theme"
          value={theme}
          onChange={(t) => {
            setAssetTheme("square", t);
            setStage("idle");
            setCopyNotice("");
          }}
        />
      </div>

      <ExportRow
        onCopy={() => void copyImage()}
        onDownload={() => void downloadPng()}
        preparing={preparing}
        stage={stage}
        status={
          copyNotice ||
          (stage === "preparing"
            ? "Preparing your image…"
            : stage === "started"
              ? "Download started"
              : stage === "error"
                ? "Couldn’t create the image. Try again."
                : "")
        }
        onOpenAfterDownload={() => window.open("https://www.linkedin.com/feed/", "_blank", "noopener,noreferrer")}
        openLabel="Open LinkedIn ↗"
        secondaryOpen={() =>
          window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(xText || "My AI stack")}`, "_blank", "noopener,noreferrer")
        }
        secondaryOpenLabel="Open X ↗"
        onDownloadAgain={() => void downloadPng()}
      />
    </>
  );
}

function BioPanel({ stack }: { stack: StackState }) {
  const [format, setFormat] = useState<LinkedInFormat>("about");
  const [style, setStyle] = useState<LinkedInVisualStyle>(() => defaultLinkedInStyle("about"));
  const professionalTitle = useLinkedInTitle();
  const [status, setStatus] = useState("");
  const [selectFallback, setSelectFallback] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const styleId = useId();

  function changeFormat(next: LinkedInFormat) {
    setFormat(next);
    setStyle(defaultLinkedInStyle(next));
  }

  const text = buildLinkedInBio(stack, format, style, professionalTitle);
  const stackText = buildCopyStack(stack);
  const isHeadline = format === "headline";
  const length = isHeadline ? linkedInHeadlineLength(text) : text.length;
  const limit = isHeadline ? LINKEDIN_HEADLINE_LIMIT : null;
  const styleLabel = BIO_STYLES.find((s) => s.value === style)?.label ?? "Style";

  async function copyLinkedIn() {
    setSelectFallback(false);
    if (!text) {
      setStatus("Add tools to your stack first.");
      return;
    }
    if (await copyText(text)) {
      setStatus("Copied for LinkedIn ✓");
      track({ name: "bio_copied", props: { platform: "linkedin" } });
      return;
    }
    setSelectFallback(true);
    setStatus("Clipboard blocked — select the text and copy manually.");
  }

  async function copyStack() {
    setSelectFallback(false);
    if (!stackText) {
      setStatus("Add tools first.");
      return;
    }
    if (await copyText(stackText)) {
      setStatus("Stack text copied ✓");
      track({ name: "bio_copied", props: { platform: "stack" } });
      return;
    }
    setSelectFallback(true);
    setStatus("Select text and copy manually.");
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented label="LinkedIn format" value={format} options={BIO_FORMATS} onChange={changeFormat} />
        <div className="relative">
          <button
            type="button"
            aria-expanded={styleOpen}
            aria-controls={styleId}
            onClick={() => setStyleOpen((o) => !o)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full bg-[#F1EFEA] px-3.5 text-[13px] font-semibold text-sf-ink ${focusRing}`}
          >
            Style: {styleLabel}
            <span aria-hidden="true" className="text-[10px] text-sf-muted">
              ▾
            </span>
          </button>
          {styleOpen && (
            <div
              id={styleId}
              role="listbox"
              aria-label="Bio style"
              className="absolute left-0 top-[calc(100%+6px)] z-20 min-w-[160px] rounded-[12px] border border-[#E3E0D8] bg-white p-1.5 shadow-[0_12px_28px_-18px_rgba(11,11,12,.45)]"
            >
              {BIO_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="option"
                  aria-selected={style === s.value}
                  onClick={() => {
                    setStyle(s.value);
                    setStyleOpen(false);
                  }}
                  className={`flex w-full rounded-[8px] px-2.5 py-1.5 text-left text-[13px] font-medium ${
                    style === s.value ? "bg-sf-ink text-white" : "text-sf-ink hover:bg-[#F3F1EB]"
                  } ${focusRing}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <label className="block">
        <span className="sr-only">Professional title</span>
        <input
          type="text"
          value={professionalTitle}
          onChange={(e) => setLinkedInTitle(e.target.value)}
          placeholder="e.g. Product Designer at Northbeam"
          maxLength={80}
          className={`h-11 w-full rounded-[12px] border-0 bg-[#F6F5F1] px-3.5 text-[14px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
        />
      </label>

      <div className="relative overflow-hidden rounded-[14px] border border-[#ECEAE4] bg-white p-4 shadow-[0_1px_2px_rgba(11,11,12,.04)]">
        <span aria-hidden="true" className="absolute right-3 top-3 text-[11px] font-bold tracking-wide text-[#0A66C2]">
          in
        </span>
        <div className="flex items-baseline justify-between gap-3 pr-6">
          <p className="text-[12px] font-semibold text-sf-ink">{isHeadline ? "Headline" : "About"}</p>
          {limit !== null && (
            <span className={`text-[11px] font-medium tabular-nums ${length > limit ? "text-red-700" : "text-sf-subtle"}`}>
              {length}/{limit}
            </span>
          )}
        </div>
        <pre
          tabIndex={0}
          className={`mt-2 max-h-[220px] overflow-auto whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-sf-ver ${
            selectFallback ? "rounded-md ring-2 ring-sf-blue" : ""
          }`}
        >
          {text || "Add tools to your stack to generate LinkedIn text."}
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => void copyLinkedIn()}
          disabled={!text}
          className={`inline-flex h-11 w-full items-center justify-center rounded-full bg-sf-ink text-[14px] font-semibold text-white disabled:opacity-40 ${focusRing}`}
        >
          Copy for LinkedIn
        </button>
        <button
          type="button"
          onClick={() => void copyStack()}
          disabled={!stackText}
          className={`text-[13px] font-semibold text-sf-blue hover:underline disabled:opacity-40 ${focusRing} rounded-sm self-center`}
        >
          Copy plain stack text
        </button>
        <p role="status" className="min-h-[1rem] text-center text-[12.5px] font-medium text-sf-body empty:hidden">
          {status}
        </p>
      </div>
    </>
  );
}

function FeaturingRow({ stack }: { stack: StackState }) {
  return <FeaturedToolsPicker stack={stack} />;
}

function ExportRow({
  onCopy,
  onDownload,
  preparing,
  stage,
  status,
  onOpenAfterDownload,
  openLabel,
  secondaryOpen,
  secondaryOpenLabel,
  onDownloadAgain,
}: {
  onCopy: () => void;
  onDownload: () => void;
  preparing: boolean;
  stage: DownloadStage;
  status: string;
  onOpenAfterDownload: () => void;
  openLabel: string;
  secondaryOpen?: () => void;
  secondaryOpenLabel?: string;
  onDownloadAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {(stage === "idle" || stage === "error" || stage === "preparing") && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 max-lg:grid max-lg:grid-cols-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={preparing}
            className={`inline-flex h-10 items-center justify-center rounded-full px-3.5 text-[13.5px] font-semibold text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink disabled:opacity-40 max-lg:h-12 max-lg:bg-[#F1EFEA] max-lg:text-sf-ink ${focusRing}`}
          >
            Copy image
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={preparing}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-full bg-sf-ink px-4 text-[13.5px] font-semibold text-white disabled:opacity-40 max-lg:h-12 ${focusRing}`}
          >
            <Download aria-hidden="true" className="size-3.5 opacity-90" strokeWidth={2.2} />
            {preparing ? "Preparing…" : stage === "error" ? "Try again" : "Download"}
          </button>
        </div>
      )}
      {stage === "started" && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onOpenAfterDownload}
            className={`inline-flex h-10 items-center rounded-full bg-[#F1EFEA] px-3.5 text-[13.5px] font-semibold text-sf-ink ${focusRing}`}
          >
            {openLabel}
          </button>
          {secondaryOpen && secondaryOpenLabel && (
            <button
              type="button"
              onClick={secondaryOpen}
              className={`inline-flex h-10 items-center rounded-full bg-[#F1EFEA] px-3.5 text-[13.5px] font-semibold text-sf-ink ${focusRing}`}
            >
              {secondaryOpenLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onDownloadAgain}
            className={`text-[13px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing} rounded-sm`}
          >
            Download again
          </button>
          <button
            type="button"
            onClick={onCopy}
            className={`text-[13px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing} rounded-sm`}
          >
            Copy image
          </button>
        </div>
      )}
      <p role="status" className="text-right text-[12.5px] font-medium text-sf-body empty:hidden">
        {status}
      </p>
    </div>
  );
}

function BannerMini() {
  return (
    <span aria-hidden="true" className="relative mb-0.5 block h-3.5 w-9 overflow-hidden rounded-[3px] bg-[#E8E4F8] max-lg:mx-auto">
      <span className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#C9B8FF] to-[#FFC9A8]" />
      <span className="absolute -bottom-0.5 left-1 size-2 rounded-full border border-white bg-[#D7D2EC]" />
    </span>
  );
}

function PostMini() {
  return (
    <span
      aria-hidden="true"
      className="mb-0.5 block size-3.5 rounded-[3px] bg-gradient-to-br from-[#E8E4F8] to-[#FFE8DC] shadow-[0_0_0_1px_#ECEAE4] max-lg:mx-auto"
    />
  );
}

function BioMini() {
  return (
    <span aria-hidden="true" className="mb-0.5 flex w-8 flex-col gap-0.5 max-lg:mx-auto">
      <span className="h-0.5 w-full rounded-full bg-[#CFCBC1]" />
      <span className="h-0.5 w-[85%] rounded-full bg-[#CFCBC1]" />
      <span className="h-0.5 w-[70%] rounded-full bg-[#CFCBC1]" />
    </span>
  );
}
