import type { BusinessCategoryId, CatalogTool, CategoryId } from "./types";

/**
 * Discovery groups for browsing the catalog.
 * Separate from personal purpose (`CategoryId`) — finding a tool ≠ how you use it.
 * Also separate from public profile grouping (AI Apps / AI-Powered Software).
 */
export type DiscoveryId =
  | "assistants"
  | "business-ai"
  | "coding"
  | "image"
  | "video-audio"
  | "research"
  | "automation"
  | "local";

/** Unified picker chips — practical needs, not profile classification. */
export type PickerFilterId =
  | "assistants"
  | "coding"
  | "image"
  | "video-audio"
  | "research"
  | "marketing-crm"
  | "commerce"
  | "productivity"
  | "automation"
  | "local";

export interface DiscoverySection {
  id: DiscoveryId;
  name: string;
  shortName: string;
}

export interface PickerFilterSection {
  id: PickerFilterId;
  name: string;
  shortName: string;
}

export const DISCOVERY_SECTIONS: DiscoverySection[] = [
  { id: "assistants", name: "AI Assistants", shortName: "Assistants" },
  { id: "business-ai", name: "Business AI", shortName: "Business AI" },
  { id: "coding", name: "Coding & Building", shortName: "Coding" },
  { id: "image", name: "Image & Design", shortName: "Image & Design" },
  { id: "video-audio", name: "Video & Audio", shortName: "Video & Audio" },
  { id: "research", name: "Research & Learning", shortName: "Research" },
  { id: "automation", name: "Automation", shortName: "Automation" },
  { id: "local", name: "Local AI", shortName: "Local AI" },
];

/** Practical filter chips for the unified picker (All is rendered separately). */
export const PICKER_FILTER_SECTIONS: PickerFilterSection[] = [
  { id: "assistants", name: "AI Assistants", shortName: "Assistants" },
  { id: "coding", name: "Coding & Building", shortName: "Coding" },
  { id: "image", name: "Image & Design", shortName: "Image & Design" },
  { id: "video-audio", name: "Video & Audio", shortName: "Video & Audio" },
  { id: "research", name: "Research & Learning", shortName: "Research" },
  { id: "marketing-crm", name: "Marketing & CRM", shortName: "Marketing & CRM" },
  { id: "commerce", name: "Commerce", shortName: "Commerce" },
  { id: "productivity", name: "Productivity & Projects", shortName: "Productivity & Projects" },
  { id: "automation", name: "Automation", shortName: "Automation" },
  { id: "local", name: "Local AI", shortName: "Local AI" },
];

/**
 * @deprecated Prefer PICKER_FILTER_SECTIONS — kept for older call sites.
 * Subcategory chips under the former “AI tools I use” tile.
 */
export const NATIVE_DISCOVERY_SECTIONS: DiscoverySection[] = DISCOVERY_SECTIONS.filter(
  (s) => s.id !== "business-ai",
);

/** Primary public-profile group — derived from catalog `toolType`, not personal purpose. */
export type ExperienceBrowseGroup = "tools" | "work";

export interface BusinessCategorySection {
  id: BusinessCategoryId;
  name: string;
  shortName: string;
  /** Extra search phrases that should surface tools in this area. */
  aliases?: string[];
}

export const BUSINESS_CATEGORIES: BusinessCategorySection[] = [
  { id: "marketing", name: "Marketing", shortName: "Marketing", aliases: ["campaigns", "email marketing", "content marketing"] },
  {
    id: "sales-crm",
    name: "Sales & CRM",
    shortName: "Sales & CRM",
    aliases: ["crm", "sales", "revenue", "pipeline"],
  },
  { id: "commerce", name: "Commerce", shortName: "Commerce", aliases: ["ecommerce", "e-commerce", "store", "retail"] },
  {
    id: "product-projects",
    name: "Product & Projects",
    shortName: "Product & Projects",
    aliases: ["project management", "product management", "roadmap"],
  },
  { id: "operations", name: "Operations", shortName: "Operations", aliases: ["ops", "workflows", "productivity"] },
  {
    id: "customer-support",
    name: "Customer Support",
    shortName: "Customer Support",
    aliases: ["customer service", "helpdesk", "support", "service"],
  },
];

/** Creative tools that belong under Image & Design (not Video & Audio). */
const IMAGE_DESIGN_TOOLS = new Set([
  "claude-design",
  "midjourney",
  "firefly",
  "ideogram",
  "stable-diffusion",
  "canva-ai",
  "figma-make",
  "figma-ai",
  "krea",
]);

/** Creative tools that belong under Video & Audio. */
const VIDEO_AUDIO_TOOLS = new Set([
  "runway",
  "elevenlabs",
  "suno",
  "sora",
  "veo",
  "kling",
  "heygen",
  "capcut",
  "descript",
  "opusclip",
  "veed",
  "synthesia",
  "premiere-pro",
]);

const PURPOSE_TO_DISCOVERY: Record<CategoryId, DiscoveryId> = {
  daily: "assistants",
  coding: "coding",
  creative: "image",
  automation: "automation",
  research: "research",
  local: "local",
};

const DISCOVERY_TO_PURPOSE: Record<DiscoveryId, CategoryId> = {
  assistants: "daily",
  "business-ai": "daily",
  coding: "coding",
  image: "creative",
  "video-audio": "creative",
  research: "research",
  automation: "automation",
  local: "local",
};

