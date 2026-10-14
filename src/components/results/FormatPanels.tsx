"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScaledStage } from "@/components/renderer/ScaledStage";
import { BadgeStripArt } from "@/components/stackflex/BadgeStripArt";
import { BannerArt } from "@/components/stackflex/ShareArt";
import { setAssetTheme } from "@/lib/selection/store";
import type { Tool } from "@/lib/stackflex/tools";
import { ART_SIZE, type ArtTheme, type AssetExporter } from "./artExport";
import { DownloadButton, ExportError, Panel, ThemeToggle } from "./ResultsUI";

export interface ArtExport {
  attach: (node: HTMLDivElement | null) => void;
  exporter: AssetExporter;
  theme: ArtTheme;
}

/** LinkedIn banner or X header: the exact PNG, scaled down, with its theme and download. */
export function BannerPanel({
  asset,
  title,
  tools,
  art: { attach, exporter, theme },
}: {
  asset: "banner" | "xheader";
  title: string;
  tools: Tool[];
  art: ArtExport;
}) {
  const { width, height } = ART_SIZE[asset];
  return (
    <Panel
      id={`asset-${asset}`}
      title={title}
      meta={`${width} × ${height} · PNG`}
      actions={
        <>
          <ThemeToggle label={`${title} theme`} value={theme} onChange={(t) => setAssetTheme(asset, t)} />
          <DownloadButton exporter={exporter} ariaLabel={`Download ${title} PNG`} />
        </>
      }
    >
      <div className="overflow-hidden rounded-[7px] shadow-[0_14px_30px_-20px_rgba(11,11,12,.35)]">
        <ScaledStage width={width} height={height}>
          <div ref={attach} style={{ width }}>
            <BannerArt tools={tools} theme={theme} ratio={`${width} / ${height}`} />
          </div>
        </ScaledStage>
      </div>
      <ExportError exporter={exporter} />
    </Panel>
  );
}

/** Shows a content-sized node at its natural size, or scaled down to fit when it's wider. */
function FitStage({ children, dark }: { children: ReactNode; dark: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 0, height: 0 });

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) return;
    const measure = () => {
      const scale = Math.min(1, frame.clientWidth / Math.max(1, inner.offsetWidth));
      setBox({ scale, height: inner.offsetHeight * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`rounded-2xl px-4 py-5 ${dark ? "bg-sf-ink" : "bg-white"}`}>
      <div ref={frameRef} className="relative overflow-hidden" style={{ height: box.height }}>
        <div
          ref={innerRef}
          className="absolute left-0 top-0 w-max"
          style={{ transform: `scale(${box.scale})`, transformOrigin: "0 0", visibility: box.scale ? "visible" : "hidden" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** The transparent badge strip: its preview sits on a matching surface so both themes stay legible. */
export function BadgeStripPreview({ tools, art: { attach, theme } }: { tools: Tool[]; art: ArtExport }) {
  return (
    <FitStage dark={theme === "dark"}>
      <BadgeStripArt ref={attach} tools={tools} theme={theme} />
    </FitStage>
  );
}

export function StripPanel({ tools, art }: { tools: Tool[]; art: ArtExport }) {
  return (
    <Panel
      id="asset-strip"
      title="Website badges"
      meta="Transparent PNG"
      actions={
        <>
          <ThemeToggle label="Website badges theme" value={art.theme} onChange={(t) => setAssetTheme("strip", t)} />
          <DownloadButton exporter={art.exporter} ariaLabel="Download website badges PNG" />
        </>
      }
    >
      <BadgeStripPreview tools={tools} art={art} />
      <ExportError exporter={art.exporter} />
    </Panel>
  );
}
