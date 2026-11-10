"use client";

import { useEffect, useRef, useState } from "react";
import { restartGuide } from "@/lib/guide";
import { track } from "@/lib/integrations/analytics";
import { clearAll } from "@/lib/selection/store";
import { leaveTo } from "@/lib/motion";
import { focusRing, PrimaryButton, TextButton } from "./Controls";

/** Resets the stack and reopens the questionnaire, after an inline confirmation. */
export function StartOver({
  count,
  label = "Start a new stack",
  className = "",
  variant = "text",
}: {
  count: number;
  label?: string;
  className?: string;
  /** "primary": the landing page's main CTA opens the same confirmation. */
  variant?: "text" | "primary";
}) {
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
    if (variant === "primary") {
      return (
        <PrimaryButton ref={triggerRef} size="lg" onClick={() => setConfirming(true)} className={className}>
          {label}
        </PrimaryButton>
      );
    }
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
          track({ name: "start_clicked", props: {} });
          void leaveTo("guide", () => {
            clearAll();
            restartGuide();
          });
        }}
        className={`h-9 rounded-full bg-sf-ink px-4 font-semibold text-white ${focusRing}`}
      >
        Start a new stack
      </button>
    </div>
  );
}
