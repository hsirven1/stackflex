import { useSyncExternalStore } from "react";
import { catalog, normalize } from "@/lib/catalog/adapter";
import type { CategoryId } from "@/lib/catalog/types";
import { track } from "@/lib/integrations/analytics";
import { THEME_IDS, type ThemeId } from "@/lib/themes";
import {
  MAX_BADGES,
  MAX_FEATURED_TOOLS,
  MAX_MODELS_PER_TOOL,
  type AssetId,
  type SelectedItem,
  type SelectedModelRef,
  type StackState,
} from "./types";
import { modelRefKey } from "./derive";

const STORAGE_KEY = "stackflex:v1";
const ASSET_IDS: AssetId[] = ["banner", "xheader", "square", "strip", "github"];
const CATEGORY_IDS = new Set(catalog.categories().map((c) => c.id));
const CUSTOM_NAME_MAX = 32;
const CUSTOM_VERSION_MAX = 16;

const DEFAULT_STATE: StackState = { v: 1, items: [], primaryId: null, theme: "light" };

let state: StackState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function sanitizeCapabilities(toolId: string | undefined, raw: unknown): string[] | undefined {
  if (!toolId || !Array.isArray(raw) || raw.length === 0) return undefined;
  const allowed = new Set(catalog.tool(toolId)?.aiCapabilities?.map((c) => c.id) ?? []);
  if (allowed.size === 0) return undefined;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id !== "string" || !allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out.length > 0 ? out : undefined;
}

function sanitizeModelRef(raw: unknown): SelectedModelRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SelectedModelRef>;
  if (typeof r.modelId !== "string") return null;
  const model = catalog.model(r.modelId);
  if (!model) return null;
  const versionId = model.versions.some((v) => v.id === r.versionId) ? r.versionId : undefined;
  const customVersion =
    !versionId && typeof r.customVersion === "string"
      ? r.customVersion.slice(0, CUSTOM_VERSION_MAX)
      : undefined;
  return {
    modelId: model.id,
    ...(versionId ? { versionId } : {}),
    ...(customVersion ? { customVersion } : {}),
  };
}

/** Normalize multi-model array; fall back to legacy single modelId fields. */
function sanitizeModels(
  rawModels: unknown,
  legacy: Pick<SelectedItem, "modelId" | "versionId" | "customVersion">,
): SelectedModelRef[] {
  const out: SelectedModelRef[] = [];
  const seen = new Set<string>();
  const push = (ref: SelectedModelRef | null) => {
    if (!ref || seen.has(modelRefKey(ref))) return;
    seen.add(modelRefKey(ref));
    out.push(ref);
  };
  if (Array.isArray(rawModels)) {
    for (const entry of rawModels) push(sanitizeModelRef(entry));
  }
  if (out.length === 0 && legacy.modelId) {
    push(
      sanitizeModelRef({
        modelId: legacy.modelId,
        versionId: legacy.versionId,
        customVersion: legacy.customVersion,
      }),
    );
  }
  return out.slice(0, MAX_MODELS_PER_TOOL);
}

function sanitizeItem(raw: unknown): SelectedItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SelectedItem>;
  if (typeof r.id !== "string") return null;
  if (r.categoryId !== null && !(r.categoryId && CATEGORY_IDS.has(r.categoryId))) return null;
  if (r.toolId && (!catalog.tool(r.toolId) || r.id !== r.toolId)) return null;
  if (!r.toolId && !(typeof r.customName === "string" && r.customName.trim())) return null;
  const models = sanitizeModels(r.models, r);
  const primary = models[0];
  const legacyModel = r.modelId ? catalog.model(r.modelId) : undefined;
  const capabilities = sanitizeCapabilities(r.toolId, r.capabilities);
  return {
    id: r.id,
    toolId: r.toolId,
    customName: r.toolId ? undefined : r.customName?.slice(0, CUSTOM_NAME_MAX),
    categoryId: r.categoryId,
    modelId: primary?.modelId,
    versionId: primary?.versionId,
    customVersion: primary?.customVersion,
    customModel:
      !primary && !legacyModel && typeof r.customModel === "string"
        ? r.customModel.slice(0, CUSTOM_NAME_MAX)
        : undefined,
    ...(models.length > 0 ? { models } : {}),
    showVersion: r.showVersion !== false,
    ...(capabilities ? { capabilities } : {}),
  };
}

