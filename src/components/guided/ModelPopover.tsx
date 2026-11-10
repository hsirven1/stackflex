"use client";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { focusRing } from "@/components/stackflex/Controls";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { catalog, normalize } from "@/lib/catalog/adapter";
import type { CatalogTool, CategoryId } from "@/lib/catalog/types";
import { itemModels, modelRefKey } from "@/lib/selection/derive";
import { addTool, setItemModels, updateItem } from "@/lib/selection/store";
import type { SelectedItem, SelectedModelRef } from "@/lib/selection/types";
import { MAX_MODELS_PER_TOOL } from "@/lib/selection/types";
import { toolFromCatalog, toolFromItem } from "@/lib/stackflex/tools";

const SEARCH_THRESHOLD = 8;

export type ModelPopoverTarget =
  | { mode: "add"; tool: CatalogTool; categoryId: CategoryId; anchor: HTMLElement }
  | { mode: "edit"; item: SelectedItem; tool: CatalogTool; anchor: HTMLElement };

type ModelChoice = {
  key: string;
  label: string;
  modelId?: string;
  versionId?: string;
};

/** Flatten catalog models into one-click choices (exact versions when present). */
export function modelChoicesFor(tool: CatalogTool): ModelChoice[] {
  const models = catalog.modelsForTool(tool.id);
  const out: ModelChoice[] = [];
  for (const m of models) {
    if (m.versions.length === 0) {
      out.push({ key: m.id, label: m.shortName ?? m.name, modelId: m.id });
      continue;
    }
    for (const v of m.versions) {
      const base = m.shortName ?? m.name;
      out.push({
        key: `${m.id}:${v.id}`,
        label: `${base} ${v.label}`,
        modelId: m.id,
        versionId: v.id,
      });
    }
  }
  return out;
}

export function toolHasModels(tool: CatalogTool): boolean {
  return catalog.modelsForTool(tool.id).length > 0;
}

export function toolHasCapabilities(tool: CatalogTool): boolean {
  return (tool.aiCapabilities?.length ?? 0) > 0;
}

/**
 * Compact multi-model picker anchored to a tool control.
 * Optional — never required. Tool must already be selected (edit) or is added on first open (add).
 */
