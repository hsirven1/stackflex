"use client";

import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  ModelPopover,
  toolHasModels,
  type ModelPopoverTarget,
} from "@/components/guided/ModelPopover";
import { selectionIsAssistant, stackHasAssistant } from "@/components/guided/steps";
import { focusRing } from "@/components/stackflex/Controls";
import { BANNER_MAX_TOOLS } from "@/components/stackflex/results";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { catalog } from "@/lib/catalog/adapter";
import { PROFESSIONAL_ROLES, roleLabel, type ProfessionalRole } from "@/lib/profile/roles";
import { getProfile, setProfile, useProfile } from "@/lib/profile/store";
import { classifyWorkingStyle } from "@/lib/profile/workingStyle";
import { track } from "@/lib/integrations/analytics";
import { itemModelLabels } from "@/lib/selection/derive";
import {
  beginDraft,
  discardDraft,
  removeItem,
  reorderItems,
  saveDraft,
  setItemModels,
  useDraft,
} from "@/lib/selection/store";
import type { SelectedItem, StackState } from "@/lib/selection/types";
import { stackTools } from "@/lib/stackflex/tools";
import { GhostButton, UtilityButton } from "./ResultsUI";
import { ToolAutocomplete } from "./ToolAutocomplete";

const CARD_VISIBLE = 8;

/**
 * Wider Edit profile sheet: draft stack editing (search, reorder, remove), role,
 * and a read-only working-style summary. Save commits draft + role together.
 */
