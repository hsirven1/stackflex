"use client";

import { useState } from "react";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { ProviderMark } from "@/components/experiments/ai-portfolio/ProviderMark";
import { copyText } from "@/lib/clipboard";
import {
  EXTRACTION_PROMPT,
  assistantLabel,
  assistantOpenUrl,
} from "@/lib/experiments/ai-portfolio/prompt";
import type { AssistantProvider } from "@/lib/experiments/ai-portfolio/types";

export function StepCopy({
  provider,
  onProviderChange,
  onContinue,
}: {
  provider: AssistantProvider;
  onProviderChange: (p: AssistantProvider) => void;
  onContinue: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const label = assistantLabel(provider);

  async function handleCopy() {
    if (await copyText(EXTRACTION_PROMPT)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
  }

  function openAssistant() {
    window.open(assistantOpenUrl(provider), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[28px] font-medium leading-[1.05] tracking-[-0.04em] text-sf-ink sm:text-[32px]">
          Let’s find your AI work.
        </h2>
        <p className="mt-2 max-w-[46ch] text-[15px] leading-snug text-sf-body">
          We’ll ask your AI assistant to identify projects and workflows you’ve worked on together.
        </p>
      </div>

      <div role="radiogroup" aria-label="Choose your AI assistant" className="grid gap-3 sm:grid-cols-2">
        {(["chatgpt", "claude"] as const).map((p) => {
          const selected = provider === p;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onProviderChange(p)}
              className={`flex items-center gap-3 rounded-[18px] border px-4 py-3.5 text-left transition-colors ${focusRing} ${
                selected
                  ? "border-sf-ink bg-white shadow-[0_10px_30px_-24px_rgba(11,11,12,.45)]"
                  : "border-[#E7E4DC] bg-[#FBFaf7] hover:border-[#D7D3C8]"
              }`}
            >
              <ProviderMark provider={p} size={24} />
              <span className="font-semibold text-sf-ink">{assistantLabel(p)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PrimaryButton size="md" onClick={() => void handleCopy()}>
          {copied ? (
            <>
              Copied <Check className="size-4" aria-hidden="true" />
            </>
          ) : (
            "Copy prompt"
          )}
        </PrimaryButton>
        <SecondaryButton size="md" onClick={openAssistant}>
          Open {label}
          <ExternalLink className="ml-2 size-4 opacity-70" aria-hidden="true" />
        </SecondaryButton>
      </div>

      {copied && (
        <p className="rounded-[14px] bg-[#F4FBF0] px-4 py-3 text-[14px] leading-snug text-sf-ink" role="status">
          Prompt copied. Open {label} in the new tab, paste it there, then come back with the full response.
        </p>
      )}

      <p className="text-[14px] leading-snug text-sf-body">
        Paste the prompt into your AI assistant. When it replies, copy the full response and come back here.
      </p>
      <p className="text-[13px] leading-snug text-sf-muted">
        Tip: for the most complete result, use a conversation or project where you’ve already discussed your work.
        Your assistant may not have access to your entire chat history.
      </p>

      <div>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing}`}
          aria-expanded={showPrompt}
          onClick={() => setShowPrompt((v) => !v)}
        >
          View prompt
          <ChevronDown className={`size-4 transition-transform ${showPrompt ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
        {showPrompt && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-[16px] border border-[#E7E4DC] bg-[#FBFAf7] p-4 text-[12px] leading-relaxed whitespace-pre-wrap text-sf-body">
            {EXTRACTION_PROMPT}
          </pre>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#EEECE6] pt-5">
        <TextButton onClick={onContinue}>I’ve already copied it — continue</TextButton>
        <PrimaryButton size="sm" onClick={onContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
