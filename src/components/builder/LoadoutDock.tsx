"use client";

import { ArrowRight, ChevronUp, Star, X } from "lucide-react";
import { useState } from "react";
import { DOCK_ID } from "@/components/selector/AnchoredPanel";
import { categoryAnchorId } from "@/components/selector/CategoryCard";
import { ToolIcon } from "@/components/selector/ToolIcon";
import { catalog } from "@/lib/catalog/adapter";
import { EXAMPLE_STATE, itemLabel, itemModelLabel, orderedItems, toolIconSlug } from "@/lib/selection/derive";
import { adoptLoadout, clearAll, removeItem } from "@/lib/selection/store";
import { MAX_BADGES, type SelectedItem, type StackState } from "@/lib/selection/types";
import { navigate } from "@/lib/view";

const FOCUS_ON_DARK = "focus-visible:outline-white";

function focusItem(item: SelectedItem) {
  const card = item.categoryId ? document.getElementById(categoryAnchorId(item.categoryId)) : null;
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  card.querySelector<HTMLElement>(`[data-pill="${CSS.escape(item.id)}"]`)?.focus({ preventScroll: true });
}

function categoryLabel(item: SelectedItem): string {
  const category = item.categoryId ? catalog.category(item.categoryId) : undefined;
  return category?.name ?? "Custom";
}

function Slot({ item, isPrimary, onActivate }: { item: SelectedItem; isPrimary: boolean; onActivate: () => void }) {
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  const label = itemLabel(item);
  const model = itemModelLabel(item);
  const category = categoryLabel(item);
  return (
    <li className="group relative min-w-0 animate-slot-in">
      <button
        type="button"
        onClick={onActivate}
        title={[label, category, model].filter(Boolean).join(" · ")}
        aria-label={`${label}, ${category}${model ? `, ${model}` : ""}${isPrimary ? ", primary" : ""}. Show in builder`}
        className={`flex h-[78px] w-full flex-col gap-1.5 rounded-xl border border-white/12 bg-white/[0.07] px-2 py-2.5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.11] ${FOCUS_ON_DARK}`}
      >
        <span className="block w-full truncate text-[9.5px] font-semibold uppercase leading-3 tracking-[0.05em] text-white/60">
          {category}
        </span>
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="relative">
            <ToolIcon slug={toolIconSlug(tool)} label={label} size={24} />
            {isPrimary && (
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full border-2 border-ink bg-signal"
              >
                <Star className="size-2 fill-ink text-ink" />
              </span>
            )}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[14px] font-semibold leading-tight text-white">{label}</span>
            {model && <span className="truncate text-[12px] leading-tight text-white/60">{model}</span>}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => removeItem(item.id)}
        aria-label={`Remove ${label}`}
        className={`absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-full bg-white/12 text-white/75 opacity-0 transition-opacity hover:bg-white/25 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${FOCUS_ON_DARK}`}
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </li>
  );
}

export function Capacity({ count }: { count: number }) {
  return (
    <span aria-hidden="true" className="flex gap-1">
      {Array.from({ length: MAX_BADGES }, (_, i) => (
        <span key={i} className={`h-1 w-3.5 rounded-full ${i < count ? "bg-signal" : "bg-white/15"}`} />
      ))}
    </span>
  );
}

