"use client";

import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { PrimaryButton, TextButton } from "@/components/stackflex/Controls";
import { StackCard } from "@/components/stackflex/StackCard";
import { reducedMotion } from "@/lib/motion";
import { ensureStackSaved } from "@/lib/selection/store";
import type { Tool } from "@/lib/stackflex/tools";

/** Brief bridge after Generate — real work is save + fonts, then Results flip. */
const TIMELINE = {
  full: { ready: 720, hold: 280 },
  reduced: { ready: 180, hold: 80 },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** The real work behind the sequence: the stack is saved on this device and the card fonts are loaded. */
async function prepare(tools: Tool[]) {
  if (tools.length === 0) throw new Error("No tools selected");
  await Promise.race([document.fonts.ready, wait(2500)]);
  if (!ensureStackSaved()) throw new Error("Stack not saved");
}

const SHOWN_MAX = 8;

/** A small nudge that stays inside the card stage. */
function nudge(index: number): CSSProperties {
  const dx = ((index % 3) - 1) * 10;
  const dy = index % 2 === 0 ? -8 : 8;
  return {
    "--gx": `${dx}px`,
    "--gy": `${dy}px`,
    "--gr": `${dx / 5}deg`,
    animationDelay: `${index * 40}ms`,
  } as CSSProperties;
}

/**
 * Shown after "Create my page": the user's tools gather briefly while the stack is
 * saved and fonts load, then Results opens for the card flip. No fake AI progress.
 */
export function GenerateSequence({ tools, onDone, onCancel }: { tools: Tool[]; onDone: () => void; onCancel: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const finish = useEffectEvent(onDone);
  const run = useEffectEvent(() => prepare(tools));
  const shown = tools.slice(0, SHOWN_MAX);
  const extra = tools.length - shown.length;
  const columns = shown.length <= 1 ? 1 : shown.length <= 4 ? 2 : 4;
  const stageWidth = shown.length <= 1 ? "min(168px,46vw)" : shown.length <= 4 ? "min(300px,86vw)" : "min(400px,92vw)";

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = reducedMotion() ? TIMELINE.reduced : TIMELINE.full;
    let cancelled = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    Promise.all([run(), wait(t.ready)]).then(
      () => {
        if (cancelled) return;
        holdTimer = setTimeout(finish, t.hold);
      },
      () => !cancelled && setFailed(true),
    );
    return () => {
      cancelled = true;
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [attempt]);

  function retry() {
    setFailed(false);
    setAttempt((a) => a + 1);
  }

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-status"
      className="fixed inset-0 z-50 flex animate-fade-in flex-col items-center justify-center gap-8 overflow-hidden px-5 py-8 outline-none"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 42%, rgba(186,170,255,.16), transparent 70%), radial-gradient(40% 35% at 70% 70%, rgba(255,200,170,.12), transparent 70%), #FFFFFF",
      }}
    >
      <div
        key={attempt}
        className="grid max-h-[min(52svh,420px)] items-start justify-center gap-2 overflow-hidden px-1 py-2"
        style={{ width: stageWidth, gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {shown.map((t, i) => (
          <div key={t.id} className="min-w-0 animate-gather" style={nudge(i)}>
            <StackCard tool={t} main={i === 0} className={i === 0 && !failed ? "sf-shine" : ""} />
          </div>
        ))}
        {extra > 0 && (
          <p className="col-span-full truncate text-center text-sm font-semibold text-sf-muted">+{extra} more</p>
        )}
      </div>

      <div className="flex w-[min(320px,86vw)] shrink-0 flex-col items-center gap-4">
        {failed ? (
          <>
            <p id="generate-status" role="alert" className="text-center font-display text-[24px] font-medium leading-tight tracking-[-0.03em]">
              Your stack couldn’t be saved on this device
            </p>
            <div className="flex items-center gap-4">
              <TextButton onClick={onCancel}>Back to questions</TextButton>
              <PrimaryButton size="sm" onClick={retry}>
                Try again
              </PrimaryButton>
            </div>
          </>
        ) : (
          <p
            id="generate-status"
            role="status"
            className="min-h-8 max-w-full text-balance text-center font-display text-[26px] font-medium leading-8 tracking-[-0.035em]"
          >
            <span className="inline-block animate-message-in">Your AI profile is ready.</span>
          </p>
        )}
      </div>
    </div>
  );
}
