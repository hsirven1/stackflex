"use client";

import { useState, type ReactNode } from "react";
import { focusRing, PrimaryButton, TextButton } from "@/components/stackflex/Controls";
import type { WorkStatus, WorkType } from "@/lib/portfolio/types";
import { WORK_STATUS_LABEL, WORK_TYPE_LABEL } from "@/lib/portfolio/types";

export interface ExperienceDraft {
  title: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  tools: string;
  capabilities: string;
  outcome: string;
  link: string;
}

const EMPTY: ExperienceDraft = {
  title: "",
  description: "",
  type: "project",
  status: "completed",
  tools: "",
  capabilities: "",
  outcome: "",
  link: "",
};

function splitTags(raw: string): string[] {
  return raw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function ExperienceForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ExperienceDraft>;
  submitLabel: string;
  onSubmit: (data: {
    title: string;
    description: string;
    type: WorkType;
    status: WorkStatus;
    tools: string[];
    capabilities: string[];
    outcome?: string;
    link?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ExperienceDraft>({ ...EMPTY, ...initial });
  const [error, setError] = useState("");

  function save() {
    if (!draft.title.trim() || !draft.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    onSubmit({
      title: draft.title.trim(),
      description: draft.description.trim(),
      type: draft.type,
      status: draft.status,
      tools: splitTags(draft.tools),
      capabilities: splitTags(draft.capabilities),
      outcome: draft.outcome.trim() || undefined,
      link: draft.link.trim() || undefined,
    });
  }

  const field = "w-full rounded-[12px] border border-[#DAD7CF] bg-white px-3.5 py-2.5 text-[14px] text-sf-ink";

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-[#ECEAE4] bg-[#FAF9F6] p-4">
      <Field label="Title">
        <input
          className={`${field} ${focusRing}`}
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          maxLength={120}
        />
      </Field>
      <Field label="Description">
        <textarea
          className={`${field} min-h-[88px] resize-y ${focusRing}`}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          maxLength={600}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            className={`${field} ${focusRing}`}
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as WorkType }))}
          >
            {(Object.keys(WORK_TYPE_LABEL) as WorkType[]).map((t) => (
              <option key={t} value={t}>
                {WORK_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            className={`${field} ${focusRing}`}
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as WorkStatus }))}
          >
            {(Object.keys(WORK_STATUS_LABEL) as WorkStatus[]).map((s) => (
              <option key={s} value={s}>
                {WORK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Related tools (comma-separated)">
        <input
          className={`${field} ${focusRing}`}
          value={draft.tools}
          onChange={(e) => setDraft((d) => ({ ...d, tools: e.target.value }))}
          placeholder="Claude, Cursor"
        />
      </Field>
      <Field label="Capabilities (comma-separated)">
        <input
          className={`${field} ${focusRing}`}
          value={draft.capabilities}
          onChange={(e) => setDraft((d) => ({ ...d, capabilities: e.target.value }))}
          placeholder="Research, Prototyping"
        />
      </Field>
      <Field label="Outcome (optional)">
        <input
          className={`${field} ${focusRing}`}
          value={draft.outcome}
          onChange={(e) => setDraft((d) => ({ ...d, outcome: e.target.value }))}
        />
      </Field>
      <Field label="Link (optional)">
        <input
          className={`${field} ${focusRing}`}
          value={draft.link}
          onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
          placeholder="https://"
        />
      </Field>
      {error && (
        <p role="alert" className="text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <TextButton type="button" onClick={onCancel} className="text-sm">
          Cancel
        </TextButton>
        <PrimaryButton size="sm" onClick={save}>
          {submitLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[12px] font-semibold text-sf-muted">
      {label}
      {children}
    </label>
  );
}
