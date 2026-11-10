"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { DURATION, EASE, reducedMotion, shine } from "./motion";

interface Placed {
  left: number;
  top: number;
  width: number;
  height: number;
  el: HTMLElement;
}

/**
 * Animates a container's keyed children (`data-flip="<key>"`) between renders: new ones scale in,
 * moved ones glide to their new place, removed ones fade out as a short-lived inert copy. A new
 * child marked `data-main` gets one holographic sweep. Nothing animates on the first render.
 * The container must be positioned (relative); positions use offsets, so running animations
 * don't skew the measurements.
 */
export function useFlip(ref: RefObject<HTMLElement | null>) {
  const previous = useRef<Map<string, Placed> | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const next = new Map<string, Placed>();
    root.querySelectorAll<HTMLElement>(":scope > [data-flip]").forEach((el) => {
      next.set(el.dataset.flip!, { left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight, el });
    });
    const before = previous.current;
    previous.current = next;
    if (!before || reducedMotion()) return;

    for (const [key, now] of next) {
      const old = before.get(key);
      if (!old) {
        now.el.animate([{ opacity: 0, transform: "scale(0.9)" }, { opacity: 1, transform: "none" }], {
          duration: DURATION.cardIn,
          easing: EASE.out,
        });
        if (now.el.dataset.main !== undefined) setTimeout(() => shine(now.el.querySelector(".sf-card")), DURATION.cardIn / 2);
        continue;
      }
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (dx || dy) {
        now.el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: DURATION.cardMove, easing: EASE.out });
      }
    }

    for (const [key, old] of before) {
      if (next.has(key)) continue;
      const ghost = old.el.cloneNode(true) as HTMLElement;
      ghost.removeAttribute("data-flip");
      ghost.setAttribute("aria-hidden", "true");
      ghost.inert = true;
      Object.assign(ghost.style, {
        position: "absolute",
        left: `${old.left}px`,
        top: `${old.top}px`,
        width: `${old.width}px`,
        height: `${old.height}px`,
        margin: "0",
        pointerEvents: "none",
      });
      root.appendChild(ghost);
      const fade = ghost.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.9)" }], {
        duration: DURATION.cardOut,
        easing: EASE.in,
        fill: "forwards",
      });
      const remove = () => ghost.remove();
      fade.finished.then(remove, remove);
      setTimeout(remove, DURATION.cardOut + 100);
    }
  });
}
