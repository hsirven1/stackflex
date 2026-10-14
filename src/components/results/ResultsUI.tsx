"use client";

import { useEffect, useState, type ReactNode } from "react";
import { copyText } from "@/lib/clipboard";
import { focusRing, SecondaryButton } from "@/components/stackflex/Controls";
import type { ArtTheme, AssetExporter } from "./artExport";

/** Warm-white gallery panel (the social card panel's surface), with title, meta and actions. */
export function Panel({
  id,
  title,
  meta,
  actions,
  children,
}: {
  id: string;
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex min-w-0 flex-col gap-5 rounded-3xl bg-sf-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 id={id} className="text-xl font-semibold tracking-[-0.015em]">
            {title}
          </h3>
          {meta && <span className="text-sm text-sf-muted">{meta}</span>}
        </div>
        {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/** "Light · Dark" as text, the social card panel's theme switch. */
export function ThemeToggle({ label, value, onChange }: { label: string; value: ArtTheme; onChange: (t: ArtTheme) => void }) {
  return (
    <span role="group" aria-label={label} className="text-sm font-medium text-sf-muted">
      {(["light", "dark"] as const).map((t, i) => (
        <span key={t}>
          {i > 0 && " · "}
          <button
            type="button"
            aria-pressed={value === t}
            onClick={() => onChange(t)}
            className={`rounded-sm hover:text-sf-ink ${value === t ? "text-sf-ink" : ""} ${focusRing}`}
          >
            {t === "light" ? "Light" : "Dark"}
          </button>
        </span>
      ))}
    </span>
  );
}

/** Copies on click and confirms for two seconds, visibly and to screen readers. */
export function CopyButton({
  text,
  label = "Copy",
  ariaLabel,
  onCopied,
}: {
  text: string;
  label?: string;
  ariaLabel?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <SecondaryButton
        size="sm"
        disabled={!text}
        aria-label={ariaLabel}
        onClick={async () => {
          const ok = await copyText(text);
          setCopied(ok);
          if (ok) onCopied?.();
        }}
        className="disabled:opacity-40"
      >
        {copied ? "Copied ✓" : label}
      </SecondaryButton>
      <span className="sr-only" role="status">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}

export function DownloadButton({ exporter, label = "Download PNG", ariaLabel }: { exporter: AssetExporter; label?: string; ariaLabel?: string }) {
  return (
    <>
      <SecondaryButton
        size="sm"
        aria-label={ariaLabel}
        onClick={() => void exporter.download()}
        disabled={exporter.status === "working"}
        className="disabled:cursor-wait disabled:opacity-60"
      >
        {exporter.status === "working" ? "Preparing…" : exporter.status === "done" ? "Downloaded ✓" : label}
      </SecondaryButton>
      <span className="sr-only" role="status">
        {exporter.status === "done" ? `Downloaded ${exporter.filename}` : ""}
      </span>
    </>
  );
}

/** Error line shown under a preview when an export fails. */
export function ExportError({ exporter }: { exporter: AssetExporter }) {
  return exporter.status === "error" ? (
    <p role="alert" className="text-sm text-sf-muted">
      The image couldn’t be created. Try again, or use a different browser.
    </p>
  ) : null;
}

/** White text well inside a panel, for generated copy. */
export function TextWell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`whitespace-pre-line rounded-2xl bg-white px-4 py-3.5 text-[15px] leading-relaxed ${className}`}>{children}</p>;
}
