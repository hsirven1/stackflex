import { deflateSync } from "fflate";
import { catalog } from "@/lib/catalog/adapter";
import type { CategoryId } from "@/lib/catalog/types";
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
  type ShareableActivity,
  type ShareableProfile,
  type SnapshotActivityV2,
  type SnapshotItemV1,
  type StackShareInput,
  type StackSnapshotV2,
} from "./types";

const CATEGORY_IDS = new Set(catalog.categories().map((c) => c.id));

/** URL-safe Base64 without padding. */
export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function categoryOrNull(id: SelectedItem["categoryId"]): CategoryId | null {
  if (id === null) return null;
  return id && CATEGORY_IDS.has(id) ? id : null;
}

function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Normalize a selection item into the compact snapshot shape (deterministic field order). */
export function itemToSnapshot(item: SelectedItem): SnapshotItemV1 | null {
  if (!item.id || typeof item.id !== "string") return null;

  const isCustom = !item.toolId || item.id.startsWith("custom:");
  const t = isCustom ? item.id : item.toolId;
  if (!t) return null;

  const out: SnapshotItemV1 = {
    t,
    c: categoryOrNull(item.categoryId),
  };

  if (isCustom) {
    const name = item.customName?.trim();
    if (!name) return null;
    out.n = name.slice(0, 32);
  }

  const models =
    item.models && item.models.length > 0
      ? item.models
      : item.modelId
        ? [
            {
              modelId: item.modelId,
              versionId: item.versionId,
              customVersion: item.customVersion,
            },
          ]
        : [];
  const primary = models[0];
  if (primary?.modelId) out.m = primary.modelId;
  if (primary?.versionId) out.mv = primary.versionId;
  if (primary?.customVersion?.trim()) out.cv = primary.customVersion.trim().slice(0, 16);
  if (!primary && item.customModel?.trim()) out.cm = item.customModel.trim().slice(0, 32);
  if (models.length > 1) {
    out.ms = models.slice(1, 6).map((m) => {
      const row: { m: string; mv?: string; cv?: string } = { m: m.modelId };
      if (m.versionId) row.mv = m.versionId;
      if (m.customVersion?.trim()) row.cv = m.customVersion.trim().slice(0, 16);
      return row;
    });
  }
  if (item.showVersion === false) out.sv = 0;
  if (item.capabilities?.length) {
    const allowed = new Set(
      (!isCustom ? catalog.tool(t)?.aiCapabilities?.map((c) => c.id) : undefined) ?? [],
    );
    const caps = item.capabilities.filter((id) => allowed.has(id)).slice(0, 12);
    if (caps.length) out.caps = caps;
  }

  return out;
}

function activitiesToSnapshot(
  activities: ShareableActivity[] | null | undefined,
  itemToolIds: Set<string>,
): SnapshotActivityV2[] | undefined {
  if (!activities?.length) return undefined;
  if (activities.length > MAX_SNAPSHOT_ACTIVITIES) {
    throw new Error(
      `Too many activities to share (max ${MAX_SNAPSHOT_ACTIVITIES}). Remove a few and try again.`,
    );
  }

  const acts: SnapshotActivityV2[] = [];
  for (const activity of activities) {
    const label = activity.label?.trim().replace(/\s+/g, " ") ?? "";
    if (!label || label.length > MAX_SNAPSHOT_ACTIVITY_LABEL) {
      throw new Error("Each activity needs a short title (up to 48 characters).");
    }
    const requested = (activity.toolIds ?? []).filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
    if (requested.length === 0) {
      throw new Error(
        `“${label}” needs at least one tool from your stack before it can be shared.`,
      );
    }
    const uniqueRequested = [...new Set(requested)];
    if (uniqueRequested.some((id) => !itemToolIds.has(id))) {
      throw new Error(
        `“${label}” references a tool that is not in this stack. Reassign tools and try again.`,
      );
    }
    if (uniqueRequested.length > MAX_SNAPSHOT_ACTIVITY_TOOLS) {
      throw new Error(
        `“${label}” has too many tools associated (max ${MAX_SNAPSHOT_ACTIVITY_TOOLS}).`,
      );
    }
    acts.push({ l: label.slice(0, MAX_SNAPSHOT_ACTIVITY_LABEL), t: uniqueRequested });
  }
  return acts.length ? acts : undefined;
}

/**
 * Build a versioned snapshot from the editable stack + optional approved identity / activities.
 * Only durable public avatar references are included — never local-only previews or tokens.
 * Activities must already be publishable; invalid refs throw (never silently truncated).
 */
