import { getFontEmbedCSS, toPng } from "html-to-image";

/** Embedded font CSS per artwork node: it only includes the fonts that node uses. */
const fontEmbedCache = new WeakMap<HTMLElement, Promise<string>>();
/** Warm-up key: node + capture box. First capture of a key can be blank (fonts/images). */
const warmed = new WeakMap<HTMLElement, Set<string>>();

export interface PngExportOptions {
  width: number;
  height: number;
  filename: string;
  backgroundColor?: string;
  /**
   * Output pixels per CSS pixel of the *cloned* node.
   *
   * With html-to-image, values &gt; 1 usually upscale a foreignObject raster that
   * was painted at `width`×`height` — they do not re-layout HTML at higher density.
   * For a genuinely sharp 2× LinkedIn banner, lay the node out at 3168×792 CSS
   * pixels and capture with pixelRatio 1 instead.
   */
  pixelRatio?: number;
}

async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
}

function warmKey(options: PngExportOptions) {
  return `${options.width}x${options.height}@${options.pixelRatio ?? 1}`;
}

/**
 * Renders a fixed-size composition node to a PNG.
 * The node must already be the native artwork surface at `width`×`height` CSS px
 * (not a CSS-scaled LinkedIn mockup). Capture forces transform:none.
 */
export async function renderPng(node: HTMLElement, options: PngExportOptions): Promise<string> {
  await document.fonts.ready;
  await waitForImages(node);

  let fontEmbedCSS = fontEmbedCache.get(node);
  if (!fontEmbedCSS) {
    fontEmbedCSS = getFontEmbedCSS(node).catch(() => "");
    fontEmbedCache.set(node, fontEmbedCSS);
  }

  const pixelRatio = options.pixelRatio ?? 1;
  const settings = {
    width: options.width,
    height: options.height,
    canvasWidth: options.width,
    canvasHeight: options.height,
    pixelRatio,
    skipAutoScale: true,
    cacheBust: true,
    fontEmbedCSS: await fontEmbedCSS,
    backgroundColor: options.backgroundColor,
    style: {
      transform: "none",
      margin: "0",
      width: `${options.width}px`,
      height: `${options.height}px`,
      // Prefer crisp glyph edges in the foreignObject paint.
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      textRendering: "geometricPrecision",
    },
  };

  const key = warmKey(options);
  let keys = warmed.get(node);
  if (!keys) {
    keys = new Set();
    warmed.set(node, keys);
  }
  if (!keys.has(key)) {
    await toPng(node, settings).catch(() => "");
    keys.add(key);
  }
  return toPng(node, settings);
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

/** Decode a PNG data URL and report intrinsic pixel size + approximate byte length. */
export function inspectPngDataUrl(dataUrl: string): Promise<{
  width: number;
  height: number;
  bytes: number;
}> {
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const bytes = Math.floor((b64.length * 3) / 4) - (b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, bytes });
    img.onerror = () => reject(new Error("Could not decode PNG data URL"));
    img.src = dataUrl;
  });
}
