"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import { track } from "@/lib/integrations/analytics";
import { buildCopyStack } from "@/lib/selection/copyStack";
import type { StackState } from "@/lib/selection/types";
import { UtilityButton } from "./ResultsUI";

/** Compact utility row: one plain-text dump of the stack + Copy. */
export function CopyMyStackSection({ stack }: { stack: StackState }) {
  const text = buildCopyStack(stack);
  const [status, setStatus] = useState("");
  const [selectFallback, setSelectFallback] = useState(false);

  async function copy() {
    setSelectFallback(false);
    if (!text) {
      setStatus("Add tools first.");
      return;
    }
    if (await copyText(text)) {
      setStatus("Copied ✓");
      track({ name: "bio_copied", props: { platform: "stack" } });
      return;
    }
    setSelectFallback(true);
    setStatus("Select text and copy manually.");
  }

  return (
    <section
      aria-labelledby="format-copy-stack"
      className="flex flex-col gap-2.5 rounded-[18px] border border-[#ECEAE4] bg-[#FAF9F6] px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 id="format-copy-stack" className="font-display text-[16px] font-medium tracking-[-0.03em]">
            Copy My Stack
          </h3>
          <p className="text-[12.5px] text-sf-muted">One simple format. Paste it anywhere.</p>
        </div>
        <pre
          tabIndex={0}
          className={`mt-2 max-h-[4.5rem] overflow-auto whitespace-pre-wrap font-sans text-[13px] leading-snug text-sf-ver sm:mt-1.5 ${
            selectFallback ? "rounded-md ring-2 ring-sf-blue" : ""
          }`}
        >
          {text || "Add tools to generate this text."}
        </pre>
      </div>
      <div className="flex flex-none flex-col items-start gap-1.5 sm:items-end">
        <UtilityButton onClick={() => void copy()} disabled={!text}>
          Copy stack
        </UtilityButton>
        <p role="status" className="text-[12px] font-medium text-sf-body empty:hidden">
          {status}
        </p>
      </div>
    </section>
  );
}
