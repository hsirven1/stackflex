"use client";

import { Plus, Search } from "lucide-react";
import { useId, useRef, useState } from "react";
import { catalog, normalize } from "@/lib/catalog/adapter";
import type { CatalogTool, Category, CategoryId } from "@/lib/catalog/types";
import { itemLabel, itemsInCategory, modelFieldLabel, modelPickerMode, toolIconSlug } from "@/lib/selection/derive";
import { addCustomTool, removeItem, toggleTool } from "@/lib/selection/store";
import { MAX_BADGES, type SelectedItem, type StackState } from "@/lib/selection/types";
import { AnchoredPanel } from "./AnchoredPanel";
import { CategoryIcon } from "./CategoryIcon";
import { InlineModelPicker } from "./InlineModelPicker";
import { ModelStrip } from "./ModelStrip";
import { ToolPill } from "./ToolPill";

const MAX_RESULTS = 14;

export function categoryAnchorId(categoryId: string) {
  return `category-${categoryId}`;
}

/** The one contextual panel that may be open across all cards. */
export type OpenPanel = { categoryId: CategoryId; kind: "more" } | { categoryId: CategoryId; kind: "model"; itemId: string };

interface CategoryCardProps {
  category: Category;
  stack: StackState;
  panel: OpenPanel | null;
  onPanel: (panel: OpenPanel | null) => void;
}

/**
 * Category card with a stable shape: logo pills, a "See more" panel trigger, and a fixed-height
 * model strip. Longer content opens in an anchored panel so neighbouring cards never move.
 */
