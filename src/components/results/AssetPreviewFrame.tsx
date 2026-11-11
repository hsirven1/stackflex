"use client";

import { Pencil } from "lucide-react";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { focusRing } from "@/components/stackflex/Controls";

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedNow() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeFinePointer(onChange: () => void) {
  const media = window.matchMedia("(hover: hover) and (pointer: fine)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function finePointerNow() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

type Props = {
  children: ReactNode;
  onEdit?: () => void;
  /** Accessible name for the Edit control. */
  editLabel: string;
  /** Max tilt in degrees (card ~3.5, banner ~1.5). */
  maxTilt?: number;
  className?: string;
};

/**
 * Presentation-only wrapper: hover/focus Edit pill + subtle pointer tilt.
 * Never wrap export capture nodes — PNG stays flat.
 */
export function AssetPreviewFrame({
  children,
  onEdit,
  editLabel,
  maxTilt = 3.5,
  className = "",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const targetRef = useRef({ rx: 0, ry: 0, px: 50, py: 50 });
  const currentRef = useRef({ rx: 0, ry: 0, px: 50, py: 50 });
  const reduce = useSyncExternalStore(subscribeReduced, reducedNow, () => true);
  const finePointer = useSyncExternalStore(subscribeFinePointer, finePointerNow, () => false);
  const motionOk = finePointer && !reduce && maxTilt > 0;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function tick() {
    rafRef.current = 0;
    const cur = currentRef.current;
    const tgt = targetRef.current;
    cur.rx += (tgt.rx - cur.rx) * 0.18;
    cur.ry += (tgt.ry - cur.ry) * 0.18;
    cur.px += (tgt.px - cur.px) * 0.18;
    cur.py += (tgt.py - cur.py) * 0.18;
    const node = tiltRef.current;
    if (node) {
      node.style.transform = `perspective(900px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg)`;
    }
    const shine = shineRef.current;
    if (shine) {
      shine.style.background = `radial-gradient(420px circle at ${cur.px.toFixed(1)}% ${cur.py.toFixed(1)}%, rgba(255,255,255,.22), transparent 55%)`;
    }
    const settled =
      Math.abs(tgt.rx - cur.rx) < 0.02 &&
      Math.abs(tgt.ry - cur.ry) < 0.02 &&
      Math.abs(tgt.px - cur.px) < 0.15 &&
      Math.abs(tgt.py - cur.py) < 0.15;
    if (!settled) rafRef.current = requestAnimationFrame(tick);
  }

  function schedule() {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!motionOk) return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const nx = Math.min(1, Math.max(0, x));
    const ny = Math.min(1, Math.max(0, y));
    targetRef.current = {
      ry: (nx - 0.5) * 2 * maxTilt,
      rx: (0.5 - ny) * 2 * maxTilt,
      px: nx * 100,
      py: ny * 100,
    };
    schedule();
  }

  function onPointerLeave() {
    if (!motionOk) return;
    targetRef.current = { rx: 0, ry: 0, px: 50, py: 50 };
    schedule();
  }

  return (
    <div
      ref={rootRef}
      className={`group/asset relative ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={tiltRef}
        className="relative will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
        {motionOk && (
          <div
            ref={shineRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover/asset:opacity-100"
          />
        )}
      </div>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className={`absolute right-3 top-3 z-10 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/45 bg-[#0B0B0C]/55 px-3 text-[12.5px] font-semibold text-white shadow-[0_8px_20px_-12px_rgba(11,11,12,.65)] backdrop-blur-md transition-opacity duration-150 hover:bg-[#0B0B0C]/72 ${focusRing} ${
            finePointer
              ? "opacity-0 group-hover/asset:opacity-100 group-focus-within/asset:opacity-100 focus-visible:opacity-100"
              : "opacity-100"
          }`}
        >
          <Pencil className="size-3.5" strokeWidth={2.3} aria-hidden />
          Edit
        </button>
      )}
    </div>
  );
}
