"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArtTheme } from "@/components/stackflex/Controls";
import { ART_BACKGROUND, ART_SIZE } from "@/components/stackflex/ShareArt";
import { renderPng, saveDataUrl } from "@/lib/export/download";
import { EXPORT_PRESETS } from "@/lib/export/presets";
import { track } from "@/lib/integrations/analytics";
import type { AssetId, StackState } from "@/lib/selection/types";

export type { ArtTheme };
export { ART_SIZE };

/** Light or Dark for an asset (light by default for new users). A stored Mono theme falls back to light. */
export function artTheme(stack: StackState, asset: AssetId): ArtTheme {
  const stored = stack.assetThemes?.[asset];
  return stored === "light" || stored === "dark" ? stored : "light";
}

/** The social card's file name carries its theme (stackflex-social-light.png); the others are fixed. */
export const exportFilename = (asset: AssetId, theme: ArtTheme) =>
  asset === "square" ? `stackflex-social-${theme}.png` : EXPORT_PRESETS[asset].filename;

/** An asset's export pipeline, shared by its preview and every button that renders or downloads it. */
export interface AssetExporter {
  /** Changes whenever the exported image would change. */
  cacheKey: string;
  filename: string;
  render: () => Promise<string>;
  download: () => Promise<boolean>;
  status: "idle" | "working" | "done" | "error";
}

/** Pass `attach` as the full-size artwork node's ref; the PNG is captured from that node. */
export function useArtExport(asset: AssetId, theme: ArtTheme, cacheKey: string, badgeCount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<AssetExporter["status"]>("idle");
  const preset = EXPORT_PRESETS[asset];
  const filename = exportFilename(asset, theme);
  const attach = useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    if (status !== "done") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function render() {
    const node = ref.current;
    if (!node) throw new Error("Preview not ready");
    const fixed = asset in ART_SIZE ? ART_SIZE[asset as keyof typeof ART_SIZE] : undefined;
    return renderPng(node, {
      ...(fixed ?? { width: node.offsetWidth, height: node.offsetHeight }),
      pixelRatio: fixed ? 1 : 2,
      filename,
      backgroundColor: preset.transparent ? undefined : ART_BACKGROUND[theme],
    });
  }

  async function download() {
    setStatus("working");
    try {
      saveDataUrl(await render(), filename);
      setStatus("done");
      track({ name: "export_downloaded", props: { format: asset, theme, badgeCount } });
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  const exporter: AssetExporter = { cacheKey: `${theme}|${cacheKey}`, filename, render, download, status };
  return { attach, exporter };
}