export function ModelPopover({
  target,
  onClose,
}: {
  target: ModelPopoverTarget;
  onClose: () => void;
}) {
  const titleId = useId();
  const listId = useId();
  const tool = target.tool;
  const existing = target.mode === "edit" ? target.item : null;
  const choices = useMemo(() => modelChoicesFor(tool), [tool]);
  const useSearch = choices.length > SEARCH_THRESHOLD;
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<SelectedModelRef[]>(() => {
    if (!existing) return [];
    return itemModels(existing)
      .filter((m): m is typeof m & { modelId: string } => Boolean(m.modelId))
      .map((m) => ({
        modelId: m.modelId,
        versionId: m.versionId,
        customVersion: m.customVersion,
      }));
  });

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ padding: 12, fallbackPlacements: ["top-start", "bottom-end", "top-end"] }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(400, Math.max(180, availableHeight))}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    refs.setReference(target.anchor);
  }, [refs, target.anchor]);

  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  useEffect(() => {
    if (useSearch) {
      const t = window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 0);
      return () => window.clearTimeout(t);
    }
  }, [useSearch]);

  const q = normalize(query);
  const visible = q
    ? choices.filter((c) => normalize(c.label).includes(q) || normalize(c.key).includes(q))
    : choices;

  const logoTool = existing
    ? toolFromItem(existing)
    : toolFromCatalog(tool, target.mode === "add" ? target.categoryId : "daily");

  const selectedKeys = useMemo(() => new Set(selected.map(modelRefKey)), [selected]);

  function ensureItem(): string {
    if (existing) return existing.id;
    if (target.mode === "add") {
      addTool(tool.id, target.categoryId, {}, "quick_pick");
      return tool.id;
    }
    return tool.id;
  }

  function toggleChoice(choice: ModelChoice) {
    if (!choice.modelId) return;
    const ref: SelectedModelRef = {
      modelId: choice.modelId,
      versionId: choice.versionId,
    };
    const key = modelRefKey(ref);
    setSelected((prev) => {
      if (prev.some((m) => modelRefKey(m) === key)) {
        return prev.filter((m) => modelRefKey(m) !== key);
      }
      if (prev.length >= MAX_MODELS_PER_TOOL) return prev;
      return [...prev, ref];
    });
  }

  function clearAll() {
    setSelected([]);
  }

  function saveAndClose() {
    const id = ensureItem();
    setItemModels(id, selected);
    onClose();
  }

  function clearAndClose() {
    const id = ensureItem();
    setItemModels(id, []);
    // Also clear legacy customModel if any
    updateItem(id, { customModel: undefined, showVersion: true });
    onClose();
  }

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} initialFocus={useSearch ? -1 : 0} returnFocus={false}>
        <div
          ref={(node) => {
            refs.setFloating(node);
          }}
          style={floatingStyles}
          {...getFloatingProps({
            className:
              "z-50 flex w-[min(300px,calc(100vw-24px))] flex-col overflow-hidden rounded-[14px] border border-[#E3E0D8] bg-white shadow-[0_16px_40px_-20px_rgba(11,11,12,.5)] outline-none",
            "aria-labelledby": titleId,
          })}
        >
          <header className="flex flex-none items-center gap-2.5 border-b border-[#ECEAE4] px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7F5F0] shadow-[0_0_0_1px_#ECEAE4]">
              <ToolLogo tool={logoTool} size="16px" monogramSize="12px" />
            </span>
            <div className="min-w-0 flex-1">
              <p id={titleId} className="truncate text-[13px] font-semibold text-sf-ink">
                {tool.name}
              </p>
              <p className="truncate text-[11px] text-sf-muted">
                Choose models (optional) · up to {MAX_MODELS_PER_TOOL}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink ${focusRing}`}
            >
              <X className="size-3.5" strokeWidth={2.2} />
            </button>
          </header>

          {useSearch && (
            <div className="flex-none border-b border-[#ECEAE4] px-2.5 py-2">
              <label className="relative block">
                <span className="sr-only">Search models</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-sf-muted"
                  strokeWidth={2.2}
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search models…"
                  className={`h-8 w-full rounded-full border border-[#DAD7CF] bg-white pl-8 pr-3 text-[12.5px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
                />
              </label>
            </div>
          )}

          <div
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Models"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
          >
            {visible.map((c) => (
              <ChoiceButton
                key={c.key}
                pressed={selectedKeys.has(c.key)}
                onClick={() => toggleChoice(c)}
              >
                {c.label}
              </ChoiceButton>
            ))}
            {visible.length === 0 && (
              <p className="px-2 py-3 text-center text-[12px] text-sf-muted">No models match.</p>
            )}
          </div>

          <footer className="flex flex-none items-center justify-between gap-2 border-t border-[#ECEAE4] px-3 py-2.5">
            <button
              type="button"
              onClick={clearAndClose}
              className={`rounded-md text-[12.5px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing}`}
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={`rounded-md text-[12.5px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing}`}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={saveAndClose}
                className={`inline-flex h-8 items-center rounded-full bg-sf-ink px-3.5 text-[12.5px] font-semibold text-white ${focusRing}`}
              >
                Done{selected.length > 0 ? ` · ${selected.length}` : ""}
              </button>
            </div>
          </footer>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

function ChoiceButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={pressed}
      onClick={onClick}
      className={[
        "flex w-full items-center rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors",
        pressed ? "bg-sf-ink font-semibold text-white" : "font-medium text-sf-ink hover:bg-[#F3F1EB]",
        focusRing,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/**
 * Optional “AI features I use” picker for business AI tools.
 * Never shown on first add — only when editing a selected card.
 */
export function CapabilityPopover({
  item,
  tool,
  anchor,
  onClose,
}: {
  item: SelectedItem;
  tool: CatalogTool;
  anchor: HTMLElement;
  onClose: () => void;
}) {
  const titleId = useId();
  const options = tool.aiCapabilities ?? [];
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(item.capabilities?.filter((id) => options.some((o) => o.id === id)) ?? []),
  );

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    placement: "bottom",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ padding: 12, fallbackPlacements: ["top", "right", "left"] }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.min(380, Math.max(180, availableHeight))}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    refs.setReference(anchor);
  }, [refs, anchor]);

  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const logoTool = toolFromItem(item);
  const parent = tool.parentPlatform;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    const capabilities = options.map((o) => o.id).filter((id) => selected.has(id));
    updateItem(item.id, { capabilities: capabilities.length > 0 ? capabilities : undefined });
    onClose();
  }

  if (options.length === 0) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} returnFocus={false}>
        <div
          ref={(node) => {
            refs.setFloating(node);
          }}
          style={floatingStyles}
          {...getFloatingProps({
            className:
              "z-50 flex w-[min(300px,calc(100vw-24px))] flex-col overflow-hidden rounded-[14px] border border-[#E3E0D8] bg-white shadow-[0_16px_40px_-20px_rgba(11,11,12,.5)] outline-none",
            "aria-labelledby": titleId,
          })}
        >
          <header className="flex flex-none items-center gap-2.5 border-b border-[#ECEAE4] px-3 py-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7F5F0] shadow-[0_0_0_1px_#ECEAE4]">
              <ToolLogo tool={logoTool} size="16px" monogramSize="12px" />
            </span>
            <div className="min-w-0 flex-1">
              <p id={titleId} className="truncate text-[13px] font-semibold text-sf-ink">
                {tool.name}
              </p>
              <p className="truncate text-[11px] text-sf-muted">
                {parent ? `${parent} · AI features I use` : "AI features I use"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink ${focusRing}`}
            >
              <X className="size-3.5" strokeWidth={2.2} />
            </button>
          </header>

          <div role="group" aria-label="AI features" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
            {options.map((opt) => {
              const pressed = selected.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggle(opt.id)}
                  className={[
                    "flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors",
                    pressed ? "bg-sf-ink font-semibold text-white" : "font-medium text-sf-ink hover:bg-[#F3F1EB]",
                    focusRing,
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border text-[10px]",
                      pressed ? "border-white/40 bg-white/15 text-white" : "border-[#DAD7CF] text-transparent",
                    ].join(" ")}
                  >
                    ✓
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>

          <footer className="flex flex-none items-center justify-between gap-2 border-t border-[#ECEAE4] px-3 py-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-full px-2.5 py-1.5 text-[12.5px] font-medium text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink ${focusRing}`}
            >
              Skip
            </button>
            <button
              type="button"
              onClick={save}
              className={`rounded-full bg-sf-ink px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-sf-ink/90 ${focusRing}`}
            >
              Save
            </button>
          </footer>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

/** Tiny purpose menu anchored to a stack-card control. */
export function PurposePopover({
  item,
  anchor,
  onClose,
}: {
  item: SelectedItem;
  anchor: HTMLElement;
  onClose: () => void;
}) {
  const titleId = useId();
  const categories = catalog.categories();

  const { refs, floatingStyles, context } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });

  useEffect(() => {
    refs.setReference(anchor);
  }, [refs, anchor]);

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  return (
    <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} returnFocus={false}>
        <div
          ref={(node) => {
            refs.setFloating(node);
          }}
          style={floatingStyles}
          {...getFloatingProps({
            className:
              "z-50 w-[200px] rounded-[12px] border border-[#E3E0D8] bg-white p-1.5 shadow-[0_12px_28px_-18px_rgba(11,11,12,.45)] outline-none",
            "aria-labelledby": titleId,
          })}
        >
          <p id={titleId} className="px-2 pb-1 pt-0.5 text-[10px] font-semibold tracking-[0.06em] text-sf-muted uppercase">
            Purpose
          </p>
          {categories.map((c) => {
            const pressed = item.categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => {
                  updateItem(item.id, { categoryId: c.id });
                  onClose();
                }}
                className={[
                  "flex w-full items-center rounded-[8px] px-2 py-1.5 text-left text-[12.5px] font-medium",
                  pressed ? "bg-sf-ink text-white" : "text-sf-ink hover:bg-[#F3F1EB]",
                  focusRing,
                ].join(" ")}
              >
                {c.shortName}
              </button>
            );
          })}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