export function createStackSnapshot(
  stack: StackShareInput,
  profile?: ShareableProfile | null,
  activities?: ShareableActivity[] | null,
): StackSnapshotV2 {
  const items: SnapshotItemV1[] = [];
  const seen = new Set<string>();

  for (const item of stack.items.slice(0, MAX_SNAPSHOT_ITEMS)) {
    const snap = itemToSnapshot(item);
    if (!snap || seen.has(snap.t)) continue;
    seen.add(snap.t);
    items.push(snap);
  }

  let main = 0;
  if (stack.primaryId) {
    const idx = stack.items.findIndex((i) => i.id === stack.primaryId);
    if (idx >= 0) {
      const snap = itemToSnapshot(stack.items[idx]!);
      if (snap) {
        const encodedIdx = items.findIndex((i) => i.t === snap.t);
        if (encodedIdx >= 0) main = encodedIdx;
      }
    }
  }

  const out: StackSnapshotV2 = { v: SNAPSHOT_VERSION, items, main };
  const name = profile?.displayName?.trim().slice(0, MAX_SNAPSHOT_NAME);
  const title = profile?.professionalTitle?.trim().slice(0, MAX_SNAPSHOT_TITLE);
  const avatar = profile?.avatarReference?.trim().slice(0, MAX_SNAPSHOT_AVATAR);
  if (name) out.n = name;
  if (title) out.ti = title;
  if (avatar && isHttpsUrl(avatar)) out.av = avatar;
  if (profile?.professionalRole) out.r = profile.professionalRole;

  const itemIds = new Set(items.map((i) => i.t));
  const acts = activitiesToSnapshot(activities, itemIds);
  if (acts) out.acts = acts;
  return out;
}

/** Deterministic JSON with stable key order for reproducible tokens. */
export function serializeSnapshot(snapshot: StackSnapshotV2): string {
  const items = snapshot.items.map((item) => {
    const row: Record<string, unknown> = { t: item.t, c: item.c };
    if (item.m !== undefined) row.m = item.m;
    if (item.mv !== undefined) row.mv = item.mv;
    if (item.cv !== undefined) row.cv = item.cv;
    if (item.cm !== undefined) row.cm = item.cm;
    if (item.ms?.length) {
      row.ms = item.ms.map((extra) => {
        const e: Record<string, unknown> = { m: extra.m };
        if (extra.mv !== undefined) e.mv = extra.mv;
        if (extra.cv !== undefined) e.cv = extra.cv;
        return e;
      });
    }
    if (item.n !== undefined) row.n = item.n;
    if (item.sv === 0) row.sv = 0;
    if (item.caps?.length) row.caps = item.caps;
    return row;
  });
  const body: Record<string, unknown> = { v: snapshot.v, items, main: snapshot.main };
  if (snapshot.n) body.n = snapshot.n;
  if (snapshot.ti) body.ti = snapshot.ti;
  if (snapshot.av) body.av = snapshot.av;
  if (snapshot.r) body.r = snapshot.r;
  if (snapshot.acts?.length) {
    body.acts = snapshot.acts.map((a) => ({ l: a.l, t: a.t }));
  }
  return JSON.stringify(body);
}

/**
 * Encode a snapshot as a URL path token: `v2-<base64url(deflate(json))>`.
 * Compression is for compactness only — not security.
 */
export function encodeStackSnapshot(snapshot: StackSnapshotV2): string {
  if (snapshot.items.length === 0 || snapshot.items.length > MAX_SNAPSHOT_ITEMS) {
    throw new Error(`Snapshot must contain 1–${MAX_SNAPSHOT_ITEMS} tools.`);
  }
  if (snapshot.main < 0 || snapshot.main >= snapshot.items.length) {
    throw new Error("Invalid Main index.");
  }

  const json = serializeSnapshot(snapshot);
  const utf8 = new TextEncoder().encode(json);
  if (utf8.byteLength > MAX_PAYLOAD_BYTES) {
    throw new Error("This stack is too large to fit in a shareable link. Remove a few tools and try again.");
  }

  const compressed = deflateSync(utf8, { level: 9 });
  const token = `v2-${toBase64Url(compressed)}`;
  if (token.length > MAX_TOKEN_CHARS) {
    throw new Error("This stack is too large to fit in a shareable link. Remove a few tools and try again.");
  }
  return token;
}

/** Encode the current editable stack (+ optional identity / activities) into a share token. */
export function encodeStack(
  stack: StackShareInput,
  profile?: ShareableProfile | null,
  activities?: ShareableActivity[] | null,
): string {
  return encodeStackSnapshot(createStackSnapshot(stack, profile, activities));
}