const NATIVE_PICKER_FILTERS = new Set<PickerFilterId>([
  "assistants",
  "coding",
  "image",
  "video-audio",
  "research",
  "automation",
  "local",
]);

function creativeDiscovery(toolId: string): DiscoveryId {
  if (VIDEO_AUDIO_TOOLS.has(toolId)) return "video-audio";
  if (IMAGE_DESIGN_TOOLS.has(toolId)) return "image";
  return "image";
}

/**
 * Canonical public-profile group.
 * business-ai catalog tools → AI-Powered Software; everything else → AI Apps.
 */
export function primaryExperienceGroup(tool: CatalogTool): ExperienceBrowseGroup {
  return tool.toolType === "business-ai" ? "work" : "tools";
}

export function toolInExperienceGroup(tool: CatalogTool, group: ExperienceBrowseGroup): boolean {
  return primaryExperienceGroup(tool) === group;
}

/** All discovery sections a tool can appear under when filtering. */
export function discoveryIdsForTool(tool: CatalogTool): DiscoveryId[] {
  const seen = new Set<DiscoveryId>();
  const out: DiscoveryId[] = [];

  for (const cat of tool.categories) {
    const id = cat === "creative" ? creativeDiscovery(tool.id) : PURPOSE_TO_DISCOVERY[cat];
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }

  if (tool.toolType === "business-ai" && !seen.has("business-ai")) {
    out.unshift("business-ai");
    seen.add("business-ai");
  }

  if (out.length === 0) out.push("assistants");
  return out;
}

/**
 * Canonical discovery bucket for grouping AI-native tools in All views.
 * Business-ai tools use {@link primaryPickerSection} instead.
 */
export function primaryDiscovery(tool: CatalogTool): DiscoveryId {
  if (tool.toolType === "business-ai") return "business-ai";
  const ids = discoveryIdsForTool(tool).filter((id) => id !== "business-ai");
  return ids[0] ?? "assistants";
}

export function toolInDiscovery(tool: CatalogTool, discoveryId: DiscoveryId): boolean {
  return discoveryIdsForTool(tool).includes(discoveryId);
}

export function toolInBusinessCategory(tool: CatalogTool, categoryId: BusinessCategoryId): boolean {
  return tool.businessCategories?.includes(categoryId) ?? false;
}

function businessPickerSection(tool: CatalogTool): PickerFilterId {
  const cats = tool.businessCategories ?? [];
  if (cats.includes("marketing") || cats.includes("sales-crm")) return "marketing-crm";
  if (cats.includes("commerce")) return "commerce";
  if (cats.includes("product-projects") || cats.includes("operations") || cats.includes("customer-support")) {
    return "productivity";
  }
  return "assistants";
}

/**
 * One canonical section for the unified All view — no duplicates across headings.
 */
export function primaryPickerSection(tool: CatalogTool): PickerFilterId {
  if (tool.toolType === "business-ai") return businessPickerSection(tool);
  const id = primaryDiscovery(tool);
  if (id === "business-ai") return businessPickerSection(tool);
  return id as PickerFilterId;
}

/** Whether a tool matches an active picker chip (All is handled by callers). */
export function toolMatchesPickerFilter(tool: CatalogTool, filter: PickerFilterId): boolean {
  if (filter === "marketing-crm") {
    return toolInBusinessCategory(tool, "marketing") || toolInBusinessCategory(tool, "sales-crm");
  }
  if (filter === "commerce") return toolInBusinessCategory(tool, "commerce");
  if (filter === "productivity") {
    return (
      toolInBusinessCategory(tool, "product-projects") ||
      toolInBusinessCategory(tool, "operations") ||
      toolInBusinessCategory(tool, "customer-support")
    );
  }
  if (NATIVE_PICKER_FILTERS.has(filter)) {
    return toolInDiscovery(tool, filter as DiscoveryId);
  }
  return false;
}

/** Sensible personal purpose from catalog metadata. */
export function defaultPurposeFor(tool: CatalogTool): CategoryId {
  return tool.categories[0] ?? "daily";
}

/** Map a discovery filter to a purpose hint for custom (non-catalog) tools only. */
export function purposeHintFromDiscovery(discoveryId: DiscoveryId): CategoryId {
  return DISCOVERY_TO_PURPOSE[discoveryId];
}

/**
 * Purpose assigned when adding a tool from the picker.
 * Native subcategory → that purpose; All / business filters / search → catalog default.
 * Never overwrites an already-selected purpose (callers only use this on add).
 */
export function purposeForBrowse(
  tool: CatalogTool,
  filter: PickerFilterId | "all",
  searching: boolean,
): CategoryId {
  if (searching || filter === "all") return defaultPurposeFor(tool);
  if (NATIVE_PICKER_FILTERS.has(filter) && toolInDiscovery(tool, filter as DiscoveryId)) {
    return purposeHintFromDiscovery(filter as DiscoveryId);
  }
  return defaultPurposeFor(tool);
}

export function discoverySection(id: DiscoveryId): DiscoverySection | undefined {
  return DISCOVERY_SECTIONS.find((s) => s.id === id);
}

export function pickerFilterSection(id: PickerFilterId): PickerFilterSection | undefined {
  return PICKER_FILTER_SECTIONS.find((s) => s.id === id);
}

export function businessCategorySection(id: BusinessCategoryId): BusinessCategorySection | undefined {
  return BUSINESS_CATEGORIES.find((s) => s.id === id);
}
