"use client";

import { useState } from "react";
import { focusRing, Segmented } from "@/components/stackflex/Controls";
import { copyText } from "@/lib/clipboard";
import { track } from "@/lib/integrations/analytics";
import {
  LINKEDIN_HEADLINE_LIMIT,
  buildLinkedInBio,
  defaultLinkedInStyle,
  linkedInHeadlineLength,
  type LinkedInFormat,
  type LinkedInVisualStyle,
} from "@/lib/selection/linkedinBio";
import { setLinkedInTitle, useLinkedInTitle } from "@/lib/selection/linkedinTitle";
import type { StackState } from "@/lib/selection/types";
import { FormatModule, ShareActions, UtilityButton } from "./ResultsUI";

const FORMATS: { value: LinkedInFormat; label: string }[] = [
  { value: "headline", label: "Headline" },
  { value: "about", label: "About" },
];

const STYLES: { value: LinkedInVisualStyle; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "emojis", label: "With Emojis" },
  { value: "bold", label: "Bold" },
];

/**
 * LinkedIn Headline + About generator — compact bento module with live preview + copy.
 */
export function LinkedInBioSection({ stack }: { stack: StackState }) {
  const [format, setFormat] = useState<LinkedInFormat>("about");
  const [style, setStyle] = useState<LinkedInVisualStyle>(() => defaultLinkedInStyle("about"));
  const professionalTitle = useLinkedInTitle();
  const [status, setStatus] = useState("");
  const [selectFallback, setSelectFallback] = useState(false);

  function changeFormat(next: LinkedInFormat) {
    setFormat(next);
    setStyle(defaultLinkedInStyle(next));
  }

  const text = buildLinkedInBio(stack, format, style, professionalTitle);
  const isHeadline = format === "headline";
  const length = isHeadline ? linkedInHeadlineLength(text) : text.length;
  const limit = isHeadline ? LINKEDIN_HEADLINE_LIMIT : null;

  async function copy() {
    setSelectFallback(false);
    if (!text) {
      setStatus("Add tools to your stack first.");
      return;
    }
    if (await copyText(text)) {
      setStatus("Copied for LinkedIn ✓");
      track({ name: "bio_copied", props: { platform: "linkedin" } });
      return;
    }
    setSelectFallback(true);
    setStatus("Clipboard blocked — select the text below and copy manually.");
  }

  return (
    <FormatModule
      id="format-linkedin-bio"
      title="LinkedIn Bio & About"
      layout="below"
      compact
      controls={
        <>
          <Segmented label="LinkedIn format" value={format} options={FORMATS} onChange={changeFormat} />
          <Segmented label="Visual style" value={style} options={STYLES} onChange={setStyle} />
        </>
      }
      preview={
        <div className="flex w-full min-w-0 flex-col gap-2.5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-sf-muted">Your professional title (optional)</span>
            <input
              type="text"
              value={professionalTitle}
              onChange={(e) => setLinkedInTitle(e.target.value)}
              placeholder="e.g. Product Manager, Designer, Marketing Specialist"
              maxLength={80}
              className={`h-10 w-full rounded-full border border-[#DAD7CF] bg-white px-3.5 text-[13px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sf-subtle">Preview</span>
              {limit !== null && (
                <span className={`text-[11px] font-medium tabular-nums ${length > limit ? "text-red-700" : "text-sf-subtle"}`}>
                  {length}/{limit}
                </span>
              )}
            </div>
            <pre
              tabIndex={0}
              className={`min-h-[5.5rem] whitespace-pre-wrap rounded-[12px] border border-[#E5E1D8] bg-white p-3 font-sans text-[13.5px] leading-relaxed text-sf-ver ${
                selectFallback ? "ring-2 ring-sf-blue" : ""
              }`}
            >
              {text || "Add tools to your stack to generate LinkedIn text."}
            </pre>
          </div>
        </div>
      }
      actions={
        <ShareActions status={status} inline>
          <UtilityButton onClick={() => void copy()} disabled={!text}>
            Copy for LinkedIn
          </UtilityButton>
        </ShareActions>
      }
    />
  );
}
