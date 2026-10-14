import { getFontEmbedCSS, toPng } from "html-to-image";

let fontEmbedCache: Promise<string> | null = null;

export interface PngExportOptions {
  width: number;
  height: number;
  filename: string;
  backgroundColor?: string;
}

/**
 * Renders a fixed-size composition node to a PNG at exact pixel dimensions. The node may be
 * visually scaled by a parent in the preview; the capture uses the node's own layout size.
 */
export async function renderPng(node: HTMLElement, options: PngExportOptions): Promise<string> {
  await document.fonts.ready;
  fontEmbedCache ??= getFontEmbedCSS(node).catch(() => "");
  const fontEmbedCSS = await fontEmbedCache;
  return toPng(node, {
    width: options.width,
    height: options.height,
    canvasWidth: options.width,
    canvasHeight: options.height,
    pixelRatio: 1,
    skipAutoScale: true,
    fontEmbedCSS,
    backgroundColor: options.backgroundColor,
    style: { transform: "none", margin: "0" },
  });
}

/** Saves an already-rendered PNG synchronously, so it can run inside a click handler. */
export function saveDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadPng(node: HTMLElement, options: PngExportOptions) {
  saveDataUrl(await renderPng(node, options), options.filename);
}
