import { inflateSync } from "fflate";
import { catalog } from "@/lib/catalog/adapter";
import type { CategoryId } from "@/lib/catalog/types";
import { isProfessionalRole } from "@/lib/profile/roles";
import type { SelectedItem } from "@/lib/selection/types";
import {
  MAX_PAYLOAD_BYTES,
  MAX_SNAPSHOT_ACTIVITIES,
  MAX_SNAPSHOT_ACTIVITY_LABEL,
  MAX_SNAPSHOT_ACTIVITY_TOOLS,
  MAX_SNAPSHOT_AVATAR,
  MAX_SNAPSHOT_ITEMS,
  MAX_SNAPSHOT_NAME,
  MAX_SNAPSHOT_TITLE,
  MAX_TOKEN_CHARS,
  SNAPSHOT_VERSION,
  SNAPSHOT_VERSION_V1,
  type DecodeResult,
  type SnapshotActivities,
  type SnapshotActivityV2,
  type SnapshotIdentity,
  type SnapshotItemV1,
  type StackShareInput,
  type StackSnapshot,
  type StackSnapshotV1,
  type StackSnapshotV2,
} from "./types";

const CATEGORY_IDS = new Set(catalog.categories().map((c) => c.id));

/** Decode URL-safe Base64 (with or without padding) into bytes. */
export function fromBase64Url(token: string): Uint8Array | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const b64 = padded + pad;
    if (typeof atob === "function") {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    return new Uint8Array(Buffer.from(b64, "base64"));
  } catch {
    return null;
  }
}

function isCategoryId(value: unknown): value is CategoryId | null {
  if (value === null) return true;
  return typeof value === "string" && CATEGORY_IDS.has(value as CategoryId);
}

function asOptionalString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

function parseSnapshotItem(raw: unknown): SnapshotItemV1 | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.t !== "string" || !r.t || r.t.length > 64) return null;
  if (!isCategoryId(r.c)) return null;

  const item: SnapshotItemV1 = { t: r.t, c: r.c };
  const m = asOptionalString(r.m, 64);
  const mv = asOptionalString(r.mv, 32);
  const cv = asOptionalString(r.cv, 16);
  const cm = asOptionalString(r.cm, 32);
  const n = asOptionalString(r.n, 32);
  if (m) item.m = m;
  if (mv) item.mv = mv;
  if (cv) item.cv = cv;
  if (cm) item.cm = cm;
  if (n) item.n = n;
  if (r.sv === 0) item.sv = 0;
  if (Array.isArray(r.ms)) {
    const ms: NonNullable<SnapshotItemV1["ms"]> = [];
    for (const entry of r.ms.slice(0, 5)) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const em = asOptionalString(e.m, 64);
      if (!em) continue;
      const row: { m: string; mv?: string; cv?: string } = { m: em };
      const emv = asOptionalString(e.mv, 32);
      const ecv = asOptionalString(e.cv, 16);
      if (emv) row.mv = emv;
      if (ecv) row.cv = ecv;
      ms.push(row);
    }
    if (ms.length) item.ms = ms;
  }
  if (Array.isArray(r.caps)) {
    const caps = r.caps
      .filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 48)
      .slice(0, 12);
    if (caps.length) item.caps = caps;
  }
  return item;
}

function parseItemsAndMain(r: Record<string, unknown>): { items: SnapshotItemV1[]; main: number } | null {
  if (!Array.isArray(r.items) || r.items.length < 1 || r.items.length > MAX_SNAPSHOT_ITEMS) return null;
  if (typeof r.main !== "number" || !Number.isInteger(r.main)) return null;
  if (r.main < 0 || r.main >= r.items.length) return null;

  const seen = new Set<string>();
  const items: SnapshotItemV1[] = [];
  for (const entry of r.items) {
    const item = parseSnapshotItem(entry);
    if (!item || seen.has(item.t)) return null;
    seen.add(item.t);
    items.push(item);
  }
  return { items, main: r.main };
}