/** Sticky inventory of the current loadout with the main Generate action. */
export function LoadoutDock({
  stack,
  hydrated,
  inOverlay = false,
}: {
  stack: StackState;
  hydrated: boolean;
  /** Inside the edit drawer: compact layout at every width, list open, no Generate action (the drawer has Save). */
  inOverlay?: boolean;
}) {
  const [open, setOpen] = useState(inOverlay);
  const items = hydrated ? orderedItems(stack) : [];
  const count = items.length;
  const empty = Math.max(0, MAX_BADGES - count);

  const countLabel = (size: string) => (
    <span className={`font-display font-bold leading-none tracking-tight text-white ${size}`} aria-live="polite">
      {count}
      <span className="text-white/40">/{MAX_BADGES}</span>
      <span className="sr-only"> tools selected</span>
    </span>
  );

  const generate = inOverlay ? null : (
    <button
      type="button"
      disabled={count === 0}
      onClick={() => navigate("results")}
      className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-[15px] font-semibold text-ink hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 sm:px-6 ${FOCUS_ON_DARK}`}
    >
      <span className="sm:hidden">Generate</span>
      <span className="hidden sm:inline">Generate my assets</span>
      <ArrowRight aria-hidden="true" className="size-4.5" />
    </button>
  );

  const helper =
    count === 0 ? (
      <button
        type="button"
        onClick={() => adoptLoadout(EXAMPLE_STATE)}
        className={`text-[12px] font-medium text-white underline underline-offset-2 hover:no-underline ${FOCUS_ON_DARK}`}
      >
        Try an example
      </button>
    ) : (
      <button
        type="button"
        onClick={clearAll}
        className={`text-[12px] text-white/60 underline-offset-2 hover:text-white hover:underline ${FOCUS_ON_DARK}`}
      >
        Clear all
      </button>
    );

  return (
    <div id={DOCK_ID} className={inOverlay ? "pb-1" : "sticky top-0 z-30 -mt-4 bg-paper pb-2 pt-3"}>
      <section
        aria-label="Your AI stack"
        className="rounded-2xl border border-black/60 bg-ink text-white shadow-[0_22px_48px_-20px_rgba(18,20,23,0.65),inset_0_1px_0_rgba(255,255,255,0.07)]"
      >
        {/* Desktop: full inventory */}
        {!inOverlay && (
          <div className="hidden items-center gap-4 p-3 lg:flex">
            <div className="flex w-[116px] shrink-0 flex-col gap-1.5 pl-1.5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">Your AI Stack</p>
              {countLabel("text-[28px]")}
              <Capacity count={count} />
              <span>{helper}</span>
            </div>
            <ol className="grid min-w-0 flex-1 grid-cols-6 gap-2">
              {items.map((item) => (
                <Slot key={item.id} item={item} isPrimary={stack.primaryId === item.id} onActivate={() => focusItem(item)} />
              ))}
              {Array.from({ length: empty }, (_, i) => (
                <li
                  key={`empty-${i}`}
                  aria-hidden="true"
                  className="flex h-[78px] items-center justify-center rounded-xl border border-dashed border-white/15 font-mono text-[11px] text-white/30"
                >
                  {count + i + 1}
                </li>
              ))}
            </ol>
            {generate}
          </div>
        )}

        {/* Mobile and tablet (and the edit drawer): compact summary that expands */}
        <div className={inOverlay ? undefined : "lg:hidden"}>
          <div className="flex items-center gap-2 p-2">
            {count === 0 ? (
              <div className="flex min-w-0 flex-1 flex-col gap-1 px-1.5">
                <span className="flex items-center gap-2">
                  {countLabel("text-[18px]")}
                  <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    Your AI Stack
                  </span>
                </span>
                <span>{helper}</span>
              </div>
            ) : (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${DOCK_ID}-list`}
                onClick={() => setOpen((v) => !v)}
                className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1.5 py-1 text-left ${FOCUS_ON_DARK}`}
              >
                <span className="flex shrink-0 flex-col gap-1">
                  {countLabel("text-[18px]")}
                  <Capacity count={count} />
                </span>
                <span className="flex min-w-0 items-center -space-x-1.5 overflow-hidden">
                  {items.map((item) => (
                    <span key={item.id} className="animate-slot-in rounded-[7px] ring-2 ring-ink">
                      <ToolIcon
                        slug={toolIconSlug(item.toolId ? catalog.tool(item.toolId) : undefined)}
                        label={itemLabel(item)}
                        size={20}
                      />
                    </span>
                  ))}
                </span>
                <span className="sr-only">{open ? "Hide" : "Show"} stack details</span>
                <ChevronUp
                  aria-hidden="true"
                  className={`ml-auto size-4 shrink-0 text-white/60 transition-transform ${open ? "" : "rotate-180"}`}
                />
              </button>
            )}
            {generate}
          </div>
          {open && count > 0 && (
            <div id={`${DOCK_ID}-list`} className="border-t border-white/10 p-2">
              <ol className="grid max-h-[50vh] grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
                {items.map((item) => (
                  <Slot
                    key={item.id}
                    item={item}
                    isPrimary={stack.primaryId === item.id}
                    onActivate={() => {
                      setOpen(false);
                      focusItem(item);
                    }}
                  />
                ))}
              </ol>
              <div className="px-1 pt-2">{helper}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
