import type { CategoryId } from "@/lib/catalog/types";
import type { ThemeId } from "@/lib/themes";

/**
 * Technical safety ceiling for a personal stack — not a product “fill these slots” target.
 * Image exports use a separate featured subset (see MAX_FEATURED_TOOLS).
 */
export const MAX_BADGES = 24;
/** Max tools rendered in Social Post / Profile Banner image exports. */
export const MAX_FEATURED_TOOLS = 6;

/** One catalog model (+ optional version) attached to a selected tool. */
export interface SelectedModelRef {
  modelId: string;
  /** Catalog version id. Mutually exclusive with customVersion. */
  versionId?: string;
  /** User-entered version for a catalog model. */
  customVersion?: string;
}

/** Soft cap so multi-model picks stay scannable. */
export const MAX_MODELS_PER_TOOL = 6;

export interface SelectedItem {
  /** Catalog tool id, or `custom:<slug>` for user-entered tools. Unique per underlying selection. */
  id: string;
  toolId?: string;
  customName?: string;
  /** Category the item was added from. Null for uncategorized custom tools. */
  categoryId: CategoryId | null;
  /**
   * Primary model (first entry of `models`). Kept for backward-compatible persistence
   * and snapshot fields; prefer `models` / helpers when reading.
   */
  modelId?: string;
  /** Catalog version id for the primary model. Mutually exclusive with customVersion. */
  versionId?: string;
  /** User-entered version for a catalog model, e.g. a release newer than the catalog. */
  customVersion?: string;
  /** Free-text model when the catalog doesn't list it. Ignored when modelId is set. */
  customModel?: string;
  /**
   * All models regularly used with this tool (multi-select).
   * When present, `modelId`/`versionId` mirror the first entry.
   */
  models?: SelectedModelRef[];
  showVersion: boolean;
  /**
   * Optional AI capability ids the user explicitly selected for this tool.
   * Only catalog-verified capability ids are persisted; never inferred.
   */
  capabilities?: string[];
}

export type AssetId = "banner" | "xheader" | "square" | "strip" | "github";

export interface StackState {
  v: 1;
  items: SelectedItem[];
  primaryId: string | null;
  /**
   * Explicit featured subset for Social / Banner exports (≤ MAX_FEATURED_TOOLS).
   * When absent or empty after sanitize, exports derive Main + next tools.
   */
  featuredIds?: string[];
  /** Default theme for assets without their own choice. */
  theme: ThemeId;
  /** Per-asset theme choices from the results gallery. */
  assetThemes?: Partial<Record<AssetId, ThemeId>>;
}

/** Render-ready badge data. Renderers never read catalog data directly. */
export interface BadgeData {
  id: string;
  label: string;
  sublabel: string;
  iconSlug?: string;
  monogram: string;
  isPrimary: boolean;
}
