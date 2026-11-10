"use client";

import { Sparkles } from "lucide-react";
import { focusRing } from "@/components/stackflex/Controls";

/**
 * Entry to the AI Portfolio builder from Results. Full navigation leaves the hash SPA reliably.
 * `strip` is the compact full-width promo under the bento grid.
 */
export function PortfolioPromoCard({
  className = "",
  variant = "card",
}: {
  className?: string;
  variant?: "card" | "strip";
}) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- leave hash SPA for portfolio builder
    window.location.href = "/portfolio/build";
  };

  if (variant === "strip") {
    return (
      <aside
        aria-labelledby="portfolio-promo-title"
        className={`relative flex flex-col gap-3 overflow-hidden rounded-[18px] border border-[#E4E0F5] bg-[linear-gradient(105deg,#FBF9FF_0%,#F7F5F0_42%,#F3F0FF_100%)] px-4 py-3.5 shadow-[0_1px_0_rgba(58,46,255,.04),0_12px_28px_-22px_rgba(58,46,255,.28)] sm:flex-row sm:items-center sm:gap-5 sm:px-5 sm:py-3.5 ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.1), transparent)" }}
        />
        <div className="relative flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="inline-flex w-fit flex-none items-center gap-1.5 rounded-full bg-sf-blue/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-sf-blue">
            <Sparkles aria-hidden="true" className="size-3" strokeWidth={2.2} />
            NEW
          </span>
          <div className="min-w-0">
            <h2 id="portfolio-promo-title" className="font-display text-[16px] font-medium leading-tight tracking-[-0.03em] text-sf-ink sm:text-[17px]">
              Your tools are just the beginning.
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-sf-body">Turn your AI experience into a portfolio worth sharing.</p>
          </div>
        </div>
        <a
          href="/portfolio/build"
          onClick={go}
          className={`relative inline-flex h-10 flex-none items-center justify-center gap-1.5 self-start rounded-full bg-sf-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-sf-ink/90 sm:self-auto ${focusRing}`}
        >
          Generate my AI Portfolio
          <span aria-hidden="true" className="text-sf-lime">
            →
          </span>
        </a>
      </aside>
    );
  }

  return (
    <aside
      aria-labelledby="portfolio-promo-title"
      className={`relative overflow-hidden rounded-[18px] border border-[#E4E0F5] bg-[linear-gradient(145deg,#FBF9FF_0%,#F7F5F0_48%,#F3F0FF_100%)] p-4 shadow-[0_1px_0_rgba(58,46,255,.04),0_12px_28px_-22px_rgba(58,46,255,.35)] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full opacity-70"
        style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.12), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 left-6 size-24 rounded-full opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(215,255,58,.18), transparent)" }}
      />

      <div className="relative flex flex-col gap-2.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sf-blue/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-sf-blue">
          <Sparkles aria-hidden="true" className="size-3" strokeWidth={2.2} />
          NEW
        </span>
        <h2 id="portfolio-promo-title" className="font-display text-[18px] font-medium leading-[1.15] tracking-[-0.03em] text-sf-ink">
          Your tools are just the beginning.
        </h2>
        <p className="text-[13px] leading-snug text-sf-body">Turn your AI experience into a portfolio worth sharing.</p>
        <a
          href="/portfolio/build"
          onClick={go}
          className={`mt-0.5 inline-flex h-10 w-fit items-center gap-1.5 rounded-full bg-sf-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-sf-ink/90 ${focusRing}`}
        >
          Generate my AI Portfolio
          <span aria-hidden="true" className="text-sf-lime">
            →
          </span>
        </a>
      </div>
    </aside>
  );
}
