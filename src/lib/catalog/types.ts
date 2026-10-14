export type CategoryId =
  | "daily"
  | "coding"
  | "creative"
  | "automation"
  | "research"
  | "local";

export interface Provider {
  id: string;
  name: string;
  iconSlug?: string;
}

export interface ModelVersion {
  id: string;
  /** Version fragment, e.g. "4.5" or "o3". Combined with the model's format strings. */
  label: string;
}

export interface CatalogModel {
  id: string;
  /** Full family name, e.g. "Claude Opus". */
  name: string;
  /** Name used when the host tool is from the same provider, e.g. "Opus". */
  shortName?: string;
  /** Template for full name with version, `{v}` is replaced. Defaults to `${name} {v}`. */
  format?: string;
  /** Template used with shortName. Defaults to `${shortName ?? name} {v}`. */
  shortFormat?: string;
  providerId: string;
  versions: ModelVersion[];
  aliases?: string[];
  /** Tool to add when this model is picked from global search and no selected tool supports it. */
  defaultToolId?: string;
  /** Matching identifiers for a future OpenRouter-backed adapter, e.g. "anthropic/claude-opus-4.1". */
  openRouterIds?: string[];
}

export interface CatalogTool {
  id: string;
  name: string;
  providerId: string;
  iconSlug?: string;
  categories: CategoryId[];
  /** Short plain description, used as badge attribution when the provider shares the tool's name. */
  descriptor: string;
  aliases?: string[];
  modelIds?: string[];
  /** Approved card color (6-digit hex). Tools without one use the neutral card color. */
  aura?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  /** Uppercase-friendly short label used in the loadout dock. */
  shortName: string;
  /** One-word label on the stack card's category pill, e.g. "Build". */
  cardLabel: string;
  description: string;
  /** 3-5 tool ids shown as one-tap picks. */
  quickPicks: string[];
}

export type SearchResult =
  | { kind: "tool"; tool: CatalogTool; score: number }
  | { kind: "model"; model: CatalogModel; versionId?: string; score: number };
