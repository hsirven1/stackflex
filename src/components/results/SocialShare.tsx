"use client";

import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { copyText, copyTextSync } from "@/lib/clipboard";
import { ScaledStage } from "@/components/renderer/ScaledStage";
import { focusRing } from "@/components/stackflex/Controls";
import { SocialCardArt } from "@/components/stackflex/ShareArt";
import { saveDataUrl } from "@/lib/export/download";
import { buildLinkedInPost, buildXPost } from "@/lib/selection/share";
import { setAssetTheme } from "@/lib/selection/store";
import type { StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { ART_SIZE, artTheme, useArtExport } from "./artExport";
import { ThemeToggle } from "./ResultsUI";

/** LinkedIn has no supported composer URL for local images; the feed is where "Start a post" lives. */
const LINKEDIN_URL = "https://www.linkedin.com/feed/";
const SHARE_TITLE = "My AI Stack";

let fileShareSupport: boolean | undefined;
/** Whether this browser can hand a PNG file to the native share sheet. */
function supportsFileShare(): boolean {
  if (fileShareSupport === undefined) {
    try {
      const probe = new File([new Uint8Array(1)], "probe.png", { type: "image/png" });
      fileShareSupport = typeof navigator.share === "function" && navigator.canShare?.({ files: [probe] }) === true;
    } catch {
      fileShareSupport = false;
    }
  }
  return fileShareSupport;
}
const subscribeNever = () => () => {};

interface Prepared {
  key: string;
  dataUrl: string;
  file: File;
}

function openTab(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

const LINK = `rounded-sm hover:text-sf-blue disabled:cursor-wait disabled:opacity-50 ${focusRing}`;

/**
 * The Social card panel: preview (exactly the exported 1080×1080 PNG) and its sharing actions.
 * The PNG is rendered ahead of time whenever the card changes, so every button can use it
 * synchronously: Web Share and popups need the click's user activation, which a render started
 * after the click could outlive.
 */
export function SocialCardPanel({ stack, tools }: { stack: StackState; tools: Tool[] }) {
  const theme = artTheme(stack, "square");
  const { attach, exporter } = useArtExport("square", theme, JSON.stringify(tools), tools.length);
  const canShareFiles = useSyncExternalStore(subscribeNever, supportsFileShare, () => false);
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [notice, setNotice] = useState("");
  const ready = prepared?.key === exporter.cacheKey ? prepared : null;
  const caption = buildLinkedInPost(stack);
  const xText = buildXPost(stack);

  const prepare = useEffectEvent(async (key: string) => {
    const dataUrl = await exporter.render();
    const blob = await (await fetch(dataUrl)).blob();
    return { key, dataUrl, file: new File([blob], exporter.filename, { type: "image/png" }) };
  });

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

  /** Saves the prepared PNG now, or renders it first when it isn't ready yet. */
  function saveImage() {
    if (ready) {
      saveDataUrl(ready.dataUrl, exporter.filename);
      return;
    }
    void exporter.download();
  }

  function shareLinkedIn() {
    const copied = copyTextSync(caption);
    saveImage();
    openTab(LINKEDIN_URL);
    setNotice(
      copied
        ? "Image downloaded and caption copied. Start a post on LinkedIn, paste the caption and attach the image."
        : "Image downloaded. Use Copy caption, then attach the image to your LinkedIn post.",
    );
  }

  function shareX() {
    saveImage();
    openTab(`https://x.com/intent/tweet?text=${encodeURIComponent(xText)}`);
    setNotice("Post text is filled in on X. Image downloaded: attach it to your post.");
  }

  async function shareDevice() {
    if (!ready) return;
    const withText = { files: [ready.file], title: SHARE_TITLE, text: caption };
    const data = navigator.canShare?.(withText) ? withText : { files: [ready.file], title: SHARE_TITLE };
    try {
      await navigator.share(data);
      setNotice("Sent to the app you picked. Finish your post there.");
    } catch (error) {
      setNotice(
        error instanceof DOMException && error.name === "AbortError"
          ? "Sharing cancelled."
          : "Couldn’t share the image from this browser. Use Download instead.",
      );
    }
  }

  async function download() {
    if (ready) {
      saveDataUrl(ready.dataUrl, exporter.filename);
      setNotice("Image downloaded.");
    } else if (await exporter.download()) {
      setNotice("Image downloaded.");
    } else {
      setNotice("The image couldn’t be created. Try again, or use a different browser.");
    }
  }

  const pill = `h-10 rounded-full px-[18px] text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`;

  return (
    <section
      aria-labelledby="social-card-title"
      className="flex flex-col items-start gap-7 rounded-3xl bg-sf-paper p-6 sm:flex-row sm:items-center"
    >
      <div className="w-full max-w-[232px] flex-none overflow-hidden rounded-[14px] shadow-[0_20px_40px_-24px_rgba(11,11,12,.3)]">
        <ScaledStage width={ART_SIZE.square.width} height={ART_SIZE.square.height}>
          <div ref={attach} style={{ width: ART_SIZE.square.width }}>
            <SocialCardArt tools={tools} theme={theme} />
          </div>
        </ScaledStage>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 id="social-card-title" className="text-xl font-semibold tracking-[-0.015em]">
            Social card
          </h3>
          <span className="text-sm text-sf-muted">Square post for LinkedIn and X</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={shareLinkedIn} disabled={!caption} className={`bg-sf-linkedin hover:bg-sf-linkedin/90 ${pill}`}>
            Post on LinkedIn
          </button>
          <button type="button" onClick={shareX} disabled={!xText} className={`bg-sf-ink hover:bg-sf-ink/85 ${pill}`}>
            Post on X
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 text-sm font-medium">
          <button type="button" onClick={download} disabled={exporter.status === "working"} aria-label="Download social card PNG" className={LINK}>
            Download
          </button>
          <button
            type="button"
            disabled={!caption}
            onClick={async () => setNotice((await copyText(caption)) ? "Caption copied." : "Couldn’t copy the caption.")}
            className={LINK}
          >
            Copy caption
          </button>
          {canShareFiles && (
            <button type="button" onClick={shareDevice} disabled={!ready} className={LINK}>
              Share via device
            </button>
          )}
          <ThemeToggle label="Social card theme" value={theme} onChange={(t) => setAssetTheme("square", t)} />
        </div>
        <p role="status" className="min-h-4 text-[13px] leading-snug text-sf-muted">
          {notice}
        </p>
      </div>
    </section>
  );
}
