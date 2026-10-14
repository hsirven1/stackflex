"use client";

import { useState } from "react";
import { track } from "@/lib/integrations/analytics";
import { BIO_LIMITS, bioLength, buildBio, type BioPlatform, type BioStyle } from "@/lib/selection/bio";
import type { StackState } from "@/lib/selection/types";
import { CopyButton, Panel, TextWell } from "@/components/results/ResultsUI";
import { Segmented } from "./Segmented";

const PLATFORMS: { id: BioPlatform; label: string }[] = [
  { id: "linkedin", label: "LinkedIn headline" },
  { id: "x", label: "X bio" },
];

const STYLES: { value: BioStyle; label: string }[] = [
  { value: "expressive", label: "Expressive" },
  { value: "clean", label: "Clean" },
];

export function BioPanel({ stack }: { stack: Pick<StackState, "items" | "primaryId"> }) {
  const [style, setStyle] = useState<BioStyle>("expressive");

  return (
    <Panel id="asset-bio" title="Headline and bio" meta="For your LinkedIn and X profiles">
      <Segmented<BioStyle> legend="Bio style" value={style} options={STYLES} onChange={setStyle} />
      {PLATFORMS.map((platform) => {
        const text = buildBio(stack, platform.id, style);
        return (
          <div key={platform.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h4 className="text-[15px] font-semibold">{platform.label}</h4>
              <span className="text-[13px] tabular-nums text-sf-muted">
                {bioLength(text, platform.id)}/{BIO_LIMITS[platform.id]}
              </span>
              <span className="ml-auto">
                <CopyButton
                  text={text}
                  ariaLabel={`Copy ${platform.label}`}
                  onCopied={() => track({ name: "bio_copied", props: { platform: platform.id } })}
                />
              </span>
            </div>
            <TextWell>{text}</TextWell>
          </div>
        );
      })}
    </Panel>
  );
}
