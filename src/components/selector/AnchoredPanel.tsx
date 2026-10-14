"use client";

import { X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export const DOCK_ID = "loadout-dock";

const GAP = 8;
const MARGIN = 12;
const MIN_BELOW = 280;
const SHEET_BREAKPOINT = 640;

interface Placement {
  sheet: boolean;
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

interface AnchoredPanelProps {
  anchor: RefObject<HTMLElement | null>;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

/**
 * Floating panel attached to a trigger. Never changes surrounding layout: it is portaled and
 * positioned against the viewport, flips above the trigger when there is no room below (never
 * over the sticky loadout bar), and becomes a bottom sheet on small screens.
 */
export function AnchoredPanel({ anchor, title, onClose, children, width = 420 }: AnchoredPanelProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useLayoutEffect(() => {
    function place() {
      const a = anchor.current;
      if (!a) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < SHEET_BREAKPOINT) {
        setPlacement({ sheet: true, left: 0, width: vw, maxHeight: Math.round(vh * 0.78) });
        return;
      }
      const dockBottom = document.getElementById(DOCK_ID)?.getBoundingClientRect().bottom ?? 0;
      const ceiling = Math.max(0, dockBottom) + MARGIN;
      const r = a.getBoundingClientRect();
      const w = Math.min(width, vw - MARGIN * 2);
      const left = Math.min(Math.max(r.left, MARGIN), vw - MARGIN - w);
      const below = vh - MARGIN - r.bottom - GAP;
      const above = r.top - GAP - ceiling;
      const next: Placement =
        below >= MIN_BELOW || below >= above
          ? { sheet: false, left, width: w, top: r.bottom + GAP, maxHeight: Math.max(160, below) }
          : { sheet: false, left, width: w, bottom: vh - r.top + GAP, maxHeight: Math.max(160, above) };
      setPlacement((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const observer = new ResizeObserver(place);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      observer.disconnect();
    };
  }, [anchor, width]);

  const placed = placement !== null;
  useEffect(() => {
    if (!placed) return;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus({ preventScroll: true });
  }, [placed]);

  useEffect(() => {
    const panel = panelRef.current;
    const trigger = anchor.current;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    }
    function onPointer(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchor.current?.contains(target)) return;
      onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      const active = document.activeElement;
      if (!active || active === document.body || panel?.contains(active)) trigger?.focus({ preventScroll: true });
    };
  }, [anchor]);

  const sheet = placement?.sheet;

  return createPortal(
    <>
      {sheet && <div aria-hidden="true" className="fixed inset-0 z-40 bg-ink/25" />}
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && !panelRef.current?.contains(next) && !anchor.current?.contains(next)) onClose();
        }}
        style={
          placement
            ? sheet
              ? { maxHeight: placement.maxHeight }
              : {
                  left: placement.left,
                  width: placement.width,
                  top: placement.top,
                  bottom: placement.bottom,
                  maxHeight: placement.maxHeight,
                }
            : { visibility: "hidden" }
        }
        className={[
          "fixed z-50 flex flex-col overflow-hidden border border-rule bg-panel outline-none",
          sheet
            ? "inset-x-0 bottom-0 rounded-t-2xl shadow-[0_-12px_32px_-16px_rgba(18,20,23,0.35)]"
            : "rounded-2xl shadow-[0_12px_32px_-14px_rgba(18,20,23,0.35)]",
        ].join(" ")}
      >
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-hairline pl-4 pr-1.5">
          <h4 id={titleId} className="min-w-0 flex-1 truncate text-[13px] font-semibold">
            {title}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-full text-graphite hover:bg-well hover:text-ink"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      </div>
    </>,
    document.body,
  );
}
