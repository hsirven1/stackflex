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

/** Discovery taxonomy for AI inside everyday business platforms. */
export type BusinessCategoryId =
  | "marketing"
  | "sales-crm"
  | "commerce"
  | "product-projects"
  | "operations"
  | "customer-support";

export type ToolType = "ai-native" | "business-ai";

/**
 * Primary signal for AI working-style classification.
 * Distinct from personal purpose (`CategoryId`) and picker discovery.
 */
export type WorkingStyleCategoryId =
  | "assistant"
  | "work_apps"
  | "build"
  | "agents"
  | "create"
  | "research"
  | "meetings"
  | "local";

export interface AiCapability {
  /** Stable id stored on selections / snapshots. */
  id: string;
  /** Plain-language label shown in the optional capability picker. */
  label: string;
}

export interface CatalogTool {
  id: string;
  name: string;
  providerId: string;
  iconSlug?: string;
  /** Fallback letters when no logo asset exists. */
  monogram?: string;
  categories: CategoryId[];
  /** Short plain description, used as badge attribution when the provider shares the tool's name. */
  descriptor: string;
  aliases?: string[];
  modelIds?: string[];
  /** Approved card color (6-digit hex). Tools without one use the neutral card color. */
  aura?: string;
  /**
   * How the tool is discovered. Defaults to ai-native.
   * business-ai = AI capability inside a business platform (not the platform alone).
   */
  toolType?: ToolType;
  /** Parent product/platform when this entry represents an AI feature (e.g. HubSpot for Breeze). */
  parentPlatform?: string;
  /** Business discovery subcategories (tools may belong to several). */
  businessCategories?: BusinessCategoryId[];
  /** Optional curated AI features the user can claim later — never auto-selected. */
  aiCapabilities?: AiCapability[];
  /**
   * Primary working-style bucket for classification.
   * When omitted, derived from toolType / categories via `workingStyleCategoryFor`.
   */
  workingStyleCategory?: WorkingStyleCategoryId;
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