function sanitize(raw: unknown): StackState {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const r = raw as Partial<StackState>;
  const seen = new Set<string>();
  const items = (Array.isArray(r.items) ? r.items : [])
    .map(sanitizeItem)
    .filter((item): item is SelectedItem => {
      if (!item || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_BADGES);
  const isTheme = (t: unknown): t is ThemeId => THEME_IDS.includes(t as ThemeId);
  const assetThemes: Partial<Record<AssetId, ThemeId>> = {};
  if (r.assetThemes && typeof r.assetThemes === "object") {
    for (const asset of ASSET_IDS) {
      const t = (r.assetThemes as Record<string, unknown>)[asset];
      if (isTheme(t)) assetThemes[asset] = t;
    }
  }
  const itemIds = new Set(items.map((i) => i.id));
  const featuredIds = Array.isArray(r.featuredIds)
    ? r.featuredIds.filter((id): id is string => typeof id === "string" && itemIds.has(id)).slice(0, MAX_FEATURED_TOOLS)
    : undefined;
  return {
    v: 1,
    items,
    primaryId: items.some((i) => i.id === r.primaryId) ? (r.primaryId as string) : null,
    featuredIds: featuredIds && featuredIds.length > 0 ? featuredIds : undefined,
    theme: isTheme(r.theme) ? r.theme : "light",
    assetThemes,
  };
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = sanitize(JSON.parse(raw));
  } catch {
    state = DEFAULT_STATE;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * While a draft is open (the results "Edit stack" drawer), every action below edits the draft;
 * the saved stack and its previews only change on saveDraft().
 */
let draft: StackState | null = null;

function commit(next: StackState) {
  if (draft) {
    draft = next;
    emit();
    return;
  }
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode, quota); selections still work for the session.
  }
  emit();
}

/**
 * Makes sure the saved copy holds the current stack, writing it again if it doesn't. False when the
 * write didn't stick. True when storage is unavailable: the stack then lives for the session.
 */
export function ensureStackSaved(): boolean {
  load();
  const ids = (s: StackState) => s.items.map((i) => i.id).join();
  const same = (raw: string | null) => {
    try {
      return raw !== null && ids(sanitize(JSON.parse(raw))) === ids(state);
    } catch {
      return false;
    }
  };
  try {
    if (same(window.localStorage.getItem(STORAGE_KEY))) return true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return same(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return error instanceof DOMException;
  }
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  loaded = false;
  load();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return DEFAULT_STATE;
}

export function useStack(): StackState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** False during SSR and hydration, true once client state (localStorage) is in use. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* ---------- Transient notices (not persisted) ---------- */

export interface Notice {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

let notice: Notice | null = null;
let noticeTimer: ReturnType<typeof setTimeout> | undefined;
const noticeListeners = new Set<() => void>();

export function dismissNotice() {
  clearTimeout(noticeTimer);
  notice = null;
  noticeListeners.forEach((l) => l());
}

export function showNotice(text: string, action?: Notice["action"]) {
  notice = { id: (notice?.id ?? 0) + 1, text, action };
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(dismissNotice, action ? 6000 : 4000);
  noticeListeners.forEach((l) => l());
}

export function useNotice(): Notice | null {
  return useSyncExternalStore(
    (listener) => {
      noticeListeners.add(listener);
      return () => noticeListeners.delete(listener);
    },
    () => notice,
    () => null,
  );
}

/* ---------- Actions ---------- */

export type AddResult = "added" | "updated" | "exists" | "limit" | "invalid";

const LIMIT_MESSAGE = `You’ve reached the maximum of ${MAX_BADGES} tools. Remove one to add another.`;

function current() {
  load();
  return draft ?? state;
}

export function useDraft(): StackState | null {
  return useSyncExternalStore(
    subscribe,
    () => draft,
    () => null,
  );
}

export function beginDraft() {
  load();
  draft = { ...state, items: state.items.map((i) => ({ ...i })) };
  emit();
}

export function saveDraft() {
  const next = draft;
  draft = null;
  if (next) commit(next);
  else emit();
}

export function discardDraft() {
  draft = null;
  emit();
}

export function isSelected(id: string) {
  return current().items.some((i) => i.id === id);
}

export function addTool(
  toolId: string,
  categoryId: CategoryId,
  patch: Partial<Pick<SelectedItem, "modelId" | "versionId" | "customVersion">> = {},
  source: "quick_pick" | "search" | "more" = "quick_pick",
): AddResult {
  const s = current();
  if (!catalog.tool(toolId)) return "invalid";
  const existing = s.items.find((i) => i.id === toolId);
  if (existing) {
    if (!patch.modelId) return "exists";
    updateItem(toolId, { versionId: undefined, customVersion: undefined, ...patch, customModel: undefined });
    return "updated";
  }
  if (s.items.length >= MAX_BADGES) {
    showNotice(LIMIT_MESSAGE);
    return "limit";
  }
  const item: SelectedItem = { id: toolId, toolId, categoryId, showVersion: true, ...patch };
  const nextItems = [...s.items, item];
  // First tool becomes Main automatically; users can change it later.
  const primaryId = s.primaryId ?? (s.items.length === 0 ? toolId : null);
  commit({ ...s, items: nextItems, primaryId, featuredIds: pruneFeatured(s.featuredIds, nextItems) });
  track({ name: "tool_added", props: { toolId, source } });
  return "added";
}

function pruneFeatured(featuredIds: string[] | undefined, items: SelectedItem[]): string[] | undefined {
  if (!featuredIds?.length) return undefined;
  const ids = new Set(items.map((i) => i.id));
  const next = featuredIds.filter((id) => ids.has(id)).slice(0, MAX_FEATURED_TOOLS);
  return next.length > 0 ? next : undefined;
}

export function toggleTool(toolId: string, categoryId: CategoryId, source: "quick_pick" | "more" = "quick_pick") {
  if (isSelected(toolId)) {
    removeItem(toolId);
    return "removed" as const;
  }
  return addTool(toolId, categoryId, {}, source);
}

function clampAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const space = cut.lastIndexOf(" ");
  return (space > max / 2 ? cut.slice(0, space) : text.slice(0, max)).trim();
}

export function addCustomTool(name: string, categoryId: CategoryId | null): AddResult {
  const clean = clampAtWord(name.replace(/\s+/g, " ").trim(), CUSTOM_NAME_MAX);
  if (!clean) return "invalid";
  const match = catalog.resolveToolByName(clean);
  if (match) {
    const result = addTool(match.id, categoryId ?? match.categories[0], {}, "search");
    if (result === "exists") showNotice(`${match.name} is already in your stack.`);
    return result;
  }
  const id = `custom:${normalize(clean).replace(/ /g, "-")}`;
  const s = current();
  if (s.items.some((i) => i.id === id)) {
    showNotice(`${clean} is already in your stack.`);
    return "exists";
  }
  if (s.items.length >= MAX_BADGES) {
    showNotice(LIMIT_MESSAGE);
    return "limit";
  }
  const item: SelectedItem = { id, customName: clean, categoryId, showVersion: true };
  const nextItems = [...s.items, item];
  const primaryId = s.primaryId ?? (s.items.length === 0 ? id : null);
  commit({ ...s, items: nextItems, primaryId, featuredIds: pruneFeatured(s.featuredIds, nextItems) });
  track({ name: "custom_tool_added", props: {} });
  showNotice(`Added ${clean}.`);
  return "added";
}

export function removeItem(id: string) {
  const s = current();
  const nextItems = s.items.filter((i) => i.id !== id);
  let primaryId = s.primaryId === id ? null : s.primaryId;
  if (!primaryId && nextItems[0]) primaryId = nextItems[0].id;
  commit({
    ...s,
    items: nextItems,
    primaryId,
    featuredIds: pruneFeatured(s.featuredIds, nextItems),
  });
  if (!id.startsWith("custom:")) track({ name: "tool_removed", props: { toolId: id } });
}

export function updateItem(id: string, patch: Partial<Omit<SelectedItem, "id" | "toolId">>) {
  const s = current();
  const next = { ...patch };
  if (next.customModel !== undefined) next.customModel = next.customModel.slice(0, CUSTOM_NAME_MAX);
  if (next.customVersion !== undefined) next.customVersion = next.customVersion.slice(0, CUSTOM_VERSION_MAX);
  if (next.capabilities !== undefined) {
    const item = s.items.find((i) => i.id === id);
    next.capabilities = sanitizeCapabilities(item?.toolId, next.capabilities);
  }
  // Keep models[] in sync when callers patch the legacy primary fields.
  if ("modelId" in patch || "models" in patch) {
    const models =
      next.models !== undefined
        ? sanitizeModels(next.models, next)
        : sanitizeModels(undefined, {
            modelId: next.modelId,
            versionId: next.versionId,
            customVersion: next.customVersion,
          });
    const primary = models[0];
    next.models = models.length > 0 ? models : undefined;
    next.modelId = primary?.modelId;
    next.versionId = primary?.versionId;
    next.customVersion = primary?.customVersion;
    if (primary) next.customModel = undefined;
  }
  commit({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...next } : i)) });
  if (patch.modelId && !id.startsWith("custom:")) {
    track({ name: "model_selected", props: { toolId: id, modelId: patch.modelId, versionId: patch.versionId } });
  }
}

