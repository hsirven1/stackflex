import type { CategoryId } from "@/lib/catalog/types";
import type { ThemeId } from "@/lib/themes";

export const MAX_BADGES = 6;

export interface SelectedItem {
  /** Catalog tool id, or `custom:<slug>` for user-entered tools. Unique per underlying selection. */
  id: string;
  toolId?: string;
  customName?: string;
  /** Category the item was added from. Null for uncategorized custom tools. */
  categoryId: CategoryId | null;
  modelId?: string;
  /** Catalog version id. Mutually exclusive with customVersion. */
  versionId?: string;
  /** User-entered version for a catalog model, e.g. a release newer than the catalog. */
  customVersion?: string;
  /** Free-text model when the catalog doesn't list it. Ignored when modelId is set. */
  customModel?: string;
  showVersion: boolean;
}

export type AssetId = "banner" | "xheader" | "square" | "strip" | "github";

export interface StackState {
  v: 1;
  items: SelectedItem[];
  primaryId: string | null;
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
