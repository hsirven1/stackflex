"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { copyText } from "@/lib/clipboard";
import { annotateDuplicates } from "@/lib/portfolio/duplicates";
import { parseActivityReport } from "@/lib/portfolio/parse";
import { CLAUDE_URL, CHATGPT_URL, EXTRACTION_PROMPT } from "@/lib/portfolio/prompt";
import { addImportedExperiences } from "@/lib/portfolio/store";
import {
  WORK_STATUS_LABEL,
  WORK_TYPE_LABEL,
  type ImportedSuggestion,
  type PortfolioExperience,
} from "@/lib/portfolio/types";

type Step = "copy" | "paste" | "select";

export function ImportModal({
  source,
  existing,
  onClose,
  onAdded,
}: {
  source: "chatgpt" | "claude";
  existing: PortfolioExperience[];
  onClose: () => void;
  onAdded: (count: number) => void;
}) {
  const titleId = useId();
  const [step, setStep] = useState<Step>("copy");
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [limitations, setLimitations] = useState<string>();
  const [suggestions, setSuggestions] = useState<ImportedSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLElement>("button, textarea")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleCopy() {
    if (await copyText(EXTRACTION_PROMPT)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function findProjects() {
    setError("");
    const result = parseActivityReport(paste, source);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const annotated = annotateDuplicates(result.suggestions, existing);
    // Default-select completed + in_progress that are not duplicates; skip planned.
    const initial = new Set(
      annotated
        .filter((s) => s.status !== "planned" && !s.duplicateOfId)
        .map((s) => s.key),
    );
    setSuggestions(annotated);
    setSelected(initial);
    setLimitations(result.limitations);
    setIncludeDuplicates(false);
    setStep("select");
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(suggestions.filter((s) => includeDuplicates || !s.duplicateOfId).map((s) => s.key)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function confirm() {
    const before = existing.length;
    addImportedExperiences(suggestions, selected, { includeDuplicates });
    // Count approximate adds
    const added = suggestions.filter((s) => selected.has(s.key) && (includeDuplicates || !s.duplicateOfId)).length;
    onAdded(added);
    void before;
    onClose();
  }

  const label = source === "chatgpt" ? "ChatGPT" : "Claude";
  const openUrl = source === "chatgpt" ? CHATGPT_URL : CLAUDE_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label="Close import" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[92svh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[24px] bg-white shadow-[0_30px_80px_-40px_rgba(11,11,12,.55)] sm:rounded-[24px]"
      >
        <header className="flex flex-none items-start justify-between gap-4 border-b border-[#EEECE6] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sf-blue">Import with {label}</p>
            <h2 id={titleId} className="mt-1 font-display text-[24px] font-medium tracking-[-0.03em]">
              {step === "copy" && "Copy the prompt"}
              {step === "paste" && "Paste the report"}
              {step === "select" && "Choose what you want to showcase"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className={`rounded-full p-2 text-sf-muted hover:bg-sf-chip hover:text-sf-ink ${focusRing}`}>
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {step === "copy" && (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] leading-snug text-sf-body">
                Ask {label} to identify projects, workflows and deliverables you’ve worked on using AI — from information it can actually access. StackFlex cannot read your chats for you.
              </p>
              <pre className="max-h-[220px] overflow-auto rounded-[16px] bg-[#FAF9F6] p-4 text-[12px] leading-relaxed text-sf-muted whitespace-pre-wrap">
                {EXTRACTION_PROMPT.slice(0, 520)}…
              </pre>
              <div className="flex flex-wrap gap-2.5">
                <PrimaryButton size="sm" onClick={() => void handleCopy()}>
                  {copied ? "Copied ✓" : "Copy prompt"}
                </PrimaryButton>
                <SecondaryButton size="sm" onClick={() => window.open(openUrl, "_blank", "noopener,noreferrer")}>
                  Open {label}
                </SecondaryButton>
              </div>
              <p className="text-[13px] text-sf-subtle">
                After {label} replies with JSON, come back and paste it in the next step.
              </p>
            </div>
          )}

          {step === "paste" && (
            <div className="flex flex-col gap-3">
              <label htmlFor="activity-paste" className="text-[15px] font-semibold">
                Paste your AI experience report
              </label>
              <textarea
                id="activity-paste"
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={12}
                spellCheck={false}
                placeholder='{"format":"stackflex-ai-activity-v1", ...}'
                className={`w-full resize-y rounded-[16px] border border-[#DAD7CF] bg-white p-4 font-mono text-[13px] leading-relaxed text-sf-ink ${focusRing}`}
              />
              {error && (
                <p role="alert" className="text-[14px] font-medium text-red-700">
                  {error}
                </p>
              )}
            </div>
          )}

          {step === "select" && (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] leading-snug text-sf-body">
                We found these experiences. Pick the ones you’d like to include in your portfolio. Nothing is added until you confirm.
              </p>
              {limitations && <p className="rounded-[14px] bg-sf-chip px-3.5 py-2.5 text-[13px] text-sf-muted">{limitations}</p>}
              {suggestions.length === 0 ? (
                <p className="text-[14px] text-sf-muted">No experiences in this report. Try another conversation or add work manually.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 text-[13px]">
                    <TextButton type="button" onClick={selectAll} className="text-sm">
                      Select all
                    </TextButton>
                    <TextButton type="button" onClick={deselectAll} className="text-sm">
                      Deselect all
                    </TextButton>
                    {suggestions.some((s) => s.duplicateOfId) && (
                      <label className="ml-auto flex items-center gap-2 text-sf-muted">
                        <input
                          type="checkbox"
                          checked={includeDuplicates}
                          onChange={(e) => setIncludeDuplicates(e.target.checked)}
                        />
                        Include likely duplicates
                      </label>
                    )}
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {suggestions.map((s) => {
                      const blocked = Boolean(s.duplicateOfId) && !includeDuplicates;
                      const checked = selected.has(s.key) && !blocked;
                      return (
                        <li key={s.key}>
                          <label
                            className={`flex cursor-pointer gap-3 rounded-[16px] border p-3.5 ${
                              checked ? "border-sf-blue bg-[#F6F5FF]" : "border-[#ECEAE4] bg-white"
                            } ${blocked ? "opacity-55" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={checked}
                              disabled={blocked}
                              onChange={() => toggle(s.key)}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-sf-ink">{s.title}</span>
                                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sf-blue">
                                  {WORK_TYPE_LABEL[s.type]}
                                </span>
                                <span className="text-[11px] text-sf-subtle">{WORK_STATUS_LABEL[s.status]}</span>
                                {s.duplicateOfId && (
                                  <span className="rounded-full bg-sf-chip px-2 py-0.5 text-[11px] font-medium text-sf-muted">
                                    Possible duplicate
                                  </span>
                                )}
                              </span>
                              <span className="mt-1 block text-[13px] leading-snug text-sf-body">{s.description}</span>
                              {s.tools.length > 0 && (
                                <span className="mt-2 flex flex-wrap gap-1">
                                  {s.tools.map((t) => (
                                    <span key={t} className="rounded-full bg-white px-2 py-0.5 text-[11px] shadow-[0_0_0_1px_#ECEAE4]">
                                      {t}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <footer className="flex flex-none flex-wrap items-center justify-between gap-3 border-t border-[#EEECE6] px-5 py-4 sm:px-6">
          {step === "copy" && (
            <>
              <TextButton type="button" onClick={onClose}>
                Cancel
              </TextButton>
              <PrimaryButton size="sm" onClick={() => setStep("paste")}>
                I’ve copied it — next
              </PrimaryButton>
            </>
          )}
          {step === "paste" && (
            <>
              <TextButton type="button" onClick={() => setStep("copy")}>
                Back
              </TextButton>
              <PrimaryButton size="sm" onClick={findProjects}>
                Find my projects
              </PrimaryButton>
            </>
          )}
          {step === "select" && (
            <>
              <TextButton type="button" onClick={() => setStep("paste")}>
                Back
              </TextButton>
              <PrimaryButton
                size="sm"
                onClick={confirm}
                disabled={
                  suggestions.filter((s) => selected.has(s.key) && (includeDuplicates || !s.duplicateOfId)).length === 0
                }
              >
                Add selected work
              </PrimaryButton>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
