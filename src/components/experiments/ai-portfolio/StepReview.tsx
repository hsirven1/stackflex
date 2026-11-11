"use client";

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { PortfolioPreview } from "@/components/experiments/ai-portfolio/PortfolioPreview";
import {
  EVIDENCE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type DraftProject,
  type ExperimentState,
  type ProjectStatus,
} from "@/lib/experiments/ai-portfolio/types";
import {
  addManualDraftProject,
  downloadReviewedJson,
  removeDraftProject,
  reorderDraftProject,
  startOverKeepProvider,
  updateDraftProject,
} from "@/lib/experiments/ai-portfolio/store";

function csvToList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function ProjectEditor({
  project,
  onClose,
}: {
  project: DraftProject;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [summary, setSummary] = useState(project.summary);
  const [contribution, setContribution] = useState(project.myContribution);
  const [aiUse, setAiUse] = useState(project.aiUse);
  const [tools, setTools] = useState(project.tools.join(", "));
  const [outcome, setOutcome] = useState(project.outcome);
  const [status, setStatus] = useState<ProjectStatus>(project.status);

  function save() {
    updateDraftProject(project.id, {
      title: title.trim().slice(0, 120) || project.title,
      summary: summary.trim().slice(0, 600) || project.summary,
      myContribution: contribution.trim().slice(0, 320),
      aiUse: aiUse.trim().slice(0, 320),
      tools: csvToList(tools),
      outcome: outcome.trim().slice(0, 280),
      status,
      needsReview: [],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-6">
      <button type="button" aria-label="Close editor" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit project"
        className="relative z-10 max-h-[92svh] w-full max-w-[560px] overflow-auto rounded-t-[24px] bg-white p-5 shadow-xl sm:rounded-[24px] sm:p-6"
      >
        <h3 className="font-display text-[22px] font-medium tracking-[-0.03em]">Edit project</h3>
        <div className="mt-4 space-y-3">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className={inputClass} />
          </Field>
          <Field label="Your contribution">
            <textarea value={contribution} onChange={(e) => setContribution(e.target.value)} rows={2} className={inputClass} />
          </Field>
          <Field label="How AI was used">
            <textarea value={aiUse} onChange={(e) => setAiUse(e.target.value)} rows={2} className={inputClass} />
          </Field>
          <Field label="Tools (comma-separated)">
            <input value={tools} onChange={(e) => setTools(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Outcome">
            <input value={outcome} onChange={(e) => setOutcome(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className={inputClass}
            >
              <option value="completed">Completed</option>
              <option value="in_progress">In progress</option>
              <option value="planned">Idea / planned</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <SecondaryButton size="sm" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton size="sm" onClick={save}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12px] font-semibold text-sf-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass = `w-full rounded-[12px] border border-[#E7E4DC] bg-white px-3 py-2 text-[14px] text-sf-ink ${focusRing}`;

function ProjectCard({
  project,
  index,
  total,
  onEdit,
}: {
  project: DraftProject;
  index: number;
  total: number;
  onEdit: () => void;
}) {
  return (
    <article
      className={`rounded-[20px] border px-4 py-4 sm:px-5 ${
        project.included ? "border-[#E7E4DC] bg-white" : "border-dashed border-[#E0DDD4] bg-[#F7F5F0] opacity-80"
      }`}
    >
      <div className="flex items-start gap-3">
        <label className="mt-1 flex items-center gap-2">
          <input
            type="checkbox"
            checked={project.included}
            onChange={(e) => updateDraftProject(project.id, { included: e.target.checked })}
            className="size-4 accent-[#3A2EFF]"
          />
          <span className="sr-only">Include {project.title}</span>
        </label>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sf-ink">{project.title}</h3>
            <span className="rounded-full bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-semibold text-sf-muted">
              {PROJECT_TYPE_LABEL[project.type]}
            </span>
            <span className="rounded-full bg-[#F1EFEA] px-2 py-0.5 text-[11px] font-semibold text-sf-muted">
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          </div>
          <p className="mt-1.5 text-[14px] leading-snug text-sf-body">{project.summary}</p>

          <dl className="mt-3 space-y-1.5 text-[13px] leading-snug text-sf-body">
            {project.myContribution && (
              <div>
                <dt className="inline font-semibold text-sf-ink">Contribution: </dt>
                <dd className="inline">{project.myContribution}</dd>
              </div>
            )}
            {project.aiUse && (
              <div>
                <dt className="inline font-semibold text-sf-ink">AI use: </dt>
                <dd className="inline">{project.aiUse}</dd>
              </div>
            )}
            {project.tools.length > 0 && (
              <div>
                <dt className="inline font-semibold text-sf-ink">Tools: </dt>
                <dd className="inline">{project.tools.join(", ")}</dd>
              </div>
            )}
            {project.capabilities.length > 0 && (
              <div>
                <dt className="inline font-semibold text-sf-ink">Capabilities: </dt>
                <dd className="inline">{project.capabilities.join(", ")}</dd>
              </div>
            )}
            {project.outcome && (
              <div>
                <dt className="inline font-semibold text-sf-ink">Outcome: </dt>
                <dd className="inline">{project.outcome}</dd>
              </div>
            )}
          </dl>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#E7E4DC] px-2.5 py-1 text-[11px] font-semibold text-sf-muted">
              {EVIDENCE_LABEL[project.evidence.kind]}
            </span>
            {project.needsReview.length > 0 && (
              <span className="rounded-full bg-[#FFF4E8] px-2.5 py-1 text-[11px] font-semibold text-[#8A5A12]">
                Needs your review
              </span>
            )}
          </div>
          {project.needsReview.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-[#8A5A12]">
              {project.needsReview.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {project.evidence.note && (
            <p className="mt-2 text-[12px] text-sf-muted">{project.evidence.note}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#F0EEE8] pt-3">
        <button type="button" className={`rounded-full p-2 text-sf-muted hover:bg-[#F1EFEA] hover:text-sf-ink ${focusRing}`} onClick={onEdit} aria-label={`Edit ${project.title}`}>
          <Pencil className="size-4" />
        </button>
        <button
          type="button"
          className={`rounded-full p-2 text-sf-muted hover:bg-[#F1EFEA] hover:text-sf-ink ${focusRing}`}
          onClick={() => reorderDraftProject(project.id, "up")}
          disabled={index === 0}
          aria-label="Move up"
        >
          <ArrowUp className="size-4" />
        </button>
        <button
          type="button"
          className={`rounded-full p-2 text-sf-muted hover:bg-[#F1EFEA] hover:text-sf-ink ${focusRing}`}
          onClick={() => reorderDraftProject(project.id, "down")}
          disabled={index >= total - 1}
          aria-label="Move down"
        >
          <ArrowDown className="size-4" />
        </button>
        <button
          type="button"
          className={`rounded-full p-2 text-sf-muted hover:bg-[#FFF1EE] hover:text-[#B42318] ${focusRing}`}
          onClick={() => removeDraftProject(project.id)}
          aria-label={`Remove ${project.title}`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </article>
  );
}

export function StepReview({
  state,
  emptyNotice,
  onBackToPaste,
}: {
  state: ExperimentState;
  emptyNotice: boolean;
  onBackToPaste: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const sorted = [...state.projects].sort((a, b) => a.order - b.order);
  const includedCount = sorted.filter((p) => p.included).length;
  const editing = sorted.find((p) => p.id === editingId) ?? null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-[28px] font-medium leading-[1.05] tracking-[-0.04em] text-sf-ink sm:text-[32px]">
          Here’s what we found.
        </h2>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-snug text-sf-body">
          Review these suggestions before deciding what to showcase.
        </p>
        <p className="mt-2 text-[13px] font-semibold text-sf-muted">
          {sorted.length} project{sorted.length === 1 ? "" : "s"} extracted · {includedCount} included
        </p>
      </div>

      {state.scope?.limitations && (
        <p className="rounded-[14px] bg-[#F7F5FF] px-4 py-3 text-[13px] leading-snug text-sf-body">
          Based on the information your assistant could access. {state.scope.limitations}
        </p>
      )}

      {emptyNotice && sorted.length === 0 && (
        <div className="rounded-[18px] border border-[#E7E4DC] bg-[#FBFAf7] px-5 py-5">
          <p className="font-semibold text-sf-ink">No projects found this time.</p>
          <p className="mt-1.5 text-[14px] leading-snug text-sf-body">
            Your assistant may not have had enough context. Try again from a conversation where you’ve discussed real
            work, or add a project manually.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <SecondaryButton size="sm" onClick={onBackToPaste}>
              Try another response
            </SecondaryButton>
            <PrimaryButton size="sm" onClick={() => addManualDraftProject()}>
              Add a project manually
            </PrimaryButton>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="space-y-3">
          {sorted.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={sorted.length}
              onEdit={() => setEditingId(project.id)}
            />
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <SecondaryButton size="sm" onClick={() => addManualDraftProject()}>
              Add a project
            </SecondaryButton>
            <SecondaryButton size="sm" onClick={onBackToPaste}>
              Paste another response
            </SecondaryButton>
            <TextButton onClick={() => startOverKeepProvider()}>Start over</TextButton>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <PortfolioPreview projects={sorted} />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <PrimaryButton size="sm" onClick={() => downloadReviewedJson(state)} disabled={includedCount === 0}>
              Download portfolio data
            </PrimaryButton>
            <p className="text-[12px] leading-snug text-sf-muted">
              Saves your reviewed draft as a file. Nothing is published.
            </p>
          </div>
        </div>
      </div>

      {editing && <ProjectEditor project={editing} onClose={() => setEditingId(null)} />}
    </section>
  );
}
