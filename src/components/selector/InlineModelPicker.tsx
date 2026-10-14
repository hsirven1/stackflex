"use client";

import { Check, Star, X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { catalog } from "@/lib/catalog/adapter";
import type { CatalogModel } from "@/lib/catalog/types";
import { itemLabel, modelFieldLabel, toolIconSlug } from "@/lib/selection/derive";
import { setPrimary, updateItem } from "@/lib/selection/store";
import type { SelectedItem } from "@/lib/selection/types";
import { ToolIcon } from "./ToolIcon";

const VISIBLE_FAMILIES = 5;

const CLEAR_MODEL = { modelId: undefined, versionId: undefined, customVersion: undefined, customModel: undefined };

/** Toggle a model family on a selected tool; picking a new family drops any version. */
export function pickFamily(item: SelectedItem, m: CatalogModel) {
  if (item.modelId === m.id) updateItem(item.id, CLEAR_MODEL);
  else updateItem(item.id, { ...CLEAR_MODEL, modelId: m.id });
}

/** Toggle an exact version. For single-model tools, un-picking the version clears the model too. */
export function pickVersion(item: SelectedItem, m: CatalogModel, versionId: string, single: boolean) {
  if (item.modelId === m.id && item.versionId === versionId) {
    updateItem(item.id, single ? CLEAR_MODEL : { versionId: undefined });
  } else {
    updateItem(item.id, { ...CLEAR_MODEL, modelId: m.id, versionId, showVersion: true });
  }
}

export function isCustomModelActive(item: SelectedItem) {
  return !item.modelId && item.customModel !== undefined;
}

export function isCustomVersionActive(item: SelectedItem, m: CatalogModel) {
  return item.modelId === m.id && item.customVersion !== undefined;
}

/** "Other" model: a typed model name instead of a catalog family. */
export function toggleOtherModel(item: SelectedItem) {
  updateItem(item.id, isCustomModelActive(item) ? CLEAR_MODEL : { ...CLEAR_MODEL, customModel: "" });
}

/** "Other" version: a typed version for a catalog family. */
export function toggleOtherVersion(item: SelectedItem, m: CatalogModel, single: boolean) {
  if (isCustomVersionActive(item, m)) {
    updateItem(item.id, single ? CLEAR_MODEL : { customVersion: undefined });
  } else {
    updateItem(item.id, { ...CLEAR_MODEL, modelId: m.id, customVersion: "", showVersion: true });
  }
}

/** "lg" gives model and version choices comfortable touch targets where space allows. */
const PillSize = createContext<"sm" | "lg">("sm");

export function ChoicePill({
  pressed,
  onClick,
  ghost = false,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  /** "Other" choices: text-only until picked (large size). */
  ghost?: boolean;
  children: ReactNode;
}) {
  const large = useContext(PillSize) === "lg";
  if (large) {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onClick}
        className={[
          "inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-base transition-colors",
          "outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2",
          pressed
            ? "bg-sf-blue font-semibold text-white"
            : ghost
              ? "font-medium text-sf-muted hover:text-sf-ink"
              : "bg-sf-chip font-medium text-sf-ink hover:bg-sf-line",
        ].join(" ")}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-medium transition-colors h-7 px-2.5 text-[12.5px]",
        pressed ? "border-ink bg-ink text-white" : "border-hairline bg-panel text-ink hover:border-rule",
      ].join(" ")}
    >
      {pressed && <Check aria-hidden="true" className="-ml-0.5 size-3" strokeWidth={3.5} />}
      {children}
    </button>
  );
}

export function InlineInput({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  const large = useContext(PillSize) === "lg";
  return (
    <input
      aria-label={label}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      autoFocus={!value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: `min(100%, ${Math.round(Math.max(placeholder.length, value.length) * 0.95) + 4}ch)` }}
      className={`min-w-28 shrink rounded-full outline-none ${large ? "h-11 border-[1.5px] border-sf-blue bg-white px-5 text-base placeholder:text-sf-subtle" : "h-7 border border-ink bg-panel px-3 text-[12.5px] placeholder:text-graphite/70"}`}
    />
  );
}

interface InlineModelPickerProps {
  item: SelectedItem;
  isPrimary: boolean;
  /** Collapse an on-demand picker that has no model set yet. */
  onHide?: () => void;
  /** Inside a panel: no tinted wrapper or tool label (the panel title has it), all families visible. */
  bare?: boolean;
  /** Replaces the default tool label line, e.g. with a question. */
  heading?: ReactNode;
  /** Large pills with every family visible and no primary toggle (the questionnaire). */
  large?: boolean;
}

/**
 * Optional model choice for one selected tool: family pills → version pills, with "Other" as a
 * typed fallback. Nothing here is required.
 */
