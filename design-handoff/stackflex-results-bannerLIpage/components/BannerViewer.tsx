"use client";
import { useEffect, useRef } from "react";
import type { AIProfile, CardTheme } from "../lib/types";
import { LinkedInBanner } from "./LinkedInBanner";

/**
 * Mobile full-screen viewer for the banner ("View larger"). The banner is rotated 90° so it uses the
 * phone's full height; pinch-zoom is left to the browser. Closes on ✕, Escape or backdrop tap.
 */
export function BannerViewer({
  open, onClose, profile, theme, onDownload, downloadLabel = "Download banner",
}: {
  open: boolean; onClose: () => void; profile: AIProfile; theme: CardTheme;
  onDownload: () => void; downloadLabel?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="LinkedIn banner" className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0C] text-white" onClick={onClose}>
      <div className="flex h-[60px] flex-none items-center justify-between pl-5 pr-2" onClick={(e) => e.stopPropagation()}>
        <span className="font-display text-lg font-medium tracking-[-0.03em]">LinkedIn banner</span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg">✕</button>
      </div>
      <div className="relative min-h-0 flex-1">
        {/* width = available height (minus margins); rotated to fill the portrait screen */}
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden rounded-[10px] shadow-[0_0_0_1px_rgba(255,255,255,.12)]"
          style={{ width: "min(calc(100dvh - 220px), 4 * (100vw - 48px))", transform: "translate(-50%,-50%) rotate(90deg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <LinkedInBanner profile={profile} theme={theme} />
        </div>
      </div>
      <div className="flex flex-none flex-col items-center gap-3 pb-7 pt-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-[13px] text-[#A8A3C7]">Shown sideways at full width. Pinch to zoom.</span>
        <button type="button" onClick={onDownload} className="h-12 rounded-full bg-white px-[22px] text-[15px] font-semibold text-[#0B0B0C]">↓ {downloadLabel}</button>
      </div>
    </div>
  );
}
