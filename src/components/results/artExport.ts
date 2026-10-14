"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ART_BACKGROUND } from "@/components/stackflex/ShareArt";
import { renderPng, saveDataUrl } from "@/lib/export/download";
import { EXPORT_PRESETS } from "@/lib/export/presets";
import { track } from "@/lib/integrations/analytics";
import type { AssetId, StackState } from "@/lib/selection/types";

export type ArtTheme = "light" | "dark";

/** Fixed export sizes; badge strips are sized by their content. */
export const ART_SIZE = {
  square: { width: 1080, height: 1080 },
  banner: { width: 1584, height: 396 },
  xheader: { width: 1500, height: 500 },
} as const;

/**
 * Light or Dark for an asset. The X header defaults to dark as in the approved design; a stored
 * "mono" choice from the previous design falls back to light.
 */
export function artTheme(stack: StackState, asset: AssetId): ArtTheme {
  const chosen = stack.assetThemes?.[asset];
  if (chosen === "dark" || chosen === "light") return chosen;
  return asset === "xheader" ? "dark" : "light";
}

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
    const size = asset in ART_SIZE ? ART_SIZE[asset as keyof typeof ART_SIZE] : { width: node.offsetWidth, height: node.offsetHeight };
    return renderPng(node, {
      ...size,
      filename: preset.filename,
      backgroundColor: preset.transparent ? undefined : ART_BACKGROUND[theme],
    });
  }

  async function download() {
    setStatus("working");
    try {
      saveDataUrl(await render(), preset.filename);
      setStatus("done");
      track({ name: "export_downloaded", props: { format: asset, theme, badgeCount } });
      return true;
    } catch {
      setStatus("error");
      return false;
    }
  }

  const exporter: AssetExporter = { cacheKey: `${theme}|${cacheKey}`, filename: preset.filename, render, download, status };
  return { attach, exporter };
}
