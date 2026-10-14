"use client";

import { restartGuide } from "@/lib/guide";
import { useHydrated } from "@/lib/selection/store";
import type { StackState } from "@/lib/selection/types";
import { navigate } from "@/lib/view";
import { CategoryGrid } from "./CategoryGrid";
import { LoadoutDock } from "./LoadoutDock";

/** Full editor: all six category cards at once; the loadout dock collects them and generates. */
export function BuilderView({ stack }: { stack: StackState }) {
  const hydrated = useHydrated();

  return (
    <div className="flex flex-col gap-3">
      <LoadoutDock stack={stack} hydrated={hydrated} />

      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.03em]">Edit your full stack</h1>
        <button
          type="button"
          onClick={() => {
            restartGuide();
            navigate("guide");
          }}
          className="text-[13px] font-medium text-graphite underline decoration-rule underline-offset-4 hover:text-ink hover:decoration-ink sm:ml-auto"
        >
          Answer step by step instead
        </button>
      </div>

      <CategoryGrid stack={stack} />
    </div>
  );
}
