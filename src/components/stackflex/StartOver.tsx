"use client";

import { useEffect, useRef, useState } from "react";
import { restartGuide } from "@/lib/guide";
import { clearAll } from "@/lib/selection/store";
import { navigate } from "@/lib/view";
import { focusRing, TextButton } from "./Controls";

/** Resets the stack and reopens the questionnaire, after an inline confirmation. */
export function StartOver({ count, label = "Start a new stack", className = "" }: { count: number; label?: string; className?: string }) {
  const [confirming, setConfirming] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  if (!confirming) {
    return (
      <TextButton ref={triggerRef} onClick={() => setConfirming(true)} className={`h-11 ${className}`}>
        {label}
      </TextButton>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm starting a new stack"
      onKeyDown={(e) => e.key === "Escape" && setConfirming(false)}
      className={`flex h-11 items-center gap-3 text-[15px] ${className}`}
    >
      <span className="font-medium">
        Remove all {count} {count === 1 ? "tool" : "tools"}?
      </span>
      <TextButton ref={cancelRef} onClick={() => setConfirming(false)} className="text-[15px]">
        Cancel
      </TextButton>
      <button
        type="button"
        onClick={() => {
          clearAll();
          restartGuide();
          navigate("guide");
        }}
        className={`h-9 rounded-full bg-sf-ink px-4 font-semibold text-white ${focusRing}`}
      >
        Start a new stack
      </button>
    </div>
  );
}