/** Replace the multi-model list for a tool (deduped, capped). Clears when empty. */
export function setItemModels(id: string, models: SelectedModelRef[]) {
  const cleaned = sanitizeModels(models, {});
  const primary = cleaned[0];
  updateItem(id, {
    models: cleaned.length > 0 ? cleaned : undefined,
    modelId: primary?.modelId,
    versionId: primary?.versionId,
    customVersion: primary?.customVersion,
    customModel: undefined,
    showVersion: true,
  });
  if (primary && !id.startsWith("custom:")) {
    track({
      name: "model_selected",
      props: { toolId: id, modelId: primary.modelId, versionId: primary.versionId },
    });
  }
}

export function setPrimary(id: string | null) {
  const s = current();
  const primaryId = id && s.items.some((i) => i.id === id) ? id : null;
  commit({ ...s, primaryId });
}

/**
 * Reorder the stack. The first id becomes Main so card/banner truncation
 * follows this list order (via stackTools). Clears an explicit featured subset
 * so one ordered stack remains the source of truth for exports.
 */
export function reorderItems(orderedIds: string[]) {
  const s = current();
  if (orderedIds.length === 0) return;
  const byId = new Map(s.items.map((i) => [i.id, i]));
  const nextItems: SelectedItem[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (!item) continue;
    nextItems.push(item);
    byId.delete(id);
  }
  for (const item of byId.values()) nextItems.push(item);
  if (nextItems.length === 0) return;
  const same =
    nextItems.length === s.items.length && nextItems.every((item, i) => item.id === s.items[i]?.id);
  if (same && s.primaryId === nextItems[0]!.id && !s.featuredIds?.length) return;
  commit({
    ...s,
    items: nextItems,
    primaryId: nextItems[0]!.id,
    featuredIds: undefined,
  });
}

