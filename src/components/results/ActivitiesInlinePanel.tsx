"use client";

import { Check, Plus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { ToolTag } from "@/components/stackflex/profile/ToolTag";
import { focusRing } from "@/components/stackflex/Controls";
import {
  ACTIVITY_LABEL_MAX,
  INITIAL_SUGGESTION_COUNT,
  MAX_ACTIVITIES,
  allSuggestionsForSelectedTools,
  createActivity,
  normalizeActivityLabel,
  setActivities,
  suggestionFamilyKey,
  type Activity,
  type ActivitySuggestion,
} from "@/lib/activities";
import type { Tool } from "@/lib/stackflex/tools";

type Props = {
  tools: Tool[];
  activities: Activity[];
};

/**
 * Results-only inline “How I use AI” editor.
 * Suggestions toggle immediately with pre-assigned tools — no modal.
 */
export function ActivitiesInlinePanel({ tools, activities }: Props) {
  const stackIds = useMemo(
    () => tools.map((t) => t.id).filter((id) => !id.startsWith("custom:")),
    [tools],
  );
  const toolsById = useMemo(() => new Map(tools.map((t) => [t.id, t])), [tools]);
  const [expanded, setExpanded] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customTools, setCustomTools] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedKeys = useMemo(
    () => new Set(activities.map((a) => normalizeActivityLabel(a.label))),
    [activities],
  );
  const selectedFamilies = useMemo(
    () => new Set(activities.map((a) => suggestionFamilyKey(a.label))),
    [activities],
  );

  const allSuggestions = useMemo(
    () => allSuggestionsForSelectedTools(stackIds),
    [stackIds],
  );

  const visibleSuggestions = useMemo(() => {
    const unselected = allSuggestions.filter(
      (s) =>
        !selectedKeys.has(normalizeActivityLabel(s.label)) &&
        !selectedFamilies.has(suggestionFamilyKey(s.label)),
    );
    return expanded ? unselected : unselected.slice(0, INITIAL_SUGGESTION_COUNT);
  }, [allSuggestions, selectedKeys, selectedFamilies, expanded]);

  const hiddenCount = useMemo(() => {
    const unselected = allSuggestions.filter(
      (s) =>
        !selectedKeys.has(normalizeActivityLabel(s.label)) &&
        !selectedFamilies.has(suggestionFamilyKey(s.label)),
    );
    return Math.max(0, unselected.length - INITIAL_SUGGESTION_COUNT);
  }, [allSuggestions, selectedKeys, selectedFamilies]);

  function persist(next: Activity[]) {
    setActivities(next.slice(0, MAX_ACTIVITIES));
  }

  function toggleSuggestion(suggestion: ActivitySuggestion) {
    const key = normalizeActivityLabel(suggestion.label);
    const family = suggestionFamilyKey(suggestion.label);
    const existing = activities.find(
      (a) =>
        normalizeActivityLabel(a.label) === key || suggestionFamilyKey(a.label) === family,
    );
    if (existing) {
      persist(activities.filter((a) => a.id !== existing.id));
      return;
    }
    if (activities.length >= MAX_ACTIVITIES) return;
    const toolIds = suggestion.candidateToolIds.filter((id) => toolsById.has(id));
    if (!toolIds.length) return;
    persist([
      ...activities,
      createActivity({
        label: suggestion.label,
        toolIds,
        source: "suggested",
      }),
    ]);
  }

  function removeActivity(id: string) {
    persist(activities.filter((a) => a.id !== id));
  }

  function saveCustom(e: FormEvent) {
    e.preventDefault();
    const label = customLabel.trim();
    if (!label || customTools.length === 0) return;
    if (editingId) {
      persist(
        activities.map((a) =>
          a.id === editingId
            ? { ...a, label: label.slice(0, ACTIVITY_LABEL_MAX), toolIds: [...customTools], source: "custom" }
            : a,
        ),
      );
    } else {
      if (activities.length >= MAX_ACTIVITIES) return;
      persist([
        ...activities,
        createActivity({ label, toolIds: customTools, source: "custom" }),
      ]);
    }
    setCustomLabel("");
    setCustomTools([]);
    setCustomOpen(false);
    setEditingId(null);
  }

  function startEditCustom(activity: Activity) {
    setEditingId(activity.id);
    setCustomLabel(activity.label);
    setCustomTools([...activity.toolIds]);
    setCustomOpen(true);
  }

  const canSelect = stackIds.length > 0;

  return (
    <section className="flex flex-col gap-3" aria-label="How I use AI">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-xl font-medium leading-none tracking-[-0.035em]">
          How I use AI
        </h2>
        {canSelect && (
          <p className="text-[13px] leading-snug text-sf-muted">
            Select the activities that reflect how you work with AI.
          </p>
        )}
      </div>

      {!canSelect ? (
        <p className="text-[13px] text-sf-muted">Add tools to see activity suggestions.</p>
      ) : (
        <>
          {activities.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  label={activity.label}
                  toolIds={activity.toolIds}
                  toolsById={toolsById}
                  selected
                  onToggle={() => removeActivity(activity.id)}
                  onEdit={
                    activity.source === "custom" ? () => startEditCustom(activity) : undefined
                  }
                />
              ))}
            </ul>
          )}

          {visibleSuggestions.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {visibleSuggestions.map((suggestion) => (
                <ActivityRow
                  key={suggestion.id}
                  label={suggestion.label}
                  toolIds={suggestion.candidateToolIds}
                  toolsById={toolsById}
                  selected={false}
                  onToggle={() => toggleSuggestion(suggestion)}
                />
              ))}
            </ul>
          )}

          {!expanded && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={`self-start text-[12.5px] font-semibold text-sf-muted transition-colors hover:text-sf-ink ${focusRing} rounded-md`}
            >
              Show more
            </button>
          )}

          {expanded && allSuggestions.length > INITIAL_SUGGESTION_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className={`self-start text-[12.5px] font-semibold text-sf-muted transition-colors hover:text-sf-ink ${focusRing} rounded-md`}
            >
              Show less
            </button>
          )}

          {!customOpen ? (
            <button
              type="button"
              onClick={() => {
                setCustomOpen(true);
                setEditingId(null);
                setCustomLabel("");
                setCustomTools(stackIds.slice(0, 1));
              }}
              disabled={activities.length >= MAX_ACTIVITIES}
              className={`mt-1 inline-flex h-8 items-center gap-1.5 self-start rounded-full px-3 text-[12.5px] font-semibold text-sf-ink shadow-[inset_0_0_0_1px_#E6E3DC] transition-colors hover:shadow-[inset_0_0_0_1px_#CFCBC1] disabled:opacity-40 ${focusRing}`}
            >
              <Plus size={14} strokeWidth={2.4} aria-hidden />
              Add my own
            </button>
          ) : (
            <form
              onSubmit={saveCustom}
              className="mt-1 flex flex-col gap-2.5 rounded-[14px] border border-[#E6E3DC] bg-[#FAF9F6] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-sf-ink">
                  {editingId ? "Edit activity" : "Custom activity"}
                </span>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => {
                    setCustomOpen(false);
                    setEditingId(null);
                  }}
                  className={`rounded-md p-1 text-sf-muted hover:text-sf-ink ${focusRing}`}
                >
                  <X size={14} strokeWidth={2.2} />
                </button>
              </div>
              <label className="flex flex-col gap-1">
                <span className="sr-only">Activity title</span>
                <input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value.slice(0, ACTIVITY_LABEL_MAX))}
                  placeholder="e.g. Review customer interviews"
                  maxLength={ACTIVITY_LABEL_MAX}
                  className={`h-9 rounded-[10px] border border-[#DAD7CF] bg-white px-3 text-[13px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
                  autoFocus
                />
              </label>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-[11px] font-semibold tracking-[0.04em] text-sf-muted uppercase">
                  Associated tools
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  {tools.map((tool) => {
                    const on = customTools.includes(tool.id);
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setCustomTools((prev) =>
                            on ? prev.filter((id) => id !== tool.id) : [...prev, tool.id],
                          )
                        }
                        className={`inline-flex items-center rounded-full px-0.5 ${focusRing}`}
                      >
                        <span
                          className={
                            on
                              ? "rounded-full shadow-[0_0_0_2px_#3A2EFF]"
                              : "rounded-full opacity-70"
                          }
                        >
                          <ToolTag tool={tool} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!customLabel.trim() || customTools.length === 0}
                  className={`inline-flex h-8 items-center rounded-full bg-sf-ink px-3.5 text-[12.5px] font-semibold text-white disabled:opacity-40 ${focusRing}`}
                >
                  {editingId ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomOpen(false);
                    setEditingId(null);
                  }}
                  className={`text-[12.5px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing} rounded-md`}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}

function ActivityRow({
  label,
  toolIds,
  toolsById,
  selected,
  onToggle,
  onEdit,
}: {
  label: string;
  toolIds: string[];
  toolsById: Map<string, Tool>;
  selected: boolean;
  onToggle: () => void;
  onEdit?: () => void;
}) {
  const tags = toolIds.map((id) => toolsById.get(id)).filter((t): t is Tool => Boolean(t));
  return (
    <li>
      <div
        className={`flex flex-col gap-1.5 rounded-[12px] px-2.5 py-2 transition-colors sm:flex-row sm:items-center sm:gap-3 ${
          selected
            ? "bg-[#F3F1FF] shadow-[inset_0_0_0_1px_rgba(58,46,255,.22)]"
            : "hover:bg-[#FAF9F6]"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={`flex min-w-0 flex-1 items-start gap-2.5 text-left ${focusRing} rounded-md`}
        >
          <span
            aria-hidden
            className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full ${
              selected
                ? "bg-[#3A2EFF] text-white"
                : "shadow-[inset_0_0_0_1.5px_#D2CEC4] bg-white"
            }`}
          >
            {selected && <Check size={11} strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold leading-snug tracking-[-0.015em] text-sf-ink">
              {label}
            </span>
            {tags.length > 0 && (
              <span className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <ToolTag key={t.id} tool={t} />
                ))}
              </span>
            )}
          </span>
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className={`shrink-0 self-start text-[11.5px] font-semibold text-sf-muted hover:text-sf-ink sm:self-center ${focusRing} rounded-md`}
          >
            Edit
          </button>
        )}
      </div>
    </li>
  );
}
