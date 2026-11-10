"use client";

import { useState } from "react";
import { track } from "@/lib/integrations/analytics";
import { BIO_LIMITS, bioLength, buildBio, type BioStyle } from "@/lib/selection/bio";
import { buildResumeSnippet, type ResumeFormat } from "@/lib/selection/resume";
import { buildLinkedInPost, buildXPost, X_LIMIT, xLength } from "@/lib/selection/share";
import type { StackState } from "@/lib/selection/types";
import { TextRow, VariantSwitch } from "./ResultsUI";

const STYLES: { value: BioStyle; label: string }[] = [
  { value: "expressive", label: "Expressive" },
  { value: "clean", label: "Clean" },
];

const FORMATS: { value: ResumeFormat; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "categorized", label: "Categorized" },
];

/**
 * Legacy text export rows (X bio, resume, captions). Kept for a future Advanced Export area;
 * Results now surfaces LinkedIn Bio & About and Copy My Stack as first-class sections instead.
 */
export function TextRows({ stack }: { stack: StackState }) {
  const [bioStyle, setBioStyle] = useState<BioStyle>("expressive");
  const [resumeFormat, setResumeFormat] = useState<ResumeFormat>("categorized");
  const bio = buildBio(stack, "x", bioStyle);
  const xPost = buildXPost(stack);

  return (
    <div className="flex flex-col">
      <TextRow
        label="X bio"
        description="Paste it into the bio field of your X profile."
        detail={`${bioLength(bio, "x")}/${BIO_LIMITS.x}`}
        options={<VariantSwitch label="X bio style" value={bioStyle} options={STYLES} onChange={setBioStyle} />}
        text={bio}
        onCopied={() => track({ name: "bio_copied", props: { platform: "x" } })}
      />
      <TextRow
        label="Resume snippet"
        description="Copy a concise list of your AI tools."
        options={<VariantSwitch label="Resume format" value={resumeFormat} options={FORMATS} onChange={setResumeFormat} />}
        text={buildResumeSnippet(stack, resumeFormat)}
      />
      <TextRow label="LinkedIn caption" description="Ready-made text for a LinkedIn post." text={buildLinkedInPost(stack)} />
      <TextRow label="X caption" description="Ready-made text for an X post." detail={`${xLength(xPost)}/${X_LIMIT}`} text={xPost} />
    </div>
  );
}
