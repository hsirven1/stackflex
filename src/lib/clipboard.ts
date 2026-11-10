/** PNG data URL → Blob for clipboard / Web Share. */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** Copy a PNG (from a data URL) to the clipboard when the browser supports image ClipboardItems. */
export async function copyImageDataUrl(dataUrl: string): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") return false;
    const blob = await dataUrlToBlob(dataUrl);
    const png = blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" });
    await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
    return true;
  } catch {
    return false;
  }
}

/** True when this browser can share image files via the Web Share API. */
export function canShareImageFile(file: File): boolean {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/** Share a PNG data URL via the system share sheet when files are supported. */
export async function shareImageDataUrl(dataUrl: string, filename: string, title = "My AI stack"): Promise<"shared" | "unsupported" | "aborted" | "error"> {
  try {
    if (typeof navigator.share !== "function") return "unsupported";
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: "image/png" });
    if (!canShareImageFile(file)) return "unsupported";
    await navigator.share({ files: [file], title, text: title });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "aborted";
    return "error";
  }
}

/**
 * Synchronous copy through a hidden textarea. Unlike the async Clipboard API it completes inside
 * the click, before anything (like opening a new tab) can take focus away from the page.
 */
export function copyTextSync(text: string): boolean {
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus({ preventScroll: true });
  return ok;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyTextSync(text);
  }
}