function parseSnapshotJson(json: string): StackSnapshot | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const r = parsed as Record<string, unknown>;
  const core = parseItemsAndMain(r);
  if (!core) return null;

  if (r.v === SNAPSHOT_VERSION_V1) {
    return { v: SNAPSHOT_VERSION_V1, items: core.items, main: core.main } satisfies StackSnapshotV1;
  }

  if (r.v === SNAPSHOT_VERSION) {
    const snap: StackSnapshotV2 = { v: SNAPSHOT_VERSION, items: core.items, main: core.main };
    const n = asOptionalString(r.n, MAX_SNAPSHOT_NAME);
    const ti = asOptionalString(r.ti, MAX_SNAPSHOT_TITLE);
    const av = asOptionalString(r.av, MAX_SNAPSHOT_AVATAR);
    if (n) snap.n = n;
    if (ti) snap.ti = ti;
    if (av && isHttpsUrl(av)) snap.av = av;
    if (typeof r.r === "string" && isProfessionalRole(r.r)) snap.r = r.r;
    const itemIds = new Set(core.items.map((i) => i.t));
    const acts = parseSnapshotActivities(r.acts, itemIds);
    if (acts === null) return null;
    if (acts.length) snap.acts = acts;
    return snap;
  }

  return null;
}

/**
 * Parse optional `acts`. Missing / empty → []. Invalid shape → null (reject snapshot).
 * Tool refs must exist in the snapshot items; never invent or drop silently mid-list.
 */
function parseSnapshotActivities(
  raw: unknown,
  itemIds: Set<string>,
): SnapshotActivityV2[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_SNAPSHOT_ACTIVITIES) return null;

  const acts: SnapshotActivityV2[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const r = entry as Record<string, unknown>;
    const label = asOptionalString(r.l, MAX_SNAPSHOT_ACTIVITY_LABEL);
    if (!label) return null;
    if (!Array.isArray(r.t) || r.t.length < 1 || r.t.length > MAX_SNAPSHOT_ACTIVITY_TOOLS) {
      return null;
    }
    const toolIds: string[] = [];
    const seen = new Set<string>();
    for (const id of r.t) {
      if (typeof id !== "string" || !id || id.length > 64) return null;
      if (!itemIds.has(id)) return null;
      if (seen.has(id)) continue;
      seen.add(id);
      toolIds.push(id);
    }
    if (!toolIds.length) return null;
    acts.push({ l: label, t: toolIds });
  }
  return acts;
}

/**
 * Hydrate a snapshot item into selection state without dropping legacy IDs.
 * Unknown catalog tools become custom-display items; unknown models become customModel text.
 */
export function hydrateSnapshotItem(item: SnapshotItemV1): SelectedItem {
  const showVersion = item.sv !== 0;
  const isCustomId = item.t.startsWith("custom:");
  const catalogTool = !isCustomId ? catalog.tool(item.t) : undefined;

  if (catalogTool) {
    const model = item.m ? catalog.model(item.m) : undefined;
    const versionId =
      model && item.mv && model.versions.some((v) => v.id === item.mv) ? item.mv : undefined;
    const legacyModelLabel =
      item.cm ||
      [item.m, showVersion ? item.mv || item.cv : undefined].filter(Boolean).join(" ") ||
      undefined;
    const allowedCaps = new Set(catalogTool.aiCapabilities?.map((c) => c.id) ?? []);
    const capabilities =
      item.caps?.filter((id) => allowedCaps.has(id)).slice(0, 12) ?? undefined;
    const models: import("@/lib/selection/types").SelectedModelRef[] = [];
    if (model) {
      models.push({
        modelId: model.id,
        ...(versionId ? { versionId } : {}),
        ...(!versionId && (item.cv || item.mv)
          ? { customVersion: (item.cv || item.mv)!.slice(0, 16) }
          : {}),
      });
    }
    for (const extra of item.ms ?? []) {
      const em = catalog.model(extra.m);
      if (!em) continue;
      const ev =
        extra.mv && em.versions.some((v) => v.id === extra.mv) ? extra.mv : undefined;
      models.push({
        modelId: em.id,
        ...(ev ? { versionId: ev } : {}),
        ...(!ev && extra.cv ? { customVersion: extra.cv.slice(0, 16) } : {}),
      });
    }
    const primary = models[0];
    return {
      id: catalogTool.id,
      toolId: catalogTool.id,
      categoryId: item.c,
      modelId: primary?.modelId ?? model?.id,
      versionId: primary?.versionId ?? versionId,
      customVersion: primary?.customVersion ?? (model && !versionId ? item.cv || item.mv : undefined),
      customModel: primary ? undefined : model ? item.cm : legacyModelLabel,
      ...(models.length > 0 ? { models } : {}),
      showVersion,
      ...(capabilities && capabilities.length > 0 ? { capabilities } : {}),
    };
  }

  const name =
    item.n?.trim() ||
    (isCustomId ? item.t.replace(/^custom:/, "").replace(/-/g, " ") : item.t) ||
    "Untitled";
  return {
    id: isCustomId ? item.t : `custom:legacy-${item.t}`.slice(0, 48),
    customName: name.slice(0, 32),
    categoryId: item.c,
    customModel: item.cm || item.m,
    customVersion: item.cv || item.mv,
    showVersion,
  };
}

