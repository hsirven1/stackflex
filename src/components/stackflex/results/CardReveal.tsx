"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Mark } from "@/components/stackflex/Brand";
import { focusRing } from "@/components/stackflex/Controls";

/** Keep in sync with `.sfr-pack-flip` in profile-results.css (~1.7s). */
const FLIP_MS = 1700;

function subscribeReduced(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function reducedNow() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays once when `play` is true and motion is allowed. Replay is explicit.
 * Theme changes do not restart it.
 *
 * When `play` is true, the first paint uses the flip wrapper so the card back
 * shows first — the working-style title must not flash before the flip.
 */
export function usePackReveal(play: boolean) {
  const reduce = useSyncExternalStore(subscribeReduced, reducedNow, () => true);
  const [run, setRun] = useState(0);
  /** Independent of `play` so Replay works on return visits. */
  const [session, setSession] = useState<"idle" | "play" | "done">(() =>
    play ? "play" : "done",
  );

  // Start the auto-reveal when requested; ignore once finished / idle after skip.
  if (play && !reduce && session === "idle") {
    setSession("play");
  }
  if (reduce && session === "play") {
    setSession("done");
  }

  const playing = session === "play" && !reduce;

  useEffect(() => {
    if (!playing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSession("done");
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => setSession("done"), FLIP_MS + 40);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [playing, run]);

  return {
    playing,
    run,
    motionOk: !reduce,
    skip: () => setSession("done"),
    replay: () => {
      if (reduce) return;
      setRun((n) => n + 1);
      setSession("play");
    },
  };
}

/**
 * One 3D flip around the on-page card. Unmounted at rest so the static card matches the export.
 * The back and shine sit outside the card node, so they are not part of the PNG.
 */
export function CardReveal({
  playing,
  run,
  onSkip,
  children,
}: {
  playing: boolean;
  run: number;
  onSkip: () => void;
  children: ReactNode;
}) {
  if (!playing) return children;

  return (
    <div className="sfr-pack">
      <div className="sfr-pack__glow" aria-hidden />
      <div key={run} className="sfr-pack__rotor">
        <div className="sfr-pack__front">
          {children}
          <div className="sfr-pack__shine" aria-hidden />
        </div>
        <div className="sfr-pack__back" aria-hidden>
          <div className="sfr-pack__foil" />
          <div className="sfr-pack__back-ring" />
          <Mark size={56} outline="#14121C" />
          <span className="sfr-pack__brand">StackFlex</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className={`absolute right-3 top-3 z-20 inline-flex h-9 items-center rounded-full border border-white/35 bg-black/45 px-3.5 text-[13px] font-semibold text-white hover:bg-black/60 ${focusRing}`}
      >
        Skip
      </button>
    </div>
  );
}
