"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { catalog } from "@/lib/catalog/adapter";
import type { CatalogModel } from "@/lib/catalog/types";
import { itemLabel, modelFieldLabel, modelPickerMode, toolIconSlug } from "@/lib/selection/derive";
import { updateItem } from "@/lib/selection/store";
import type { SelectedItem } from "@/lib/selection/types";
import {
  ChoicePill,
  InlineInput,
  isCustomModelActive,
  isCustomVersionActive,
  pickFamily,
  pickVersion,
  toggleOtherModel,
  toggleOtherVersion,
} from "./InlineModelPicker";
import { ToolIcon } from "./ToolIcon";

/** Rough width of one character and of a pill's chrome at 12.5px, used to fit a single row. */
const CHAR_PX = 6.6;
const PILL_CHROME_PX = 24;
const CHECK_PX = 14;
/** Room for "Other" and the "+N" overflow button. */
const RESERVE_PX = 98;

interface Choice {
  key: string;
  label: string;
  pressed: boolean;
  onClick: () => void;
}

/** Leading choices in catalog order until the row width runs out, plus the pressed one if later. */
function fitRow(choices: Choice[], width: number): Choice[] {
  const cost = (c: Choice) => c.label.length * CHAR_PX + PILL_CHROME_PX + (c.pressed ? CHECK_PX : 0) + 6;
  const pressed = choices.find((c) => c.pressed);
  let budget = width - RESERVE_PX - (pressed ? cost(pressed) : 0);
  let full = false;
  return choices.filter((c) => {
    if (c === pressed) return true;
    if (full || cost(c) > budget) {
      full = true;
      return false;
    }
    budget -= cost(c);
    return true;
  });
}

interface ModelStripProps {
  /** Selected tools in this category that can carry a model. */
  items: SelectedItem[];
  focused: SelectedItem | undefined;
  onFocus: (id: string) => void;
  onOpenDetails: (id: string) => void;
  detailsOpen: boolean;
  detailsAnchor: RefObject<HTMLButtonElement | null>;
}

/**
 * Fixed-height model area at the bottom of a category card for the focused tool:
 * row 1 = model families (or versions for single-model tools), row 2 = exact versions of the
 * chosen family or a typed "Other" value. Everything is optional; "More" opens the full picker.
 */