export function EditAiProfileModal({
  stack,
  onClose,
  returnFocusTo,
}: {
  stack: StackState;
  onClose: () => void;
  returnFocusTo: RefObject<HTMLElement | null>;
}) {
  const saved = useProfile();
  const draft = useDraft();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<ProfessionalRole | undefined>(saved.professionalRole);
  const [baseline, setBaseline] = useState(() => snapshotStack(stack));
  const [modelTarget, setModelTarget] = useState<ModelPopoverTarget | null>(null);
  const modelAnchors = useRef(new Map<string, HTMLButtonElement>());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const live = draft ?? stack;
  const tools = useMemo(() => stackTools(live), [live]);
  const itemById = useMemo(() => new Map(live.items.map((i) => [i.id, i])), [live.items]);
  const selectedIds = useMemo(() => new Set(live.items.map((i) => i.id)), [live.items]);
  const hasAssistant = stackHasAssistant(live.items);
  const style = useMemo(
    () =>
      classifyWorkingStyle({
        toolIds: live.items.map((i) => i.id),
        role,
      }),
    [live.items, role],
  );

  const dirty =
    role !== saved.professionalRole || (draft != null && !sameStackSnapshot(snapshotStack(live), baseline));

  const liveModelTarget = useMemo(() => {
    if (!modelTarget || modelTarget.mode !== "edit") return modelTarget;
    const item = itemById.get(modelTarget.item.id);
    if (!item) return null;
    return { ...modelTarget, item };
  }, [modelTarget, itemById]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    beginDraft();
    setBaseline(snapshotStack(stack));
    const background = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert") && !(el as HTMLElement).dataset.keepLive,
    );
    background.forEach((el) => el.setAttribute("inert", ""));
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const opener = returnFocusTo.current;
    dialogRef.current?.focus();
    return () => {
      discardDraft();
      background.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
    // Open once per mount; stack prop is the saved baseline at open time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnFocusTo]);

  function cancel() {
    discardDraft();
    onClose();
  }

  function save(e?: FormEvent) {
    e?.preventDefault();
    if (!hasAssistant || !dirty) return;
    saveDraft();
    const nextRole = role;
    const title = nextRole
      ? getProfile().professionalTitle.trim() || roleLabel(nextRole)
      : getProfile().professionalTitle;
    setProfile({
      professionalRole: nextRole,
      professionalTitle: title,
    });
    track({ name: "profile_edited", props: {} });
    onClose();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  function move(id: string, dir: -1 | 1) {
    const ids = live.items.map((i) => i.id);
    const index = ids.indexOf(id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= ids.length) return;
    const copy = [...ids];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row!);
    reorderItems(copy);
  }

  function onDragStart(id: string, e: DragEvent) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function onDragOver(id: string, e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id) setDragOverId(id);
  }

  function onDrop(targetId: string, e: DragEvent) {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === targetId) return;
    const ids = live.items.map((i) => i.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const copy = [...ids];
    const [row] = copy.splice(from, 1);
    copy.splice(to, 0, row!);
    reorderItems(copy);
  }

  function canRemove(item: SelectedItem) {
    if (!selectionIsAssistant(item)) return true;
    return live.items.filter(selectionIsAssistant).length > 1;
  }

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/35" onClick={cancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative z-10 flex max-h-[min(94svh,860px)] w-full max-w-[960px] flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_24px_64px_-28px_rgba(11,11,12,.55)] outline-none sm:rounded-[22px]"
      >
        <header className="flex flex-none items-start justify-between gap-3 border-b border-[#ECEAE4] px-5 pb-3.5 pt-4 sm:px-7">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-[22px] font-semibold tracking-[-0.03em] sm:text-[24px]">
              Edit profile
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-sf-muted">
              Manage your AI stack, role, and how your profile reads.
            </p>
          </div>
          <button
            type="button"
            onClick={cancel}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink ${focusRing}`}
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2.2} />
          </button>
        </header>

        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            {/* 1. Your AI stack */}
            <section aria-labelledby="edit-stack-heading">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 id="edit-stack-heading" className="font-display text-[18px] font-semibold tracking-[-0.03em]">
                    Your AI stack
                  </h3>
                  <p className="mt-1 text-[13px] leading-snug text-sf-muted">
                    Drag to reorder. Your first tools appear on your card and banner.
                  </p>
                </div>
                <p className="text-[12px] text-sf-subtle">
                  Card shows first {CARD_VISIBLE} · Banner shows first {BANNER_MAX_TOOLS}
                </p>
              </div>

              <div className="mt-3.5">
                <ToolAutocomplete selectedIds={selectedIds} />
              </div>

              <ul className="mt-3.5 flex flex-col gap-1.5">
                {live.items.map((item, index) => {
                  const tool = tools.find((t) => t.id === item.id);
                  if (!tool) return null;
                  const cat = item.toolId ? catalog.tool(item.toolId) : undefined;
                  const models = itemModelLabels(item, { separator: " · " });
                  const canEditModels = Boolean(cat && toolHasModels(cat));
                  const removable = canRemove(item);
                  const onCard = index < CARD_VISIBLE;
                  const onBanner = index < BANNER_MAX_TOOLS;
                  return (
                    <li
                      key={item.id}
                      onDragOver={(e) => onDragOver(item.id, e)}
                      onDrop={(e) => onDrop(item.id, e)}
                      onDragLeave={() => {
                        if (dragOverId === item.id) setDragOverId(null);
                      }}
                      className={`flex items-center gap-2 rounded-[14px] bg-[#FAF9F6] px-2 py-2 sm:gap-2.5 sm:px-2.5 ${
                        dragOverId === item.id ? "ring-2 ring-[#3A2EFF]/60" : ""
                      } ${draggingId === item.id ? "opacity-55" : ""}`}
                    >
                      <button
                        type="button"
                        draggable
                        aria-label={`Drag to reorder ${tool.name}`}
                        onDragStart={(e) => onDragStart(item.id, e)}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverId(null);
                        }}
                        className={`flex size-9 shrink-0 cursor-grab items-center justify-center rounded-lg text-sf-muted active:cursor-grabbing hover:bg-white hover:text-sf-ink ${focusRing}`}
                      >
                        <GripVertical className="size-4" strokeWidth={2.2} aria-hidden />
                      </button>

                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#E6E3DC]">
                        <ToolLogo tool={tool} size="17px" monogramSize="12px" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[14px] font-semibold text-sf-ink">{tool.name}</span>
                          {index === 0 && (
                            <span className="shrink-0 rounded-full bg-[#3A2EFF]/12 px-1.5 py-0.5 text-[10.5px] font-semibold text-[#3A2EFF]">
                              Main
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-sf-muted">
                          {models ? <span>{models}</span> : null}
                          {!onCard && !onBanner ? (
                            <span>Beyond card &amp; banner</span>
                          ) : !onCard ? (
                            <span>Banner only</span>
                          ) : null}
                        </span>
                      </span>

                      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                        <button
                          type="button"
                          aria-label={`Move ${tool.name} up`}
                          disabled={index === 0}
                          onClick={() => move(item.id, -1)}
                          className={`flex size-8 items-center justify-center rounded-lg text-sf-muted hover:bg-white hover:text-sf-ink disabled:opacity-30 ${focusRing}`}
                        >
                          <ChevronUp className="size-4" strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${tool.name} down`}
                          disabled={index === live.items.length - 1}
                          onClick={() => move(item.id, 1)}
                          className={`flex size-8 items-center justify-center rounded-lg text-sf-muted hover:bg-white hover:text-sf-ink disabled:opacity-30 ${focusRing}`}
                        >
                          <ChevronDown className="size-4" strokeWidth={2.2} />
                        </button>
                        {canEditModels && cat && (
                          <>
                            {models && (
                              <button
                                type="button"
                                onClick={() => setItemModels(item.id, [])}
                                className={`hidden rounded-md px-1.5 text-[12px] font-semibold text-sf-muted hover:text-sf-ink sm:inline ${focusRing}`}
                              >
                                Clear
                              </button>
                            )}
                            <button
                              type="button"
                              ref={(node) => {
                                if (node) modelAnchors.current.set(item.id, node);
                                else modelAnchors.current.delete(item.id);
                              }}
                              onClick={() => {
                                const anchor = modelAnchors.current.get(item.id);
                                if (!anchor) return;
                                setModelTarget({ mode: "edit", item, tool: cat, anchor });
                              }}
                              className={`rounded-md px-1.5 text-[12px] font-semibold text-sf-blue hover:text-sf-ink ${focusRing}`}
                            >
                              {models ? "Edit" : "Model"}
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${tool.name}`}
                          disabled={!removable}
                          title={!removable ? "Keep at least one AI assistant" : undefined}
                          onClick={() => removeItem(item.id)}
                          className={`flex size-8 items-center justify-center rounded-lg text-sf-muted hover:bg-white hover:text-[#C0392B] disabled:opacity-30 ${focusRing}`}
                        >
                          <X className="size-3.5" strokeWidth={2.4} />
                        </button>
                      </div>
                    </li>
                  );
                })}
                {live.items.length === 0 && (
                  <li className="rounded-[14px] bg-[#FAF9F6] px-4 py-4 text-[13.5px] text-sf-muted">
                    No tools yet — search above to add your first AI tool.
                  </li>
                )}
              </ul>
              <p className="mt-2.5 text-[12px] leading-snug text-sf-subtle">
                Optional models stay with each tool. They don&apos;t change your working style.
              </p>
            </section>

            {/* 2. Professional role */}
            <section aria-labelledby="edit-role-heading">
              <h3 id="edit-role-heading" className="font-display text-[18px] font-semibold tracking-[-0.03em]">
                Your professional role
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-sf-muted">
                Softens your working-style tagline. It never overrides your tool-based style.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {PROFESSIONAL_ROLES.map((r) => {
                  const on = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setRole(r.id)}
                      className={`rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold ${focusRing} ${
                        on
                          ? "bg-white text-sf-blue shadow-[inset_0_0_0_2px_#3A2EFF]"
                          : "bg-[#FAF9F6] text-sf-ink shadow-[inset_0_0_0_1px_#E6E3DC]"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Working style (read-only summary) */}
            <section aria-labelledby="edit-style-heading">
              <h3 id="edit-style-heading" className="font-display text-[18px] font-semibold tracking-[-0.03em]">
                Your working style
              </h3>
              <div className="mt-3 rounded-[16px] bg-[#FAF9F6] px-4 py-3.5 shadow-[inset_0_0_0_1px_#E6E3DC]">
                <p className="font-display text-[17px] font-semibold tracking-[-0.03em] text-sf-ink">{style.name}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-sf-muted">{style.tagline}</p>
                <p className="mt-2 text-[12px] leading-snug text-sf-subtle">
                  Calculated from your AI stack. Save to refresh your card and banner.
                </p>
              </div>
            </section>
          </div>

          <footer className="sticky bottom-0 flex flex-none flex-col gap-2 border-t border-[#ECEAE4] bg-white/95 px-5 py-3.5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="min-h-[1.1em] text-[12.5px] text-sf-muted">
              {!hasAssistant
                ? "Add at least one AI assistant to save."
                : dirty
                  ? "You have unsaved changes."
                  : "No changes to save."}
            </p>
            <div className="flex items-center justify-end gap-2">
              <GhostButton type="button" onClick={cancel}>
                Cancel
              </GhostButton>
              <UtilityButton type="submit" disabled={!dirty || !hasAssistant}>
                Save changes
              </UtilityButton>
            </div>
          </footer>
        </form>
      </div>
      {liveModelTarget && (
        <ModelPopover target={liveModelTarget} onClose={() => setModelTarget(null)} />
      )}
    </div>,
    document.body,
  );
}

type StackSnapshot = {
  ids: string[];
  primaryId: string | null;
  models: string;
};

function snapshotStack(stack: Pick<StackState, "items" | "primaryId">): StackSnapshot {
  return {
    ids: stack.items.map((i) => i.id),
    primaryId: stack.primaryId,
    models: stack.items
      .map((i) => `${i.id}:${itemModelLabels(i, { separator: "|" }) ?? ""}`)
      .join(";"),
  };
}

function sameStackSnapshot(a: StackSnapshot, b: StackSnapshot) {
  return a.primaryId === b.primaryId && a.ids.join() === b.ids.join() && a.models === b.models;
}
