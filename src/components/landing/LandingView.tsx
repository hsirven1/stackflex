"use client";

import Link from "next/link";
import { focusRing, PrimaryButton } from "@/components/stackflex/Controls";
import { LandingHero } from "@/components/stackflex/landing";
import { StartOver } from "@/components/stackflex/StartOver";
import { restartGuide } from "@/lib/guide";
import { track } from "@/lib/integrations/analytics";
import { leaveTo } from "@/lib/motion";
import type { StackState } from "@/lib/selection/types";
import { navigate } from "@/lib/view";

const START_LABEL = "Start";

/**
 * Landing page: Claude Design hero v2 (card + LinkedIn banner showcase).
 * Sample data is display-only and never touches selection/profile stores.
 */
export function LandingView({ stack }: { stack: StackState }) {
  const count = stack.items.length;
  const startFresh = () => {
    track({ name: "start_clicked", props: {} });
    void leaveTo("guide", restartGuide);
  };

  return (
    <div data-page className="flex min-h-0 flex-1 flex-col bg-white text-sf-ink lg:h-svh lg:overflow-hidden">
      <LandingHero
        headerEnd={
          count > 0 ? (
            <button
              type="button"
              onClick={() => navigate("results")}
              className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#DAD7CF] bg-white/80 px-4 text-[14px] font-semibold text-sf-ink transition-colors hover:border-sf-ink hover:bg-white ${focusRing}`}
            >
              View my profile <span aria-hidden="true">→</span>
            </button>
          ) : undefined
        }
        start={
          count === 0 ? (
            <PrimaryButton size="lg" onClick={startFresh}>
              {START_LABEL}
            </PrimaryButton>
          ) : (
            <StartOver count={count} label={START_LABEL} variant="primary" />
          )
        }
      />
      <footer className="flex shrink-0 items-center justify-center gap-4 px-4 py-3 text-[12.5px] text-[#8C897F] lg:absolute lg:inset-x-0 lg:bottom-0">
        <Link href="/privacy" className="hover:text-[#0B0B0C]">
          Privacy
        </Link>
        <span aria-hidden>·</span>
        <Link href="/contact" className="hover:text-[#0B0B0C]">
          Contact
        </Link>
      </footer>
    </div>
  );
}
