import { useSyncExternalStore } from "react";
import { catalog, normalize } from "@/lib/catalog/adapter";
import type { CategoryId } from "@/lib/catalog/types";
import { track } from "@/lib/integrations/analytics";
import { THEME_IDS, type ThemeId } from "@/lib/themes";
import { MAX_BADGES, type AssetId, type SelectedItem, type StackState } from "./types";

const STORAGE_KEY = "stackflex:v1";
const ASSET_IDS: AssetId[] = ["banner", "xheader", "square", "strip", "github"];
const CATEGORY_IDS = new Set(catalog.categories().map((c) => c.id));
const CUSTOM_NAME_MAX = 32;
const CUSTOM_VERSION_MAX = 16;

const DEFAULT_STATE: StackState = { v: 1, items: [], primaryId: null, theme: "light" };

let state: StackState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function sanitizeItem(raw: unknown): SelectedItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<SelectedItem>;
  if (typeof r.id !== "string") return null;
  if (r.categoryId !== null && !(r.categoryId && CATEGORY_IDS.has(r.categoryId))) return null;
  if (r.toolId && (!catalog.tool(r.toolId) || r.id !== r.toolId)) return null;
  if (!r.toolId && !(typeof r.customName === "string" && r.customName.trim())) return null;
  const model = r.modelId ? catalog.model(r.modelId) : undefined;
  const versionId = model && model.versions.some((v) => v.id === r.versionId) ? r.versionId : undefined;
  return {
    id: r.id,
    toolId: r.toolId,
    customName: r.toolId ? undefined : r.customName?.slice(0, CUSTOM_NAME_MAX),
    categoryId: r.categoryId,
    modelId: model?.id,
    versionId,
    customVersion:
      model && !versionId && typeof r.customVersion === "string"
        ? r.customVersion.slice(0, CUSTOM_VERSION_MAX)
        : undefined,
    customModel:
      !model && typeof r.customModel === "string" ? r.customModel.slice(0, CUSTOM_NAME_MAX) : undefined,
    showVersion: r.showVersion !== false,
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
  return {
    v: 1,
    items,
    primaryId: items.some((i) => i.id === r.primaryId) ? (r.primaryId as string) : null,
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

const LIMIT_MESSAGE = `Your stack is full (${MAX_BADGES} of ${MAX_BADGES}). Remove a tool to add another.`;

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
  commit({ ...s, items: [...s.items, item] });
  track({ name: "tool_added", props: { toolId, source } });
  return "added";
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
  commit({ ...s, items: [...s.items, { id, customName: clean, categoryId, showVersion: true }] });
  track({ name: "custom_tool_added", props: {} });
  showNotice(`Added ${clean}.`);
  return "added";
}

export function removeItem(id: string) {
  const s = current();
  commit({
    ...s,
    items: s.items.filter((i) => i.id !== id),
    primaryId: s.primaryId === id ? null : s.primaryId,
  });
  if (!id.startsWith("custom:")) track({ name: "tool_removed", props: { toolId: id } });
}

export function updateItem(id: string, patch: Partial<Omit<SelectedItem, "id" | "toolId">>) {
  const s = current();
  const next = { ...patch };
  if (next.customModel !== undefined) next.customModel = next.customModel.slice(0, CUSTOM_NAME_MAX);
  if (next.customVersion !== undefined) next.customVersion = next.customVersion.slice(0, CUSTOM_VERSION_MAX);
  commit({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...next } : i)) });
  if (patch.modelId && !id.startsWith("custom:")) {
    track({ name: "model_selected", props: { toolId: id, modelId: patch.modelId, versionId: patch.versionId } });
  }
}

export function setPrimary(id: string | null) {
  const s = current();
  commit({ ...s, primaryId: id && s.items.some((i) => i.id === id) ? id : null });
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
  commit({ ...s, items: [], primaryId: null });
  showNotice("Stack cleared.", {
    label: "Undo",
    run: () => commit({ ...current(), items: s.items, primaryId: s.primaryId }),
  });
}

/** Copy a loadout (e.g. the example) into the user's own editable selection. */
export function adoptLoadout(source: Pick<StackState, "items" | "primaryId">) {
  const s = current();
  commit({ ...s, items: source.items.map((i) => ({ ...i })).slice(0, MAX_BADGES), primaryId: source.primaryId });
}
