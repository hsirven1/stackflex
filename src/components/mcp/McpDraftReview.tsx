"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/stackflex/Brand";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { PortfolioPreview } from "@/components/experiments/ai-portfolio/PortfolioPreview";
import {
  EVIDENCE_LABEL,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPE_LABEL,
  type DraftProject,
  type ProjectStatus,
} from "@/lib/experiments/ai-portfolio/types";
import type { McpDraftStatus, McpPortfolioDraft } from "@/lib/mcp/draft-token";

function csvToList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function McpDraftReview({ initialDraft }: { initialDraft: McpPortfolioDraft }) {
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState<McpDraftStatus>(initialDraft.status);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [publishedLocally, setPublishedLocally] = useState(false);

  const sorted = useMemo(
    () => [...draft.projects].sort((a, b) => a.order - b.order),
    [draft.projects],
  );
  const includedCount = sorted.filter((p) => p.included).length;
  const editing = sorted.find((p) => p.id === editingId) ?? null;

  function updateProject(id: string, patch: Partial<DraftProject>) {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p)),
    }));
    setStatus("draft");
    setPublishedLocally(false);
  }

  function removeProject(id: string) {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects
        .filter((p) => p.id !== id)
        .map((p, order) => ({ ...p, order })),
    }));
    setStatus("draft");
    setPublishedLocally(false);
  }

  function reorder(id: string, direction: "up" | "down") {
    setDraft((prev) => {
      const list = [...prev.projects].sort((a, b) => a.order - b.order);
      const i = list.findIndex((p) => p.id === id);
      if (i < 0) return prev;
      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return prev;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...prev, projects: list.map((p, order) => ({ ...p, order })) };
    });
    setStatus("draft");
    setPublishedLocally(false);
  }

  function downloadJson() {
    const included = sorted.filter((p) => p.included);
    const payload = {
      format: "stackflex-portfolio-import-v1",
      draftId: draft.id,
      status,
      published: false,
      exportedAt: new Date().toISOString(),
      provider: draft.provider,
      scope: draft.scope,
      projects: included.map((p) => ({
        title: p.title,
        summary: p.summary,
        type: p.type,
        status: p.status,
        myContribution: p.myContribution || null,
        aiUse: p.aiUse || null,
        tools: p.tools,
        capabilities: p.capabilities,
        outcome: p.outcome || null,
        evidence: p.evidence,
        needsReview: p.needsReview,
      })),
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stackflex-mcp-draft-${draft.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function confirmPublish() {
    if (includedCount === 0) return;
    const ok = window.confirm(
      "Confirm you’ve reviewed these projects. This does not create a public hosted portfolio — it marks this draft as reviewed and downloads your data.",
    );
    if (!ok) return;
    setStatus("reviewed");
    setPublishedLocally(true);
    downloadJson();
  }

  return (
    <div className="relative min-h-svh bg-[#F7F5F0] text-sf-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#EDEAE3 1px, transparent 1px), linear-gradient(90deg, #EDEAE3 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(70% 60% at 50% 20%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 pb-20 pt-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className={`inline-flex items-center gap-2 rounded-full ${focusRing}`}>
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3 text-[12px] text-sf-muted">
            <span className="rounded-full border border-[#E0DCCF] bg-white/80 px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase">
              Private draft
            </span>
            <span>{status === "reviewed" ? "Reviewed" : "Unpublished"}</span>
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-[720px] sm:mt-12">
          <h1 className="font-display text-[32px] font-medium leading-[1.02] tracking-[-0.04em] sm:text-[40px]">
            Review your AI portfolio draft
          </h1>
          <p className="mt-3 max-w-[48ch] text-[15px] leading-snug text-sf-body">
            This draft was created by your AI assistant through StackFlex MCP. Edit anything inaccurate before you
            confirm. Nothing is public yet.
          </p>
          {draft.scope.limitations && (
            <p className="mt-4 rounded-[14px] bg-[#F7F5FF] px-4 py-3 text-[13px] leading-snug text-sf-body">
              Based on the information your assistant could access. {draft.scope.limitations}
            </p>
          )}
          <p className="mt-3 text-[13px] font-semibold text-sf-muted">
            {sorted.length} project{sorted.length === 1 ? "" : "s"} · {includedCount} included
          </p>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div className="space-y-3">
            {sorted.map((project, index) => (
              <article
                key={project.id}
                className={`rounded-[20px] border px-4 py-4 sm:px-5 ${
                  project.included
                    ? "border-[#E7E4DC] bg-white"
                    : "border-dashed border-[#E0DDD4] bg-[#F7F5F0] opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <label className="mt-1">
                    <input
                      type="checkbox"
                      checked={project.included}
                      onChange={(e) => updateProject(project.id, { included: e.target.checked })}
                      className="size-4 accent-[#3A2EFF]"
                    />
                    <span className="sr-only">Include {project.title}</span>
                  </label>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-sf-ink">{project.title}</h2>
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
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#F0EEE8] pt-3">
                  <SecondaryButton size="sm" onClick={() => setEditingId(project.id)}>
                    Edit
                  </SecondaryButton>
                  <SecondaryButton size="sm" onClick={() => reorder(project.id, "up")} disabled={index === 0}>
                    Up
                  </SecondaryButton>
                  <SecondaryButton
                    size="sm"
                    onClick={() => reorder(project.id, "down")}
                    disabled={index >= sorted.length - 1}
                  >
                    Down
                  </SecondaryButton>
                  <TextButton onClick={() => removeProject(project.id)}>Remove</TextButton>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            <PortfolioPreview projects={sorted} />
            <div className="flex flex-col gap-2">
              <PrimaryButton size="sm" onClick={confirmPublish} disabled={includedCount === 0}>
                Confirm review & download
              </PrimaryButton>
              <SecondaryButton size="sm" onClick={downloadJson} disabled={includedCount === 0}>
                Download portfolio data
              </SecondaryButton>
              {publishedLocally && (
                <p className="text-[13px] text-sf-body" role="status">
                  Marked as reviewed. No public portfolio page was created.
                </p>
              )}
              <p className="text-[12px] leading-snug text-sf-muted">
                Knowledge of this private review link grants access. Do not share it publicly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditDialog
          project={editing}
          onClose={() => setEditingId(null)}
          onSave={(patch) => {
            updateProject(editing.id, patch);
            setEditingId(null);
          }}
        />
      )}
    </div>
  );
}

function EditDialog({
  project,
  onClose,
  onSave,
}: {
  project: DraftProject;
  onClose: () => void;
  onSave: (patch: Partial<DraftProject>) => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [summary, setSummary] = useState(project.summary);
  const [contribution, setContribution] = useState(project.myContribution);
  const [aiUse, setAiUse] = useState(project.aiUse);
  const [tools, setTools] = useState(project.tools.join(", "));
  const [outcome, setOutcome] = useState(project.outcome);
  const [status, setStatus] = useState<ProjectStatus>(project.status);

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
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Description</span>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Your contribution</span>
            <textarea value={contribution} onChange={(e) => setContribution(e.target.value)} rows={2} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">How AI was used</span>
            <textarea value={aiUse} onChange={(e) => setAiUse(e.target.value)} rows={2} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Tools (comma-separated)</span>
            <input value={tools} onChange={(e) => setTools(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Outcome</span>
            <input value={outcome} onChange={(e) => setOutcome(e.target.value)} className={inputClass} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[12px] font-semibold text-sf-muted">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputClass}>
              <option value="completed">Completed</option>
              <option value="in_progress">In progress</option>
              <option value="planned">Idea / planned</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <SecondaryButton size="sm" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            size="sm"
            onClick={() =>
              onSave({
                title: title.trim().slice(0, 120) || project.title,
                summary: summary.trim().slice(0, 600) || project.summary,
                myContribution: contribution.trim().slice(0, 320),
                aiUse: aiUse.trim().slice(0, 320),
                tools: csvToList(tools),
                outcome: outcome.trim().slice(0, 280),
                status,
                needsReview: [],
              })
            }
          >
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

const inputClass = `w-full rounded-[12px] border border-[#E7E4DC] bg-white px-3 py-2 text-[14px] text-sf-ink ${focusRing}`;
