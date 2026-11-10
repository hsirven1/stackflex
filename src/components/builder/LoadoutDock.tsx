"use client";

import { DOCK_ID } from "@/components/selector/AnchoredPanel";
import { categoryAnchorId } from "@/components/selector/CategoryCard";
import { focusRing } from "@/components/stackflex/Controls";
import { StackBoard } from "@/components/stackflex/StackBoard";
import { catalog } from "@/lib/catalog/adapter";
import { EXAMPLE_STATE } from "@/lib/selection/derive";
import { adoptLoadout, clearAll, removeItem } from "@/lib/selection/store";
import type { SelectedItem, StackState } from "@/lib/selection/types";
import { stackTools } from "@/lib/stackflex/tools";
import { navigate } from "@/lib/view";

function focusCategory(categoryId: string | null | undefined, pillId?: string) {
  const card = categoryId ? document.getElementById(categoryAnchorId(categoryId)) : null;
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  const target = pillId ? card.querySelector<HTMLElement>(`[data-pill="${CSS.escape(pillId)}"]`) : null;
  (target ?? card.querySelector<HTMLElement>("button, input"))?.focus({ preventScroll: true });
}

function focusItem(item: SelectedItem | undefined) {
  if (item) focusCategory(item.categoryId, item.id);
}

/**
 * The stack being edited, as shared StackCards (the tray on the Edit page, the Results panel grid in
 * the drawer). The first card is Main; a card jumps to its category, × removes it, and the tray's "+"
 * goes to the first category with nothing picked.
 */
export function LoadoutDock({
  stack,
  hydrated,
  inOverlay = false,
}: {
  stack: StackState;
  hydrated: boolean;
  /** Inside the edit drawer: stacked layout, not sticky, no Generate action (the drawer has Save). */
  inOverlay?: boolean;
}) {
  const tools = hydrated ? stackTools(stack) : [];
  const count = tools.length;
  const firstOpen = catalog.categories().find((c) => !stack.items.some((i) => i.categoryId === c.id)) ?? catalog.categories()[0];

  const helper =
    count === 0 ? (
      <button
        type="button"
        onClick={() => adoptLoadout(EXAMPLE_STATE)}
        className={`self-start rounded-sm text-[13px] font-medium text-sf-blue hover:text-sf-ink ${focusRing}`}
      >
        Try an example
      </button>
    ) : (
      <button
        type="button"
        onClick={clearAll}
        className={`self-start rounded-sm text-[13px] font-medium text-sf-muted hover:text-sf-ink ${focusRing}`}
      >
        Clear all
      </button>
    );

  return (
    <div id={DOCK_ID} className={inOverlay ? "" : "sticky top-0 z-30 -mt-4 bg-paper pb-2 pt-3"}>
      <section
        aria-labelledby={`${DOCK_ID}-title`}
        className={`flex flex-col gap-4 rounded-[24px] p-4 ${
          inOverlay ? "bg-sf-paper" : "bg-white shadow-[0_0_0_1px_#ECEAE4,0_16px_34px_-26px_rgba(11,11,12,.35)] lg:flex-row lg:items-center lg:gap-6"
        }`}
      >
        <div className={`flex flex-col gap-1 ${inOverlay ? "" : "lg:w-[150px] lg:flex-none"}`}>
          <h2 id={`${DOCK_ID}-title`} className="font-display text-[22px] font-medium leading-none tracking-[-0.035em]">
            Your stack
          </h2>
          <span className="text-[14px] text-sf-muted" aria-live="polite">
            {count === 0 ? "No tools yet" : `${count} tool${count === 1 ? "" : "s"}`}
          </span>
          {helper}
        </div>
        {inOverlay ? (
          count > 0 && (
            <StackBoard
              tools={tools}
              layout="grid"
              gap="6px"
              onOpen={(t) => focusItem(stack.items.find((i) => i.id === t.id))}
              onRemove={(t) => removeItem(t.id)}
              className="w-full max-w-[288px]"
            />
          )
        ) : (
          <StackBoard
            tools={tools}
            layout="tray"
            onOpen={(t) => focusItem(stack.items.find((i) => i.id === t.id))}
            onRemove={(t) => removeItem(t.id)}
            onAdd={() => focusCategory(firstOpen?.id)}
            className="-m-2 max-w-[calc(100%+16px)] flex-none overflow-x-auto p-2"
          />
        )}
        {!inOverlay && (
          <button
            type="button"
            disabled={count === 0}
            onClick={() => navigate("results")}
            className={`inline-flex h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-sf-ink pl-[22px] pr-[5px] text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 lg:ml-auto ${focusRing}`}
          >
            Create my page
            <span aria-hidden="true" className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-sf-lime text-sf-ink">
              →
            </span>
          </button>
        )}
      </section>
    </div>
  );
}