/** Replace the featured export subset. Main is always included when present. */
export function setFeaturedIds(ids: string[]) {
  const s = current();
  const allowed = new Set(s.items.map((i) => i.id));
  let next = ids.filter((id) => allowed.has(id)).slice(0, MAX_FEATURED_TOOLS);
  const mainId = s.primaryId && allowed.has(s.primaryId) ? s.primaryId : s.items[0]?.id;
  if (mainId) {
    if (!next.includes(mainId)) next = [mainId, ...next].slice(0, MAX_FEATURED_TOOLS);
    else if (next[0] !== mainId) next = [mainId, ...next.filter((id) => id !== mainId)];
  }
  commit({ ...s, featuredIds: next.length > 0 ? next : undefined });
}

/** Clear custom featured selection so exports fall back to Main + next tools. */
export function clearFeaturedIds() {
  const s = current();
  if (!s.featuredIds?.length) return;
  commit({ ...s, featuredIds: undefined });
}

export function setAssetTheme(asset: AssetId, theme: ThemeId) {
  const s = current();
  commit({ ...s, assetThemes: { ...s.assetThemes, [asset]: theme } });
  track({ name: "theme_changed", props: { theme } });
}

export function assetTheme(s: StackState, asset: AssetId): ThemeId {
  return s.assetThemes?.[asset] ?? s.theme;
}

export function clearAll() {
  const s = current();
  if (s.items.length === 0) return;
  commit({ ...s, items: [], primaryId: null, featuredIds: undefined });
  showNotice("Stack cleared.", {
    label: "Undo",
    run: () =>
      commit({
        ...current(),
        items: s.items,
        primaryId: s.primaryId,
        featuredIds: s.featuredIds,
      }),
  });
}

/** Copy a loadout (e.g. the example) into the user's own editable selection. */
export function adoptLoadout(source: Pick<StackState, "items" | "primaryId" | "featuredIds">) {
  const s = current();
  const items = source.items.map((i) => ({ ...i })).slice(0, MAX_BADGES);
  commit({
    ...s,
    items,
    primaryId: source.primaryId && items.some((i) => i.id === source.primaryId) ? source.primaryId : items[0]?.id ?? null,
    featuredIds: pruneFeatured(source.featuredIds, items),
  });
}
