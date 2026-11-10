import type { Tool } from "./tools";

/**
 * Profile-facing AI experience sections.
 * Separate from discovery filters (Assistants, Business AI…) and personal purpose labels.
 */
export type ExperienceKind = "tools" | "work" | "workflows";

export type ExperienceAccent = {
  /** Icon + title accent. */
  ink: string;
  /** Soft square fill behind the icon. */
  tint: string;
  /** Hairline divider under the header. */
  line: string;
};

export type ExperienceSectionDef = {
  id: ExperienceKind;
  title: string;
  subtitle: string;
  accent: ExperienceAccent;
};

/** User-authored workflow showcase entry (future-ready; never inferred from tool picks). */
export type ExperienceWorkflow = {
  id: string;
  title: string;
  description?: string;
};

export const EXPERIENCE_SECTIONS: Record<ExperienceKind, ExperienceSectionDef> = {
  tools: {
    id: "tools",
    title: "AI Apps",
    subtitle: "Standalone AI products I use",
    accent: {
      ink: "#6B5CE0",
      tint: "rgba(107, 92, 224, 0.12)",
      line: "rgba(107, 92, 224, 0.18)",
    },
  },
  work: {
    id: "work",
    title: "AI-Powered Software",
    subtitle: "AI inside the platforms I work with",
    accent: {
      ink: "#3A6FE8",
      tint: "rgba(58, 111, 232, 0.11)",
      line: "rgba(58, 111, 232, 0.18)",
    },
  },
  workflows: {
    id: "workflows",
    title: "AI workflows I've built or enabled",
    subtitle: "How I connect AI to real work",
    accent: {
      ink: "#3F8F6B",
      tint: "rgba(63, 143, 107, 0.12)",
      line: "rgba(63, 143, 107, 0.18)",
    },
  },
};

/** Collection title above experience sections when both AI Apps and AI-Powered Software are present. */
export const STACK_COLLECTION_TITLE = "My AI Stack";

export type ExperiencePartition = {
  tools: Tool[];
  work: Tool[];
  workflows: ExperienceWorkflow[];
};

/**
 * Split stack tools by catalog toolType.
 * Automation platforms (n8n / Zapier / Make) stay in tools unless marked business-ai —
 * selecting them never implies a documented workflow.
 */
export function partitionExperience(
  tools: Tool[],
  workflows: ExperienceWorkflow[] = [],
): ExperiencePartition {
  return {
    tools: tools.filter((t) => !t.atWork),
    work: tools.filter((t) => Boolean(t.atWork)),
    workflows: workflows.filter((w) => w.title.trim().length > 0),
  };
}

export type VisibleExperienceSection =
  | { kind: "tools" | "work"; def: ExperienceSectionDef; tools: Tool[] }
  | { kind: "workflows"; def: ExperienceSectionDef; workflows: ExperienceWorkflow[] };

/** Only non-empty sections — empty public groups are never rendered. */
export function visibleExperienceSections(
  tools: Tool[],
  workflows: ExperienceWorkflow[] = [],
): VisibleExperienceSection[] {
  const parts = partitionExperience(tools, workflows);
  const out: VisibleExperienceSection[] = [];
  if (parts.tools.length > 0) {
    out.push({ kind: "tools", def: EXPERIENCE_SECTIONS.tools, tools: parts.tools });
  }
  if (parts.work.length > 0) {
    out.push({ kind: "work", def: EXPERIENCE_SECTIONS.work, tools: parts.work });
  }
  if (parts.workflows.length > 0) {
    out.push({ kind: "workflows", def: EXPERIENCE_SECTIONS.workflows, workflows: parts.workflows });
  }
  return out;
}
