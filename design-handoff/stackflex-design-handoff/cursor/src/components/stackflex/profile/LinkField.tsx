"use client";
import { useEffect, useRef, useState } from "react";

/** Middle-truncates the snapshot path for DISPLAY only, e.g. "/s/v2-nZHB…wNsv". The full URL is always copied. */
export function displayUrl(fullUrl: string) {
  try {
    const u = new URL(fullUrl);
    const parts = u.pathname.split("/");
    const slug = parts.pop() ?? "";
    const short = slug.length > 12 ? `${slug.slice(0, 7)}…${slug.slice(-4)}` : slug;
    return { host: u.host, path: [...parts, short].join("/") };
  } catch {
    return { host: fullUrl, path: "" };
  }
}

type Props = {
  url: string;                                  // the real public snapshot URL
  onCopy: (url: string) => Promise<void> | void; // your existing copy-to-clipboard (keep toasts/analytics)
  fullWidth?: boolean;                          // mobile
};

/** Read-only link field with "Copy link" inside (the only ink+lime control on the Results page). */
export function LinkField({ url, onCopy, fullWidth }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const { host, path } = displayUrl(url);
  const copy = async () => {
    await onCopy(url);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className={`flex h-[46px] min-w-0 items-center gap-2.5 rounded-[13px] bg-sf-paper pl-3.5 pr-[5px] shadow-[inset_0_0_0_1px_#E6E3DC] ${fullWidth ? "w-full" : "max-w-[420px] flex-1"}`}
      title={url}
    >
      <span className="flex min-w-0 flex-1 items-center overflow-hidden whitespace-nowrap text-sm">
        <span className="font-medium text-sf-ink">{host}</span>
        <span className="truncate text-sf-subtle">{path}</span>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className={`flex h-9 flex-none items-center gap-2 rounded-[9px] pl-[5px] pr-3.5 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2 ${copied ? "bg-sf-lime text-sf-ink" : "bg-sf-ink text-white"}`}
      >
        <span aria-hidden className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] ${copied ? "bg-sf-ink text-sf-lime" : "bg-sf-lime text-sf-ink"}`}>
          {copied ? "✓" : "⧉"}
        </span>
        {copied ? "Copied" : "Copy link"}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}

/** "Preview ↗": opens the public page in a new tab. */
export function PreviewButton({ url, fullWidth }: { url: string; fullWidth?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-[46px] flex-none items-center justify-center gap-[7px] rounded-[13px] bg-white px-[18px] text-sm font-semibold text-sf-ink shadow-[inset_0_0_0_1px_#D6D3CA] hover:shadow-[inset_0_0_0_1px_#A8A59C] ${fullWidth ? "w-full" : ""}`}
    >
      Preview <span aria-hidden className="text-[13px]">↗</span>
    </a>
  );
}

/** Results "Your page" title row: title + Public dot | LinkField + Preview. Stacks on mobile. */
export function YourPageHeader({ url, onCopy }: { url: string; onCopy: Props["onCopy"] }) {
  return (
    <div className="flex flex-col gap-3 lg:h-10 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
      <div className="flex flex-none items-baseline gap-3">
        <h2 className="whitespace-nowrap font-display text-2xl font-medium leading-none tracking-[-0.035em] lg:text-[26px]">Your page</h2>
        <span className="flex items-center gap-1.5 text-[12.5px] text-sf-body">
          <span className="h-[7px] w-[7px] rounded-full bg-[#3FB27F]" /> Public
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center lg:justify-end lg:gap-2.5">
        <LinkField url={url} onCopy={onCopy} />
        <PreviewButton url={url} />
      </div>
    </div>
  );
}
