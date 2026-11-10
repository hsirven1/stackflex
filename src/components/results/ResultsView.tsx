"use client";

import { useEffect, useState } from "react";
import { clearResultsReveal, shouldRevealResults } from "@/lib/motion";
import { features } from "@/lib/features";
import type { StackState } from "@/lib/selection/types";
import { AiProfileSection, useEnsureRoleTitle } from "./AiProfileSection";
import { YourStackPageSection } from "./YourStackPageSection";

/**
 * Results: Claude Design profile studio (card + LinkedIn banner).
 */
export function ResultsView({ stack }: { stack: StackState }) {
  const [playReveal] = useState(shouldRevealResults);
  useEnsureRoleTitle();

  useEffect(() => {
    clearResultsReveal();
  }, []);

  return (
    <main data-reveal={playReveal || undefined} className="flex min-h-svh flex-col bg-white text-sf-ink">
      <div className="relative mx-auto flex min-h-0 w-full flex-1 flex-col">
        <AiProfileSection stack={stack} playReveal={playReveal} />

        {features.SHOW_PERSONAL_PAGE_PREVIEW && (
          <div className="mx-auto mt-12 max-w-[894px] border-t border-[#EEECE6] px-4 pt-10">
            <YourStackPageSection stack={stack} />
          </div>
        )}
      </div>
    </main>
  );
}
