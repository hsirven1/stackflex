import { catalog } from "@/lib/catalog/adapter";
import { primaryDiscovery } from "@/lib/catalog/discovery";
import type { CategoryId } from "@/lib/catalog/types";
import type { ProfessionalRole } from "@/lib/profile/roles";
import { PROFESSIONAL_ROLES } from "@/lib/profile/roles";

/** Tool-selection step in the V1 working-style questionnaire. */
export type GuideToolStep = {
  kind: "tools";
  id: string;
  eyebrow: string;
  question: string;
  /** Featured tool IDs shown as logo options (~6–8). */
  featuredIds: string[];
  /** Purpose assigned when adding a tool from this step (custom tools / legacy). */
  purposeHint: CategoryId;
};

export type GuideRoleStep = {
  kind: "role";
  id: "role";
  eyebrow: string;
  question: string;
};

export type GuideStepConfig = GuideToolStep | GuideRoleStep;

/**
 * Seven-step onboarding. Role is always last, immediately before generating the profile.
 * Assistants (required) → building → work apps → automation → design & creative → other → role.
 */
export const GUIDE_FLOW: GuideStepConfig[] = [
  {
    kind: "tools",
    id: "assistants",
    eyebrow: "AI Assistants",
    question: "Which AI assistants do you use?",
    featuredIds: [
      "chatgpt",
      "claude",
      "gemini",
      "perplexity",
      "copilot",
      "le-chat",
      "grok",
      "deepseek-chat",
    ],
    purposeHint: "daily",
  },
  {
    kind: "tools",
    id: "build",
    eyebrow: "Building",
    question: "Any AI tools you use to build?",
    featuredIds: [
      "cursor",
      "claude-code",
      "codex",
      "github-copilot",
      "lovable",
      "v0",
      "bolt",
      "replit",
    ],
    purposeHint: "coding",
  },
  {
    kind: "tools",
    id: "work",
    eyebrow: "Work Apps",
    question: "Any AI tools in your work apps?",
    featuredIds: [
      "notion-ai",
      "hubspot-breeze",
      "salesforce-agentforce",
      "atlassian-rovo",
      "m365-copilot",
      "gemini-workspace",
      "slack-ai",
      "intercom-fin",
    ],
    purposeHint: "daily",
  },
  {
    kind: "tools",
    id: "automation",
    eyebrow: "Automation",
    question: "Any AI tools for automation?",
    featuredIds: ["n8n", "zapier", "make", "openclaw", "hermes-agent", "openai-agents"],
    purposeHint: "automation",
  },
  {
    kind: "tools",
    id: "creative",
    eyebrow: "Design and Creative",
    question: "Any AI tools for design or creative work?",
    featuredIds: [
      "figma-ai",
      "claude-design",
      "canva-ai",
      "firefly",
      "midjourney",
      "runway",
      "capcut",
      "descript",
    ],
    purposeHint: "creative",
  },
  {
    kind: "tools",
    id: "other",
    eyebrow: "Other AI Tools",
    question: "Any other AI tools you use?",
    featuredIds: [
      "notebooklm",
      "granola",
      "otter",
      "elicit",
      "fireflies",
      "fathom",
      "gamma",
      "elevenlabs",
    ],
    /** Fallback for custom tools only — catalog picks use defaultPurposeFor. */
    purposeHint: "research",
  },
  {
    kind: "role",
    id: "role",
    eyebrow: "Your role",
    question: "What's your role?",
  },
];

export const GUIDE_STEP_COUNT = GUIDE_FLOW.length;

export const ROLE_OPTIONS = PROFESSIONAL_ROLES;

export type { ProfessionalRole };

/** Assistants step config (always GUIDE_FLOW[0]). */
export function assistantsStep(): GuideToolStep {
  const step = GUIDE_FLOW[0];
  if (!step || step.kind !== "tools" || step.id !== "assistants") {
    throw new Error("GUIDE_FLOW[0] must be the assistants step");
  }
  return step;
}

/** Whether a stack item counts as an AI assistant for the Step 1 gate. */
export function selectionIsAssistant(item: { id: string; toolId?: string }): boolean {
  const id = item.toolId ?? item.id;
  if (id.startsWith("custom:")) return true;
  if (assistantsStep().featuredIds.includes(id)) return true;
  const tool = catalog.tool(id);
  return tool ? primaryDiscovery(tool) === "assistants" : false;
}

/** True when the stack includes at least one AI assistant selection. */
export function stackHasAssistant(items: readonly { id: string; toolId?: string }[]): boolean {
  return items.some(selectionIsAssistant);
}

/** Clamp a persisted guide.step into the current flow. */
export function clampGuideStep(step: number): number {
  if (!Number.isInteger(step) || step < 0) return 0;
  return Math.min(step, GUIDE_STEP_COUNT - 1);
}

/** @deprecated Legacy purpose-order list; kept for import safety. */
export const PICKER_CATEGORY_ORDER: CategoryId[] = [
  "daily",
  "coding",
  "creative",
  "automation",
  "local",
  "research",
];

/** @deprecated Multi-step guide replaced then restored; kept for clamp safety. */
export interface GuideStep {
  categoryId: CategoryId;
  title: string;
}

/** @deprecated */
export const GUIDE_STEPS: GuideStep[] = PICKER_CATEGORY_ORDER.map((categoryId) => ({
  categoryId,
  title: "",
}));

export function stepIndexForCategory(categoryId: CategoryId | null): number {
  return PICKER_CATEGORY_ORDER.findIndex((id) => id === categoryId);
}
