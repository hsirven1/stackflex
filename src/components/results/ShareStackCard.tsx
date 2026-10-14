"use client";

import { useState } from "react";
import { Segmented } from "@/components/preview/Segmented";
import { buildLinkedInPost, buildXPost, X_LIMIT, xLength } from "@/lib/selection/share";
import type { StackState } from "@/lib/selection/types";
import { CopyButton, Panel, TextWell } from "./ResultsUI";

type Network = "linkedin" | "x";

const OPTIONS: { value: Network; label: string }[] = [
  { value: "linkedin", label: "LinkedIn post" },
  { value: "x", label: "X post" },
];

/** Ready-to-post text built only from the selected tools, for LinkedIn or X. */
export function ShareStackCard({ stack }: { stack: StackState }) {
  const [network, setNetwork] = useState<Network>("linkedin");
  const text = network === "linkedin" ? buildLinkedInPost(stack) : buildXPost(stack);
  const label = OPTIONS.find((o) => o.value === network)!.label;

  return (
    <Panel
      id="asset-share"
      title="Share your stack"
      meta="Ready-to-post text"
      actions={<CopyButton key={network} text={text} ariaLabel={`Copy ${label}`} />}
    >
      <div className="flex items-center gap-3">
        <Segmented<Network> legend="Post for" value={network} options={OPTIONS} onChange={setNetwork} />
        {network === "x" && (
          <span className="ml-auto text-[13px] tabular-nums text-sf-muted">
            {xLength(text)}/{X_LIMIT}
          </span>
        )}
      </div>
      <TextWell className="flex-1">{text}</TextWell>
    </Panel>
  );
}