export function CategoryCard({ category, stack, panel, onPanel }: CategoryCardProps) {
  const id = useId();
  const moreRef = useRef<HTMLButtonElement>(null);
  const detailsRef = useRef<HTMLButtonElement>(null);
  const [focusId, setFocusId] = useState<string>();

  const full = stack.items.length >= MAX_BADGES;
  const selectedIds = new Set(stack.items.map((i) => i.id));
  const owned = itemsInCategory(stack, category.id);
  const quickPicks = category.quickPicks
    .map((toolId) => catalog.tool(toolId))
    .filter((t): t is CatalogTool => Boolean(t));
  const extras = owned.filter((i) => !category.quickPicks.includes(i.id));

  const modelItems = owned.filter((i) => modelPickerMode(i) !== "none");
  const focused = modelItems.find((i) => i.id === focusId) ?? modelItems.at(-1);

  const morePanelOpen = panel?.categoryId === category.id && panel.kind === "more";
  const modelPanelItem =
    panel?.categoryId === category.id && panel.kind === "model" ? owned.find((i) => i.id === panel.itemId) : undefined;

  function toggle(tool: CatalogTool, source: "quick_pick" | "more") {
    const result = toggleTool(tool.id, category.id, source);
    if (result === "added") setFocusId(tool.id);
  }

  return (
    <section
      id={categoryAnchorId(category.id)}
      aria-labelledby={`${id}-title`}
      className="flex h-full min-w-0 scroll-mt-24 flex-col lg:scroll-mt-32 rounded-2xl border border-rule bg-panel p-3.5 pb-3"
    >
      <header className="mb-2 flex items-center gap-2">
        <CategoryIcon id={category.id} className="size-4 text-graphite" />
        <h3 id={`${id}-title`} className="text-[15px] font-semibold tracking-tight">
          {category.name}
        </h3>
        {owned.length > 0 && (
          <span className="font-mono text-[11px] text-graphite" aria-label={`${owned.length} selected`}>
            · {owned.length}
          </span>
        )}
      </header>

      <div role="group" aria-label={`${category.name} tools`} className="mb-2.5 flex flex-wrap gap-1.5">
        {quickPicks.map((tool) => (
          <ToolPill
            key={tool.id}
            pillId={tool.id}
            label={tool.name}
            iconSlug={toolIconSlug(tool)}
            selected={selectedIds.has(tool.id)}
            unavailable={full && !selectedIds.has(tool.id)}
            onClick={() => toggle(tool, "quick_pick")}
          />
        ))}
        {extras.map((item) => {
          const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
          return (
            <ToolPill
              key={item.id}
              pillId={item.id}
              label={itemLabel(item)}
              iconSlug={toolIconSlug(tool)}
              selected
              onClick={() => removeItem(item.id)}
            />
          );
        })}
        <button
          ref={moreRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={morePanelOpen}
          onClick={() => onPanel(morePanelOpen ? null : { categoryId: category.id, kind: "more" })}
          className="inline-flex h-9 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-graphite hover:bg-well hover:text-ink aria-expanded:bg-well aria-expanded:text-ink"
        >
          <Plus aria-hidden="true" className="size-3.5" />
          See more
        </button>
      </div>

      <ModelStrip
        items={modelItems}
        focused={focused}
        onFocus={setFocusId}
        detailsAnchor={detailsRef}
        detailsOpen={Boolean(modelPanelItem) && modelPanelItem?.id === focused?.id}
        onOpenDetails={(itemId) =>
          onPanel(
            modelPanelItem?.id === itemId ? null : { categoryId: category.id, kind: "model", itemId },
          )
        }
      />

      {morePanelOpen && (
        <AnchoredPanel anchor={moreRef} title={category.name} onClose={() => onPanel(null)}>
          <MoreTools
            category={category}
            owned={owned}
            selectedIds={selectedIds}
            full={full}
            onToggle={(tool) => toggle(tool, "more")}
          />
        </AnchoredPanel>
      )}

      {modelPanelItem && (
        <AnchoredPanel
          anchor={detailsRef}
          title={
            <>
              {itemLabel(modelPanelItem)} <span className="font-normal text-graphite">{modelFieldLabel(modelPanelItem).toLowerCase()}</span>
            </>
          }
          onClose={() => onPanel(null)}
        >
          <InlineModelPicker item={modelPanelItem} isPrimary={stack.primaryId === modelPanelItem.id} bare />
        </AnchoredPanel>
      )}
    </section>
  );
}

interface MoreToolsProps {
  category: Category;
  owned: SelectedItem[];
  selectedIds: Set<string>;
  full: boolean;
  onToggle: (tool: CatalogTool) => void;
}

/** Panel body: everything else in the category, contextual search, and a custom-tool fallback. */
export function MoreTools({ category, owned, selectedIds, full, onToggle }: MoreToolsProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const q = normalize(query);
  const quick = new Set(category.quickPicks);

  const results: CatalogTool[] = q
    ? catalog
        .search(query, { limit: MAX_RESULTS + 4, includeModels: false, preferCategory: category.id })
        .flatMap((r) => (r.kind === "tool" ? [r.tool] : []))
        .slice(0, MAX_RESULTS)
    : catalog.toolsInCategory(category.id).filter((t) => !quick.has(t.id));
  const exactMatch = q
    ? Boolean(catalog.resolveToolByName(query)) || owned.some((i) => normalize(itemLabel(i)) === q)
    : true;
  const customOwned = q ? [] : owned.filter((i) => !i.toolId);

  function addCustom() {
    const name = query.trim();
    if (name && addCustomTool(name, category.id) === "added") setQuery("");
  }

  return (
    <div>
      <div className="mb-4 flex h-11 items-center gap-2.5 rounded-full bg-white px-4 shadow-[0_0_0_1px_#ECEAE4] focus-within:shadow-[0_0_0_2px_#3A2EFF]">
        <Search aria-hidden="true" className="size-4 shrink-0 text-sf-subtle" />
        <label htmlFor={`${id}-search`} className="sr-only">
          Search tools
        </label>
        <input
          id={`${id}-search`}
          data-autofocus
          value={query}
          maxLength={40}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (results.length === 1) onToggle(results[0]);
            else if (q && !exactMatch && results.length === 0) addCustom();
          }}
          placeholder="Search any tool"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-sf-subtle"
        />
      </div>
      <div role="group" aria-label={q ? "Search results" : `More ${category.name} tools`} className="flex flex-wrap gap-2.5 p-0.5">
        {results.map((tool) => (
          <ToolPill
            key={tool.id}
            label={tool.name}
            iconSlug={toolIconSlug(tool)}
            selected={selectedIds.has(tool.id)}
            unavailable={full && !selectedIds.has(tool.id)}
            onClick={() => onToggle(tool)}
          />
        ))}
        {customOwned.map((item) => (
          <ToolPill key={item.id} label={itemLabel(item)} selected onClick={() => removeItem(item.id)} />
        ))}
        {q && !exactMatch && (
          <ToolPill
            variant="create"
            label={`Add “${query.trim().slice(0, 32)}”`}
            selected={false}
            unavailable={full}
            onClick={addCustom}
          />
        )}
        {!q && results.length === 0 && customOwned.length === 0 && (
          <p className="py-1 text-[15px] text-sf-muted">Search to find any tool, or add your own.</p>
        )}
      </div>
    </div>
  );
}
