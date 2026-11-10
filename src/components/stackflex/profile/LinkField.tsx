"use client";

import { useEffect, useRef, useState } from "react";

/** Middle-truncates the snapshot path for display only. Full URL is always copied. */
export function displayUrl(fullUrl: string) {
  try {
    const u = new URL(fullUrl);
    const parts = u.pathname.split("/");
    const slug = parts.pop() ?? "";
    const short = slug.length > 12 ? `${slug.slice(0, 7)}…${slug.slice(-4)}` : slug;
    return { host: u.host.replace(/^www\./, ""), path: [...parts, short].join("/") };
  } catch {
    return { host: fullUrl, path: "" };
  }
}

type LinkFieldProps = {
  url: string;
  onCopy: (url: string) => Promise<void> | void;
  fullWidth?: boolean;
  disabled?: boolean;
};

/** Read-only link field with Copy link (ink + lime). Displays stackflex.app host for public URLs. */
export function LinkField({ url, onCopy, fullWidth, disabled }: LinkFieldProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const display = url
    ? (() => {
        try {
          const u = new URL(url);
          const isLocal = /^(localhost|127\.0\.0\.1)$/i.test(u.hostname);
          const { path } = displayUrl(url);
          return { host: isLocal ? u.host : "stackflex.app", path };
        } catch {
          return displayUrl(url);
        }
      })()
    : { host: "stackflex.app", path: "/s/…" };

  const copy = async () => {
    if (!url || disabled) return;
    await onCopy(url);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex h-[46px] min-w-0 items-center gap-2.5 rounded-[13px] bg-[#FAF9F6] pr-[5px] pl-3.5 shadow-[inset_0_0_0_1px_#E6E3DC] ${fullWidth ? "w-full" : "max-w-[420px] flex-1"}`}
      title={url || undefined}
    >
      <span className="flex min-w-0 flex-1 items-center overflow-hidden text-nowrap text-sm">
        <span className="font-medium text-sf-ink">{display.host}</span>
        <span className="truncate text-sf-subtle">{display.path}</span>
      </span>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={disabled || !url}
        aria-label="Copy link"
        className={`flex h-9 flex-none items-center gap-2 rounded-[9px] pr-3.5 pl-[5px] text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2 disabled:opacity-40 ${
          copied ? "bg-sf-lime text-sf-ink" : "bg-sf-ink text-white"
        }`}
      >
        <span
          aria-hidden
          className={`flex size-[26px] items-center justify-center rounded-full text-[13px] ${
            copied ? "bg-sf-ink text-sf-lime" : "bg-sf-lime text-sf-ink"
          }`}
        >
          {copied ? "✓" : "⧉"}
        </span>
        {copied ? "Copied" : "Copy link"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

/** Opens the public page in a new tab. */
export function PreviewButton({
  url,
  fullWidth,
  disabled,
  onClick,
}: {
  url: string;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (onClick || disabled || !url) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !url}
        className={`flex h-[46px] flex-none items-center justify-center gap-[7px] rounded-[13px] bg-white px-[18px] text-sm font-semibold text-sf-ink shadow-[inset_0_0_0_1px_#D6D3CA] hover:shadow-[inset_0_0_0_1px_#A8A59C] disabled:opacity-40 ${fullWidth ? "w-full" : ""}`}
      >
        Preview <span aria-hidden className="text-[13px]">↗</span>
      </button>
    );
  }
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

/** Results "Your page" title row. Public status only when the share origin is externally reachable. */
export function YourPageHeader({
  url,
  onCopy,
  isPublic = false,
  disabled = false,
  onPreview,
}: {
  url: string;
  onCopy: LinkFieldProps["onCopy"];
  isPublic?: boolean;
  disabled?: boolean;
  onPreview?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 lg:h-auto lg:flex-row lg:items-center lg:justify-between lg:gap-5">
      <div className="flex flex-none items-baseline gap-3">
        <h2 className="whitespace-nowrap font-display text-[22px] font-medium leading-none tracking-[-0.035em] sm:text-2xl lg:text-[26px]">
          Your page
        </h2>
        {isPublic && (
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-sf-muted">
            <span className="size-[7px] rounded-full bg-[#3FB27F]" aria-hidden />
            Public
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:flex-1 lg:justify-end lg:gap-2.5">
        <LinkField url={url} onCopy={onCopy} disabled={disabled} />
        <PreviewButton url={url} disabled={disabled} onClick={onPreview} />
      </div>
    </div>
  );
}