export function hydrateSnapshot(snapshot: StackSnapshot): StackShareInput {
  const items = snapshot.items.map(hydrateSnapshotItem);
  const mainItem = items[snapshot.main];
  return {
    items,
    primaryId: mainItem?.id ?? items[0]?.id ?? null,
  };
}

export function identityFromSnapshot(snapshot: StackSnapshot): SnapshotIdentity {
  if (snapshot.v !== SNAPSHOT_VERSION) return {};
  return {
    displayName: snapshot.n,
    professionalTitle: snapshot.ti,
    avatarReference: snapshot.av,
    professionalRole: isProfessionalRole(snapshot.r) ? snapshot.r : undefined,
  };
}

export function activitiesFromSnapshot(snapshot: StackSnapshot): SnapshotActivities {
  if (snapshot.v !== SNAPSHOT_VERSION) return [];
  return snapshot.acts ?? [];
}

/**
 * Decode a path token produced by `encodeStackSnapshot`.
 * Supports `v1-` (tools only) and `v2-` (tools + optional identity).
 */
export function decodeStackSnapshot(token: string): DecodeResult {
  if (typeof token !== "string" || !token) {
    return { ok: false, error: "missing" };
  }
  if (token.length > MAX_TOKEN_CHARS) {
    return { ok: false, error: "oversized" };
  }

  const match = /^v(\d+)-([A-Za-z0-9_-]+)$/.exec(token);
  if (!match) return { ok: false, error: "malformed" };

  const version = Number(match[1]);
  if (version !== SNAPSHOT_VERSION_V1 && version !== SNAPSHOT_VERSION) {
    return { ok: false, error: "unsupported_version" };
  }

  const bytes = fromBase64Url(match[2]!);
  if (!bytes || bytes.length === 0) return { ok: false, error: "invalid_encoding" };
  if (bytes.length > MAX_PAYLOAD_BYTES) return { ok: false, error: "oversized" };

  let inflated: Uint8Array;
  try {
    inflated = inflateSync(bytes);
  } catch {
    return { ok: false, error: "invalid_compression" };
  }
  if (inflated.byteLength === 0 || inflated.byteLength > MAX_PAYLOAD_BYTES) {
    return { ok: false, error: "oversized" };
  }

  let json: string;
  try {
    json = new TextDecoder("utf-8", { fatal: true }).decode(inflated);
  } catch {
    return { ok: false, error: "invalid_utf8" };
  }

  const snapshot = parseSnapshotJson(json);
  if (!snapshot) return { ok: false, error: "invalid_snapshot" };
  // Token prefix must match payload version.
  if (snapshot.v !== version) return { ok: false, error: "version_mismatch" };

  return {
    ok: true,
    snapshot,
    stack: hydrateSnapshot(snapshot),
    identity: identityFromSnapshot(snapshot),
    activities: activitiesFromSnapshot(snapshot),
  };
}