export function InlineModelPicker({ item, isPrimary, onHide, bare = false, heading, large = false }: InlineModelPickerProps) {
  const [showAll, setShowAll] = useState(bare || large);
  const tool = item.toolId ? catalog.tool(item.toolId) : undefined;
  const models = tool ? catalog.modelsForTool(tool.id) : [];
  const label = itemLabel(item);
  const model = item.modelId ? catalog.model(item.modelId) : undefined;
  const single = models.length === 1 ? models[0] : undefined;
  const customModelActive = isCustomModelActive(item);
  const customVersionActive = Boolean(model) && item.customVersion !== undefined;
  const fieldLabel = modelFieldLabel(item).toLowerCase();

  const visibleFamilies =
    showAll || models.length <= VISIBLE_FAMILIES + 1
      ? models
      : models.filter((m, i) => i < VISIBLE_FAMILIES || m.id === item.modelId);
  const hiddenCount = models.length - visibleFamilies.length;

  const versionRow = (m: CatalogModel) => (
    <>
      {m.versions.map((v) => (
        <ChoicePill key={v.id} pressed={item.modelId === m.id && item.versionId === v.id} onClick={() => pickVersion(item, m, v.id, Boolean(single))}>
          {v.label}
        </ChoicePill>
      ))}
      <ChoicePill pressed={customVersionActive && item.modelId === m.id} onClick={() => toggleOtherVersion(item, m, Boolean(single))} ghost>
        Other version
      </ChoicePill>
      {customVersionActive && item.modelId === m.id && (
        <InlineInput
          label={`${m.name} version`}
          value={item.customVersion ?? ""}
          maxLength={16}
          placeholder={m.versions[0] ? `e.g. ${m.versions[0].label}` : "e.g. 2"}
          onChange={(value) => updateItem(item.id, { customVersion: value })}
        />
      )}
    </>
  );

  const gap = large ? "gap-2.5" : "gap-1.5";
  /** Large size: the question leads the pill row instead of sitting above it. */
  const lead = large && heading ? <span className="mr-2 text-lg text-sf-muted">{heading}</span> : null;

  const content = (
    <div className={bare || large ? "" : "rounded-xl bg-well/80 px-2.5 py-2"}>
      {!large && (
      <div className={`flex items-center gap-2 text-xs ${bare ? "mb-2.5" : "mb-1.5"}`}>
        {heading ? (
          <span className="min-w-0">{heading}</span>
        ) : bare ? (
          <span className="text-graphite">Optional — shown on your badge.</span>
        ) : (
          <>
            <ToolIcon slug={toolIconSlug(tool)} label={label} size={11} rounded />
            <span className="min-w-0 truncate">
              <span className="font-semibold text-ink">{label}</span>{" "}
              <span className="text-graphite">
                {single ? `${single.name.toLowerCase() === label.toLowerCase() ? "version" : "model"}` : fieldLabel} ·
                optional
              </span>
            </span>
          </>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-0.5">
          {!large && (
            <button
              type="button"
              aria-pressed={isPrimary}
              onClick={() => setPrimary(isPrimary ? null : item.id)}
              title="The primary tool is highlighted on your assets"
              className={[
                "inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] font-medium",
                isPrimary ? "bg-ink text-white" : "text-graphite hover:bg-panel hover:text-ink",
              ].join(" ")}
            >
              <Star aria-hidden="true" className={`size-3 ${isPrimary ? "fill-signal text-signal" : ""}`} />
              {isPrimary ? "Primary" : "Make primary"}
            </button>
          )}
          {onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label={`Hide model options for ${label}`}
              className="inline-flex size-7 items-center justify-center rounded-full text-graphite hover:bg-panel hover:text-ink"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          )}
        </span>
      </div>
      )}

      {models.length === 0 ? (
        <div className={`flex flex-wrap items-center ${gap}`}>
        {lead}
        <InlineInput
          label={`${label} model`}
          value={item.customModel ?? ""}
          maxLength={32}
          placeholder="Model name, e.g. Mixtral 8x22B"
          onChange={(value) => updateItem(item.id, { customModel: value })}
        />
        </div>
      ) : single ? (
        <div role="group" aria-label={`${label} ${single.name} version`} className={`flex flex-wrap items-center ${gap}`}>
          {lead}
          {versionRow(single)}
        </div>
      ) : (
        <>
          <div role="group" aria-label={`${label} ${fieldLabel}`} className={`flex flex-wrap items-center ${gap}`}>
            {lead}
            {visibleFamilies.map((m) => (
              <ChoicePill key={m.id} pressed={item.modelId === m.id} onClick={() => pickFamily(item, m)}>
                {catalog.formatModel(m.id, undefined, tool?.providerId)}
              </ChoicePill>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex h-7 items-center rounded-full px-2.5 text-[12.5px] font-medium text-graphite hover:text-ink"
              >
                +{hiddenCount} more
              </button>
            )}
            <ChoicePill pressed={customModelActive} onClick={() => toggleOtherModel(item)} ghost>
              Other
            </ChoicePill>
            {customModelActive && (
              <InlineInput
                label={`${label} model name`}
                value={item.customModel ?? ""}
                maxLength={32}
                placeholder="Model name"
                onChange={(value) => updateItem(item.id, { customModel: value })}
              />
            )}
          </div>
          {model && model.versions.length > 0 && (
            <div
              role="group"
              aria-label={`${model.name} version`}
              className={`flex flex-wrap items-center ${gap} ${large ? "mt-2.5" : "ml-1.5 mt-1.5 border-l-2 border-rule pl-2.5"}`}
            >
              {large && <span className="mr-2 text-lg text-sf-muted">{model.name}</span>}
              {versionRow(model)}
            </div>
          )}
        </>
      )}
    </div>
  );

  return <PillSize.Provider value={large ? "lg" : "sm"}>{content}</PillSize.Provider>;
}
