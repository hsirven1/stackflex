"use client";

import { Plus } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { focusRing } from "@/components/stackflex/Controls";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { catalog } from "@/lib/catalog/adapter";
import type { CatalogTool } from "@/lib/catalog/types";
import { monogramFor, toolIconSlug } from "@/lib/selection/derive";
import { addCustomTool, addTool } from "@/lib/selection/store";

const MAX_SUGGESTIONS = 8;

type Suggestion =
  | { kind: "catalog"; tool: CatalogTool }
  | { kind: "custom"; name: string };

/**
 * Search/add field for the Edit Profile stack editor.
 * Catalog matches via the live adapter; custom tools require an explicit pick.
 */
export function ToolAutocomplete({
  selectedIds,
  onAdded,
}: {
  selectedIds: Set<string>;
  onAdded?: () => void;
}) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const suggestions = useMemo((): Suggestion[] => {
    const q = query.trim();
    if (!q) return [];
    const hits = catalog
      .search(q, { limit: MAX_SUGGESTIONS + 4, includeModels: false })
      .filter((r): r is { kind: "tool"; tool: CatalogTool; score: number } => r.kind === "tool")
      .map((r) => r.tool);

    const seen = new Set<string>();
    const catalogSuggestions: Suggestion[] = [];
    for (const tool of hits) {
      if (seen.has(tool.id)) continue;
      seen.add(tool.id);
      catalogSuggestions.push({ kind: "catalog", tool });
      if (catalogSuggestions.length >= MAX_SUGGESTIONS) break;
    }

    const exactInCatalog = catalog.resolveToolByName(q);
    const alreadyHaveExact = exactInCatalog ? selectedIds.has(exactInCatalog.id) : false;
    const customId = `custom:${q.toLowerCase().replace(/\s+/g, "-")}`;
    const showCustom =
      !exactInCatalog &&
      !alreadyHaveExact &&
      !selectedIds.has(customId) &&
      q.length >= 2;

    if (showCustom) {
      return [...catalogSuggestions, { kind: "custom", name: q }];
    }
    return catalogSuggestions;
  }, [query, selectedIds]);

  function clearAndFocus() {
    setQuery("");
    setOpen(false);
    setActive(0);
    inputRef.current?.focus();
  }

  function pick(suggestion: Suggestion) {
    if (suggestion.kind === "catalog") {
      if (selectedIds.has(suggestion.tool.id)) return;
      const category = suggestion.tool.categories[0] ?? "daily";
      const result = addTool(suggestion.tool.id, category, {}, "search");
      if (result === "added" || result === "updated") {
        onAdded?.();
        clearAndFocus();
      }
      return;
    }
    const result = addCustomTool(suggestion.name, null);
    if (result === "added") {
      onAdded?.();
      clearAndFocus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
      return;
    }
    if (!open || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const choice = suggestions[active];
      if (choice) pick(choice);
    }
  }

  const showList = open && query.trim().length > 0 && suggestions.length > 0;
  const activeSuggestion = suggestions[active];
  const canAddActive = Boolean(activeSuggestion) && !(
    activeSuggestion?.kind === "catalog" && selectedIds.has(activeSuggestion.tool.id)
  );

  function addActive() {
    if (!activeSuggestion || !canAddActive) {
      inputRef.current?.focus();
      setOpen(true);
      return;
    }
    pick(activeSuggestion);
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          value={query}
          placeholder="Search or add an AI tool..."
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Allow mousedown on options to fire before closing.
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          className={`h-12 w-full rounded-full border border-[#DAD7CF] bg-white py-0 pl-4 pr-12 text-[15px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
        />
        <button
          type="button"
          aria-label={
            canAddActive
              ? activeSuggestion?.kind === "custom"
                ? `Add “${activeSuggestion.name}” as a custom tool`
                : `Add ${activeSuggestion?.kind === "catalog" ? activeSuggestion.tool.name : "tool"}`
              : "Search or add an AI tool"
          }
          onMouseDown={(e) => e.preventDefault()}
          onClick={addActive}
          disabled={query.trim().length > 0 && showList && !canAddActive}
          className={`absolute right-1.5 flex size-9 items-center justify-center rounded-full bg-[#0B0B0C] text-white hover:bg-[#24232A] disabled:opacity-35 ${focusRing}`}
        >
          <Plus className="size-4" strokeWidth={2.4} aria-hidden />
        </button>
      </div>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-[min(320px,50vh)] overflow-y-auto rounded-2xl border border-[#E6E3DC] bg-white py-1.5 shadow-[0_18px_40px_-24px_rgba(11,11,12,.45)]"
        >
          {suggestions.map((s, i) => {
            if (s.kind === "custom") {
              return (
                <li key={`custom:${s.name}`} role="option" id={`${listId}-${i}`} aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(s)}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[14px] ${
                      i === active ? "bg-[#F4F3EF]" : "hover:bg-[#FAF9F6]"
                    }`}
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#F4F3EF] text-[13px] font-semibold text-sf-muted">
                      +
                    </span>
                    <span className="min-w-0">
                      Add &ldquo;{s.name}&rdquo; as a custom tool
                    </span>
                  </button>
                </li>
              );
            }
            const selected = selectedIds.has(s.tool.id);
            return (
              <li key={s.tool.id} role="option" id={`${listId}-${i}`} aria-selected={i === active} aria-disabled={selected}>
                <button
                  type="button"
                  disabled={selected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(s)}
                  className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left disabled:cursor-default ${
                    i === active && !selected ? "bg-[#F4F3EF]" : "hover:bg-[#FAF9F6]"
                  } ${selected ? "opacity-55" : ""}`}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#E6E3DC]">
                    <ToolLogo
                      tool={{ iconSlug: toolIconSlug(s.tool), monogram: s.tool.monogram ?? monogramFor(s.tool.name) }}
                      size="16px"
                      monogramSize="12px"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-sf-ink">{s.tool.name}</span>
                    <span className="block truncate text-[12px] text-sf-muted">{s.tool.descriptor}</span>
                  </span>
                  {selected && (
                    <span className="shrink-0 text-[12px] font-semibold text-sf-muted">Added</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
