"use client";

import { useState } from "react";
import { Segmented } from "@/components/preview/Segmented";
import { buildResumeSnippet, type ResumeFormat } from "@/lib/selection/resume";
import type { StackState } from "@/lib/selection/types";
import { CopyButton, Panel, TextWell } from "./ResultsUI";

const FORMATS: { value: ResumeFormat; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "categorized", label: "Categorized" },
];

/** Plain, ATS-readable skills section built only from the selected tools. */
export function ResumeSnippet({ stack }: { stack: StackState }) {
  const [format, setFormat] = useState<ResumeFormat>("categorized");
  const text = buildResumeSnippet(stack, format);

  return (
    <Panel
      id="asset-resume"
      title="Resume snippet"
      meta="Skills section, plain text"
      actions={<CopyButton text={text} ariaLabel="Copy resume snippet" />}
    >
      <Segmented<ResumeFormat> legend="Resume format" value={format} options={FORMATS} onChange={setFormat} />
      <TextWell className="flex-1">{text}</TextWell>
    </Panel>
  );
}
