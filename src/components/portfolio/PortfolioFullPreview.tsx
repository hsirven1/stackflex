"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Wordmark } from "@/components/stackflex/Brand";
import { focusRing } from "@/components/stackflex/Controls";
import { usePortfolio } from "@/lib/portfolio/store";
import { useHydrated, useStack } from "@/lib/selection/store";
import { stackTools } from "@/lib/stackflex/tools";
import { PortfolioDocument } from "./PortfolioDocument";

/** Full-width portfolio view without editor chrome. Local preview only — not a public URL. */
export function PortfolioFullPreview() {
  const hydrated = useHydrated();
  const stack = useStack();
  const portfolio = usePortfolio();
  const tools = useMemo(() => stackTools(stack), [stack]);

  if (!hydrated) return <div className="min-h-svh bg-white" />;

  return (
    <div className="min-h-svh bg-[#FAF8F4] text-sf-ink">
      <header className="mx-auto flex h-[64px] max-w-[960px] items-center justify-between px-5 md:px-8">
        <Link href="/" className={`rounded-md ${focusRing}`}>
          <Wordmark />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/portfolio/build" className={`text-[14px] font-semibold text-sf-blue ${focusRing}`}>
            Back to editor
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[960px] px-5 pb-16 pt-4 md:px-8">
        <p className="mb-5 text-center text-[13px] text-sf-subtle">
          Local preview · This is not a permanent public link
        </p>
        <PortfolioDocument portfolio={portfolio} tools={tools} />
      </main>
    </div>
  );
}
