"use client";

import { ChevronLeft, ChevronRight, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { focusRing } from "@/components/stackflex/Controls";
import { StyleSymbol } from "@/components/stackflex/results/StyleSymbol";
import { PREVIEW_COPY } from "@/components/stackflex/results/lib/working-styles";
import type { WorkingStylePreference } from "@/lib/profile/types";
import {
  STYLE_META,
  WORKING_STYLE_IDS,
  type WorkingStyleId,
} from "@/lib/profile/workingStyle";

type Selection =
  | { kind: "style"; id: WorkingStyleId }
  | { kind: "hidden" };

type Props = {
  recommendedId: WorkingStyleId;
  preference: WorkingStylePreference | undefined;
  onChange: (next: WorkingStylePreference) => void;
};

function selectionFromPreference(
  preference: WorkingStylePreference | undefined,
  recommendedId: WorkingStyleId,
): Selection {
  if (preference?.mode === "hidden") return { kind: "hidden" };
  if (preference?.mode === "manual" && preference.styleId) {
    return { kind: "style", id: preference.styleId };
  }
  return { kind: "style", id: recommendedId };
}

/**
 * Horizontal, snap-scrolling archetype cards + No title.
 * Recommended badge stays on the classifier suggestion; Selected is independent.
 */
export function ArchetypePicker({ recommendedId, preference, onChange }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const selected = selectionFromPreference(preference, recommendedId);
  const isManualOrHidden = preference?.mode === "manual" || preference?.mode === "hidden";

  function updateArrows() {
    const el = listRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  function scrollByDir(dir: -1 | 1) {
    const el = listRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-archetype-card]");
    const step = card ? card.offsetWidth + 12 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  function pickStyle(id: WorkingStyleId) {
    if (id === recommendedId) onChange({ mode: "auto" });
    else onChange({ mode: "manual", styleId: id });
  }

  function pickHidden() {
    onChange({ mode: "hidden" });
  }

  function resetSuggested() {
    onChange({ mode: "auto" });
    const el = listRef.current;
    const target = el?.querySelector<HTMLElement>(`[data-style-id="${recommendedId}"]`);
    target?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 id="edit-style-heading" className="font-display text-[18px] font-semibold tracking-[-0.03em]">
            Your AI profile
          </h3>
          <p className="mt-1 text-[13px] leading-snug text-sf-muted">
            Choose the style that represents you best.
          </p>
        </div>
        {isManualOrHidden && (
          <button
            type="button"
            onClick={resetSuggested}
            className={`shrink-0 text-[12.5px] font-semibold text-[#3A2EFF] hover:text-sf-ink ${focusRing}`}
          >
            Reset to suggested
          </button>
        )}
      </div>

      <div className="relative mt-3.5">
        {(canPrev || canNext) && (
          <>
            <button
              type="button"
              aria-label="Previous archetypes"
              disabled={!canPrev}
              onClick={() => scrollByDir(-1)}
              className={`absolute -left-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E3DC] bg-white/95 text-sf-ink shadow-sm disabled:opacity-30 sm:flex ${focusRing}`}
            >
              <ChevronLeft className="size-4" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="Next archetypes"
              disabled={!canNext}
              onClick={() => scrollByDir(1)}
              className={`absolute -right-1 top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E3DC] bg-white/95 text-sf-ink shadow-sm disabled:opacity-30 sm:flex ${focusRing}`}
            >
              <ChevronRight className="size-4" strokeWidth={2.2} />
            </button>
          </>
        )}

        <div
          ref={listRef}
          role="listbox"
          aria-labelledby="edit-style-heading"
          tabIndex={0}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {WORKING_STYLE_IDS.map((id) => {
            const meta = STYLE_META[id];
            const copy = PREVIEW_COPY[id];
            const isSelected = selected.kind === "style" && selected.id === id;
            const isRecommended = id === recommendedId;
            return (
              <button
                key={id}
                type="button"
                role="option"
                data-archetype-card=""
                data-style-id={id}
                aria-selected={isSelected}
                onClick={() => pickStyle(id)}
                className={`relative flex w-[min(220px,72vw)] shrink-0 snap-start flex-col gap-2.5 rounded-[18px] bg-[#FAF9F6] p-3.5 text-left transition-shadow sm:w-[210px] ${focusRing} ${
                  isSelected
                    ? "shadow-[inset_0_0_0_2px_#3A2EFF]"
                    : "shadow-[inset_0_0_0_1px_#E6E3DC] hover:shadow-[inset_0_0_0_1px_#C9C6BE]"
                }`}
              >
                {isRecommended && (
                  <span className="absolute right-3 top-3 rounded-full bg-[#D7FF3A] px-2 py-0.5 text-[10.5px] font-semibold tracking-[-0.01em] text-[#0B0B0C]">
                    Recommended
                  </span>
                )}
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-[0_0_0_1px_#E6E3DC]">
                  <span className="block size-11">
                    <StyleSymbol style={id} dark={false} />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[16px] font-semibold tracking-[-0.03em] text-sf-ink">
                    {meta.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-sf-muted">
                    {copy.tagline}
                  </span>
                </span>
              </button>
            );
          })}

          <button
            type="button"
            role="option"
            data-archetype-card=""
            aria-selected={selected.kind === "hidden"}
            onClick={pickHidden}
            className={`relative flex w-[min(220px,72vw)] shrink-0 snap-start flex-col gap-2.5 rounded-[18px] bg-[#FAF9F6] p-3.5 text-left transition-shadow sm:w-[210px] ${focusRing} ${
              selected.kind === "hidden"
                ? "shadow-[inset_0_0_0_2px_#3A2EFF]"
                : "shadow-[inset_0_0_0_1px_#E6E3DC] hover:shadow-[inset_0_0_0_1px_#C9C6BE]"
            }`}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-sf-muted shadow-[0_0_0_1px_#E6E3DC]">
              <EyeOff className="size-6" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[16px] font-semibold tracking-[-0.03em] text-sf-ink">
                No title
              </span>
              <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-sf-muted">
                Show my tools without an AI title.
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