export function ModelStrip({ items, focused, onFocus, onOpenDetails, detailsOpen, detailsAnchor }: ModelStripProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState(380);
  const [revealed, setRevealed] = useState<string[]>([]);
  const hasFocus = focused !== undefined;

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    setRowWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setRowWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasFocus]);

  if (!focused) return <div aria-hidden="true" className="mt-auto h-[98px] border-t border-hairline" />;

  const tool = focused.toolId ? catalog.tool(focused.toolId) : undefined;
  const models = tool ? catalog.modelsForTool(tool.id) : [];
  const single = models.length === 1 ? models[0] : undefined;
  const model = focused.modelId ? catalog.model(focused.modelId) : undefined;
  const label = itemLabel(focused);
  const onDemand = modelPickerMode(focused) === "on-demand";
  const hidden = onDemand && models.length > 0 && !focused.modelId && !revealed.includes(focused.id);
  const customModel = isCustomModelActive(focused);
  const fieldLabel = single
    ? single.name.toLowerCase() === label.toLowerCase()
      ? "version"
      : `· ${single.name} version`
    : modelFieldLabel(focused).toLowerCase();

  const versionChoices = (m: CatalogModel, isSingle: boolean): Choice[] =>
    m.versions.map((v) => ({
      key: v.id,
      label: v.label,
      pressed: focused.modelId === m.id && focused.versionId === v.id,
      onClick: () => pickVersion(focused, m, v.id, isSingle),
    }));

  const familyChoices: Choice[] = models.map((m) => ({
    key: m.id,
    label: catalog.formatModel(m.id, undefined, tool?.providerId) ?? m.name,
    pressed: focused.modelId === m.id,
    onClick: () => pickFamily(focused, m),
  }));

  const customVersionInput = (m: CatalogModel) => (
    <InlineInput
      label={`${m.name} version`}
      value={focused.customVersion ?? ""}
      maxLength={16}
      placeholder={m.versions[0] ? `e.g. ${m.versions[0].label}` : "Version"}
      onChange={(value) => updateItem(focused.id, { customVersion: value })}
    />
  );
  const customModelInput = (
    <InlineInput
      label={`${label} model name`}
      value={focused.customModel ?? ""}
      maxLength={32}
      placeholder={tool ? "Model name" : "Model name, e.g. Mixtral 8x22B"}
      onChange={(value) => updateItem(focused.id, { customModel: value })}
    />
  );

  const overflowButton = (count: number) =>
    count > 0 && (
      <button
        type="button"
        onClick={() => onOpenDetails(focused.id)}
        aria-label={`${count} more options for ${label}`}
        className="inline-flex h-7 shrink-0 items-center rounded-full px-1.5 text-[12.5px] font-medium text-graphite hover:text-ink"
      >
        +{count}
      </button>
    );

  let row1: ReactNode;
  let row2: ReactNode = null;

  if (hidden) {
    row1 = (
      <button
        type="button"
        onClick={() => setRevealed((r) => [...r, focused.id])}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-dashed border-rule px-3 text-[12.5px] font-medium text-ink hover:bg-well"
      >
        <Plus aria-hidden="true" className="size-3.5" />
        Add a model
      </button>
    );
  } else if (models.length === 0) {
    row1 = customModelInput;
  } else if (single) {
    const choices = versionChoices(single, true);
    const shown = fitRow(choices, rowWidth);
    const otherActive = isCustomVersionActive(focused, single);
    row1 = (
      <>
        {shown.map((c) => (
          <ChoicePill key={c.key} pressed={c.pressed} onClick={c.onClick}>
            {c.label}
          </ChoicePill>
        ))}
        {overflowButton(choices.length - shown.length)}
        <ChoicePill pressed={otherActive} onClick={() => toggleOtherVersion(focused, single, true)}>
          Other
        </ChoicePill>
      </>
    );
    if (otherActive) row2 = customVersionInput(single);
  } else {
    const shown = fitRow(familyChoices, rowWidth);
    row1 = (
      <>
        {shown.map((c) => (
          <ChoicePill key={c.key} pressed={c.pressed} onClick={c.onClick}>
            {c.label}
          </ChoicePill>
        ))}
        {overflowButton(familyChoices.length - shown.length)}
        <ChoicePill pressed={customModel} onClick={() => toggleOtherModel(focused)}>
          Other
        </ChoicePill>
      </>
    );
    if (customModel) {
      row2 = customModelInput;
    } else if (model && model.versions.length > 0) {
      const choices = versionChoices(model, false);
      const shownVersions = fitRow(choices, rowWidth - 14);
      const otherActive = isCustomVersionActive(focused, model);
      row2 = (
        <>
          {shownVersions.map((c) => (
            <ChoicePill key={c.key} pressed={c.pressed} onClick={c.onClick}>
              {c.label}
            </ChoicePill>
          ))}
          {overflowButton(choices.length - shownVersions.length)}
          <ChoicePill pressed={otherActive} onClick={() => toggleOtherVersion(focused, model, false)}>
            Other
          </ChoicePill>
          {otherActive && customVersionInput(model)}
        </>
      );
    }
  }

  const versionRow = Boolean(model && !single && !customModel && row2);

  return (
    <div className="mt-auto h-[98px] border-t border-hairline pt-2">
      <div className="flex h-5 items-center gap-1.5 text-[12px]">
        {items.length > 1 ? (
          <div role="group" aria-label="Choose which tool to configure" className="flex items-center gap-1">
            {items.map((i) => {
              const t = i.toolId ? catalog.tool(i.toolId) : undefined;
              const isFocused = i.id === focused.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  aria-pressed={isFocused}
                  aria-label={`Model options for ${itemLabel(i)}`}
                  title={itemLabel(i)}
                  onClick={() => onFocus(i.id)}
                  className={`rounded-full ring-offset-1 transition-opacity ${isFocused ? "ring-2 ring-ink" : "opacity-55 hover:opacity-100"}`}
                >
                  <ToolIcon slug={toolIconSlug(t)} label={itemLabel(i)} size={9} rounded />
                </button>
              );
            })}
          </div>
        ) : (
          <ToolIcon slug={toolIconSlug(tool)} label={label} size={9} rounded />
        )}
        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold text-ink">{label}</span> <span className="text-graphite">{fieldLabel}</span>
          <span className="text-graphite/60"> · optional</span>
        </span>
        <button
          ref={detailsAnchor}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={detailsOpen}
          onClick={() => onOpenDetails(focused.id)}
          className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 font-medium text-graphite hover:bg-well hover:text-ink aria-expanded:bg-well aria-expanded:text-ink"
        >
          <SlidersHorizontal aria-hidden="true" className="size-3" />
          More
        </button>
      </div>
      <div
        ref={rowRef}
        role="group"
        aria-label={`${label} ${fieldLabel}`}
        className="mt-1.5 flex h-7 items-center gap-1.5 overflow-x-clip"
      >
        {row1}
      </div>
      <div
        role="group"
        aria-label={model ? `${model.name} version` : `${label} details`}
        className={`mt-1.5 flex h-7 items-center gap-1.5 overflow-x-clip ${versionRow ? "border-l-2 border-rule pl-2" : ""}`}
      >
        {versionRow && <span className="sr-only">Version:</span>}
        {row2}
      </div>
    </div>
  );
}
