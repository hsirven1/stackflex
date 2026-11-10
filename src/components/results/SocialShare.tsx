"use client";

import { Download } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";
import { ScaledStage } from "@/components/renderer/ScaledStage";
import { LinkedInIcon, ThemeSwitch, XIcon } from "@/components/stackflex/Controls";
import { SocialCardArt } from "@/components/stackflex/ShareArt";
import { SocialPostMock } from "@/components/stackflex/SocialMocks";
import { copyImageDataUrl } from "@/lib/clipboard";
import { saveDataUrl } from "@/lib/export/download";
import { buildLinkedInPost, buildXPost } from "@/lib/selection/share";
import { setAssetTheme } from "@/lib/selection/store";
import type { StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { ART_SIZE, artTheme, useArtExport } from "./artExport";
import { FeaturedToolsPicker } from "./FeaturedToolsPicker";
import { ActionButton, ActionStage, FormatModule, GhostButton, ShareActions, UtilityButton } from "./ResultsUI";

/** LinkedIn feed is where users start a post; saved profile URL used when present. */
const LINKEDIN_POST_URL = "https://www.linkedin.com/feed/";

type DownloadStage = "idle" | "preparing" | "started" | "error";

interface Prepared {
  key: string;
  dataUrl: string;
}

function openTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function ensureDataUrl(ready: Prepared | null, exporter: ReturnType<typeof useArtExport>["exporter"]) {
  if (ready) return ready.dataUrl;
  return exporter.render();
}

/**
 * Social post: compact left-column preview with a two-step download → choose LinkedIn / X flow.
 * Platforms open only after an explicit click once download has started.
 */
export function SocialCardSection({ stack, tools, headline }: { stack: StackState; tools: Tool[]; headline: string }) {
  const theme = artTheme(stack, "square");
  const { attach, exporter } = useArtExport("square", theme, JSON.stringify(tools), tools.length);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [stage, setStage] = useState<DownloadStage>("idle");
  const [stageForKey, setStageForKey] = useState(exporter.cacheKey);
  const [copyNotice, setCopyNotice] = useState("");
  const [canCopyImage] = useState(
    () => typeof navigator !== "undefined" && !!navigator.clipboard && typeof ClipboardItem !== "undefined",
  );
  const ready = prepared?.key === exporter.cacheKey ? prepared : null;
  const caption = buildLinkedInPost(stack);
  const xText = buildXPost(stack);

  // Theme / stack changes invalidate a prior “download started” step for a different asset.
  if (stageForKey !== exporter.cacheKey) {
    setStageForKey(exporter.cacheKey);
    setStage("idle");
    setCopyNotice("");
  }

  const preparing = stage === "preparing";

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

  async function downloadPng() {
    if (preparing) return;
    setCopyNotice("");
    setStage("preparing");
    try {
      const dataUrl = await ensureDataUrl(ready, exporter);
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
      const dataUrl = await ensureDataUrl(ready, exporter);
      if (await copyImageDataUrl(dataUrl)) {
        setCopyNotice("Image copied");
        return;
      }
      setCopyNotice("Copy isn’t supported — use Download.");
    } catch {
      setCopyNotice("Couldn’t create the image.");
    }
  }

  function openLinkedIn() {
    openTab(LINKEDIN_POST_URL);
  }

  function openX() {
    openTab(`https://x.com/intent/tweet?text=${encodeURIComponent(xText || "My AI stack")}`);
  }

  const status =
    copyNotice ||
    (stage === "preparing"
      ? "Preparing your image…"
      : stage === "started"
        ? "Download started"
        : stage === "error"
          ? "Couldn’t create the image. Try again."
          : "");

  return (
    <FormatModule
      id="format-social"
      title="Social Post"
      layout="below"
      compact
      controls={
        <ThemeSwitch
          label="Social post theme"
          value={theme}
          onChange={(t) => {
            setAssetTheme("square", t);
            setStage("idle");
            setCopyNotice("");
          }}
        />
      }
      preview={
        <div aria-hidden="true" className="w-full max-w-[min(100%,300px)]">
          <SocialPostMock compact name="Your name" headline={headline} caption={caption.split("\n")[0]}>
            <ScaledStage width={ART_SIZE.square.width} height={ART_SIZE.square.height}>
              <div ref={attach} style={{ width: ART_SIZE.square.width }}>
                <SocialCardArt tools={tools} theme={theme} balanced />
              </div>
            </ScaledStage>
          </SocialPostMock>
        </div>
      }
      actions={
        <ActionStage>
          <FeaturedToolsPicker stack={stack} />
          {(stage === "idle" || stage === "error") && (
            <ShareActions inline status={status}>
              <UtilityButton
                icon={<Download aria-hidden="true" className="size-3.5 opacity-90" strokeWidth={2.2} />}
                onClick={() => void downloadPng()}
                disabled={preparing}
              >
                {stage === "error" ? "Try again" : "Download PNG"}
              </UtilityButton>
              {canCopyImage && (
                <ActionButton onClick={() => void copyImage()} disabled={preparing}>
                  Copy image
                </ActionButton>
              )}
            </ShareActions>
          )}
          {stage === "preparing" && (
            <ShareActions inline status={status}>
              <UtilityButton disabled>Preparing…</UtilityButton>
            </ShareActions>
          )}
          {stage === "started" && (
            <ShareActions inline status={status}>
              <ActionButton icon={<LinkedInIcon size={14} />} onClick={openLinkedIn}>
                Open LinkedIn
              </ActionButton>
              <ActionButton icon={<XIcon size={14} />} onClick={openX}>
                Open X
              </ActionButton>
              <GhostButton onClick={() => void downloadPng()}>Download again</GhostButton>
              {canCopyImage && <GhostButton onClick={() => void copyImage()}>Copy image</GhostButton>}
            </ShareActions>
          )}
        </ActionStage>
      }
    />
  );
}
