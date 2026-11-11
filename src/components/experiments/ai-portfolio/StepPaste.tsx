"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { copyText } from "@/lib/clipboard";
import { parsePortfolioImport } from "@/lib/experiments/ai-portfolio/parse";
import { FORMAT_FIX_PROMPT, assistantLabel } from "@/lib/experiments/ai-portfolio/prompt";
import { applyImport, addManualDraftProject } from "@/lib/experiments/ai-portfolio/store";
import type { AssistantProvider } from "@/lib/experiments/ai-portfolio/types";

export function StepPaste({
  provider,
  onBack,
  onEmpty,
}: {
  provider: AssistantProvider;
  onBack: () => void;
  onEmpty: () => void;
}) {
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [fixCopied, setFixCopied] = useState(false);

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setPaste(text);
        setError("");
        setHint("");
      }
    } catch {
      setError("Clipboard access isn’t available here. Paste with ⌘V / Ctrl+V instead.");
      setHint("");
    }
  }

  function generate() {
    setError("");
    setHint("");
    const result = parsePortfolioImport(paste, provider);
    if (!result.ok) {
      setError(result.error);
      setHint(result.hint ?? "");
      return;
    }
    // Never persist the raw paste — only structured drafts via applyImport.
    applyImport(result.report.projects, result.report.scope, provider);
    setPaste("");
    if (result.report.projects.length === 0) onEmpty();
  }

  async function copyFixPrompt() {
    if (await copyText(FORMAT_FIX_PROMPT)) {
      setFixCopied(true);
      window.setTimeout(() => setFixCopied(false), 2000);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[28px] font-medium leading-[1.05] tracking-[-0.04em] text-sf-ink sm:text-[32px]">
          Got your result?
        </h2>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-snug text-sf-body">
          Copy your assistant’s full response and paste it below. We’ll turn it into an editable portfolio draft.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="ai-portfolio-paste" className="text-[13px] font-semibold text-sf-ink">
            Paste response from {assistantLabel(provider)}
          </label>
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-sf-blue ${focusRing}`}
          >
            <ClipboardPaste className="size-3.5" aria-hidden="true" />
            Paste from clipboard
          </button>
        </div>
        <textarea
          id="ai-portfolio-paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={12}
          spellCheck={false}
          placeholder="Paste the full response here…"
          className={`w-full resize-y rounded-[18px] border border-[#E7E4DC] bg-white px-4 py-3 font-mono text-[13px] leading-relaxed text-sf-ink placeholder:text-sf-muted ${focusRing}`}
        />
        <p className="text-[13px] leading-snug text-sf-muted">
          Only paste information you’re comfortable reviewing here. Your draft stays in this browser during this
          experiment.
        </p>
      </div>

      {error && (
        <div className="space-y-3 rounded-[16px] border border-[#F0D9D4] bg-[#FFF8F6] px-4 py-3" role="alert">
          <p className="text-[14px] font-semibold text-sf-ink">{error}</p>
          {hint && <p className="text-[13px] leading-snug text-sf-body">{hint}</p>}
          <div className="flex flex-wrap gap-2">
            <SecondaryButton size="sm" onClick={() => { setError(""); setHint(""); }}>
              Try pasting again
            </SecondaryButton>
            <SecondaryButton size="sm" onClick={() => void copyFixPrompt()}>
              {fixCopied ? "Fix prompt copied" : "Copy a formatting fix prompt"}
            </SecondaryButton>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#EEECE6] pt-5 sm:flex-row sm:items-center">
        <TextButton onClick={onBack}>← Back</TextButton>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TextButton
            onClick={() => {
              addManualDraftProject();
            }}
          >
            Add a project manually
          </TextButton>
          <PrimaryButton size="sm" onClick={generate} disabled={!paste.trim()}>
            Generate my portfolio
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
