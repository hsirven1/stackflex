"use client";

import { navigate, type View } from "@/lib/view";

/**
 * Motion tokens, shared with the CSS animations in app/globals.css (same durations and curves).
 * micro 120–220ms · step 250–300ms · page 350–450ms · generation ~1.8s · results reveal ≤800ms.
 */
export const DURATION = {
  press: 240,
  cardIn: 220,
  cardMove: 280,
  cardOut: 200,
  stepOut: 110,
  stepIn: 190,
  pageOut: 160,
} as const;

export const EASE = {
  /** Soft deceleration: entrances and moves. */
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Quick acceleration: exits. */
  in: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/** Step slide distance in px. */
export const STEP_SHIFT = 20;

export function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays a Web Animation and resolves when it ends, or shortly after its planned end if the
 * browser isn't producing frames (background tab): a transition must never block navigation.
 */
export function play(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions & { duration: number }): Promise<void> {
  const animation = el.animate(keyframes, options);
  const safety = new Promise<void>((resolve) => setTimeout(resolve, options.duration + ((options.delay as number) ?? 0) + 80));
  return Promise.race([animation.finished.then(() => undefined, () => undefined), safety]);
}

/** Brief holographic sweep across a card (CSS class sf-shine), e.g. when a Main card is created. */
export function shine(card: Element | null) {
  if (!card || reducedMotion()) return;
  card.classList.remove("sf-shine");
  void (card as HTMLElement).offsetWidth;
  card.classList.add("sf-shine");
  setTimeout(() => card.classList.remove("sf-shine"), 1000);
}

let leaving = false;

/**
 * Page transition: fades the current page ([data-page]) out, then runs `before` and navigates.
 * The next page plays its own entrance (animate-page-in). Repeated calls while leaving are ignored.
 */
export async function leaveTo(view: View, before?: () => void) {
  if (leaving) return;
  leaving = true;
  try {
    const page = document.querySelector("[data-page]");
    if (page && !reducedMotion()) {
      await play(page, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-10px)" }], {
        duration: DURATION.pageOut,
        easing: EASE.in,
        fill: "forwards",
      });
    }
    before?.();
    navigate(view);
  } finally {
    leaving = false;
  }
}

/* The Results reveal plays once, right after a stack is generated; not when a saved stack is reopened. */
let revealAt = 0;

export function markResultsReveal() {
  revealAt = Date.now();
}

export function shouldRevealResults(): boolean {
  return Date.now() - revealAt < 3000;
}

export function clearResultsReveal() {
  revealAt = 0;
}
