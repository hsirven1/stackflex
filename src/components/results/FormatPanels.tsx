"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { ScaledStage } from "@/components/renderer/ScaledStage";
import { Segmented, ThemeSwitch, type ArtTheme } from "@/components/stackflex/Controls";
import { BannerArt } from "@/components/stackflex/ShareArt";
import { LinkedInProfileMock, XProfileMock } from "@/components/stackflex/SocialMocks";
import { linkedInOpenUrl, xOpenUrl } from "@/lib/selection/profileUrls";
import { setAssetTheme } from "@/lib/selection/store";
import type { AssetId, StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { ART_SIZE, type AssetExporter } from "./artExport";
import { FeaturedToolsPicker } from "./FeaturedToolsPicker";
import { ActionButton, ActionStage, FormatModule, GhostButton, ShareActions, UtilityButton } from "./ResultsUI";

export interface ArtExport {
  attach: (node: HTMLDivElement | null) => void;
  exporter: AssetExporter;
  theme: ArtTheme;
}

type BannerPlatform = "linkedin" | "x";
type DownloadStage = "idle" | "preparing" | "started" | "error";

const PLATFORM: Record<BannerPlatform, { asset: AssetId; name: string; mock: "linkedin" | "x" }> = {
  linkedin: { asset: "banner", name: "LinkedIn", mock: "linkedin" },
  x: { asset: "xheader", name: "X", mock: "x" },
};

const PLATFORM_OPTIONS: { value: BannerPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
];

/** Full-size banner artwork at the platform's export size (the PNG capture target). */
function BannerNode({
  asset,
  tools,
  attach,
  theme,
}: {
  asset: "banner" | "xheader";
  tools: Tool[];
  attach: ArtExport["attach"];
  theme: ArtTheme;
}) {
  const { width, height } = ART_SIZE[asset];
  return (
    <div ref={attach} style={{ width }}>
      <BannerArt tools={tools} theme={theme} ratio={`${width} / ${height}`} />
    </div>
  );
}

function openProfile(platform: BannerPlatform) {
  const url = platform === "linkedin" ? linkedInOpenUrl() : xOpenUrl();
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Compact Profile Banner for the narrower (~40%) Results column.
 * Preview scales with column width; export dimensions stay native.
 * Two-step download → open-profile; never auto-opens a tab.
 */
export function ProfileBannerSection({
  stack,
  tools,
  headline,
  linkedin,
  x,
}: {
  stack: StackState;
  tools: Tool[];
  headline?: string;
  linkedin: ArtExport;
  x: ArtExport;
}) {
  const [platform, setPlatform] = useState<BannerPlatform>("linkedin");
  const [stage, setStage] = useState<DownloadStage>("idle");
  const active = PLATFORM[platform];
  const art = platform === "linkedin" ? linkedin : x;
  const asset = active.asset as "banner" | "xheader";
  const { width, height } = ART_SIZE[asset];
  const preparing = stage === "preparing";

  function setTheme(theme: ArtTheme) {
    setAssetTheme("banner", theme);
    setAssetTheme("xheader", theme);
    setStage("idle");
  }

  function switchPlatform(next: BannerPlatform) {
    setPlatform(next);
    setStage("idle");
  }

  async function downloadBanner() {
    if (preparing) return;
    setStage("preparing");
    try {
      const ok = await art.exporter.download();
      setStage(ok ? "started" : "error");
    } catch {
      setStage("error");
    }
  }

  const downloadLabel = platform === "linkedin" ? "Download banner" : "Download X banner";
  const openLabel = platform === "linkedin" ? "Open LinkedIn" : "Open X";

  return (
    <FormatModule
      id="format-profile-banner"
      title="Profile Banner"
      layout="below"
      compact
      controls={
        <>
          <Segmented label="Banner platform" value={platform} options={PLATFORM_OPTIONS} onChange={switchPlatform} />
          <ThemeSwitch label="Profile banner theme" value={art.theme} onChange={setTheme} />
        </>
      }
      preview={
        <div aria-hidden="true" className="mx-auto w-full max-w-full">
          {active.mock === "linkedin" ? (
            <LinkedInProfileMock compact name="Your name" headline={headline}>
              <ScaledStage width={width} height={height}>
                <BannerNode asset="banner" tools={tools} attach={linkedin.attach} theme={linkedin.theme} />
              </ScaledStage>
            </LinkedInProfileMock>
          ) : (
            <XProfileMock name="Your name" handle="@yourhandle">
              <ScaledStage width={width} height={height}>
                <BannerNode asset="xheader" tools={tools} attach={x.attach} theme={x.theme} />
              </ScaledStage>
            </XProfileMock>
          )}
        </div>
      }
      actions={
        <ActionStage>
          <FeaturedToolsPicker stack={stack} />
          {stage === "idle" && (
            <ShareActions inline>
              <UtilityButton
                icon={<Download aria-hidden="true" className="size-3.5 opacity-90" strokeWidth={2.2} />}
                onClick={() => void downloadBanner()}
              >
                {downloadLabel}
              </UtilityButton>
            </ShareActions>
          )}
          {stage === "preparing" && (
            <ShareActions inline status="Preparing your banner…">
              <UtilityButton disabled>Preparing…</UtilityButton>
            </ShareActions>
          )}
          {stage === "started" && (
            <ShareActions inline status="Download started">
              <ActionButton onClick={() => openProfile(platform)}>
                {openLabel} ↗
              </ActionButton>
              <GhostButton onClick={() => void downloadBanner()}>Download again</GhostButton>
            </ShareActions>
          )}
          {stage === "error" && (
            <ShareActions inline status="Couldn’t create the image. Try again.">
              <UtilityButton
                icon={<Download aria-hidden="true" className="size-3.5 opacity-90" strokeWidth={2.2} />}
                onClick={() => void downloadBanner()}
              >
                Try again
              </UtilityButton>
            </ShareActions>
          )}
        </ActionStage>
      }
    />
  );
}
