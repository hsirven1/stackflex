import { StackCard } from "@/components/stackflex/StackCard";
import {
  ExperienceSection,
  ExperienceWorkflowList,
} from "@/components/share/ExperienceSection";
import {
  STACK_COLLECTION_TITLE,
  visibleExperienceSections,
  type ExperienceWorkflow,
} from "@/lib/stackflex/experience";
import type { Tool } from "@/lib/stackflex/tools";

export type StackCardDensity = "full" | "compact" | "mini";

/**
 * Cap card width by surface — never stretch tiles to fill the grid.
 * Cards scale via cqw from width; keep max widths so identity stays primary.
 */
export function stackProfileCardClass(_n: number, density: StackCardDensity = "full"): string {
  const base = "shrink-0 min-w-0";
  // Landing personal-page mock: extra-compact badges.
  if (density === "mini") return `${base} w-full max-w-[88px]`;
  // Results / inline previews.
  if (density === "compact") return `${base} w-[min(100%,120px)]`;
  // Public `/s/[snapshot]`: compact collectibles — capped width, never stretch to fill.
  return `${base} w-[min(46%,132px)] sm:w-[min(30%,140px)] lg:w-[min(22%,148px)]`;
}

function gapFor(density: StackCardDensity): string {
  if (density === "mini") return "gap-2";
  if (density === "compact") return "gap-2";
  return "gap-3 sm:gap-3.5";
}

function headerSizeFor(density: StackCardDensity): "full" | "compact" | "mini" {
  if (density === "mini") return "mini";
  if (density === "compact") return "compact";
  return "full";
}

/** @deprecated Prefer visibleExperienceSections — kept for call sites that only need a mixed check. */
export function groupStackTools(tools: Tool[]): { native: Tool[]; atWork: Tool[] } | null {
  const native = tools.filter((t) => !t.atWork);
  const atWork = tools.filter((t) => t.atWork);
  if (native.length === 0 || atWork.length === 0) return null;
  return { native, atWork };
}

/**
 * Personal-page / preview tool grid.
 * When `groupByExperience`, renders prominent AI experience sections (empty ones omitted).
 */
export function StackProfileCards({
  tools,
  density = "full",
  className = "",
  groupByExperience = false,
  /** @deprecated Use groupByExperience */
  groupWhenMixed = false,
  mainId,
  workflows = [],
}: {
  tools: Tool[];
  density?: StackCardDensity;
  className?: string;
  /** Organize into AI tools / work tools / workflows (public page + Results preview). */
  groupByExperience?: boolean;
  /** @deprecated Alias of groupByExperience for older call sites. */
  groupWhenMixed?: boolean;
  /** Preserve Main holographic treatment across grouped sections. */
  mainId?: string;
  /** User-authored workflows only — never inferred from automation tools. */
  workflows?: ExperienceWorkflow[];
}) {
  const n = tools.length;
  if (n === 0 && workflows.length === 0) return null;
  const group = groupByExperience || groupWhenMixed;
  const isMain = (id: string, index: number) => (mainId ? id === mainId : index === 0);

  // Landing mock: forced 2-column grid so wider frames don't wrap to 3 columns.
  if (density === "mini" && !group) {
    const widthClass = stackProfileCardClass(n, density);
    return (
      <div className={`mx-auto grid w-full max-w-[188px] grid-cols-2 justify-items-center gap-1.5 ${className}`}>
        {tools.map((tool, i) => (
          <StackCard key={tool.id} tool={tool} main={isMain(tool.id, i)} className={widthClass} />
        ))}
      </div>
    );
  }

  if (group) {
    const sections = visibleExperienceSections(tools, workflows);
    if (sections.length === 0) return null;
    const size = headerSizeFor(density);
    const sectionGap =
      density === "full" ? "gap-10 sm:gap-12" : density === "mini" ? "gap-3.5" : "gap-5";
    const toolSectionCount = sections.filter((s) => s.kind !== "workflows").length;
    // Only show “My AI Stack” when both AI Apps and AI-Powered Software are present.
    const showCollectionTitle = toolSectionCount > 1 && density !== "mini";

    return (
      <div className={`w-full ${className}`}>
        {showCollectionTitle && (
          <h2
            className={`font-display font-semibold tracking-[-0.04em] text-sf-ink ${
              density === "full"
                ? "mb-6 text-[22px] sm:mb-7 sm:text-[24px]"
                : "mb-4 text-[16px]"
            }`}
          >
            {STACK_COLLECTION_TITLE}
          </h2>
        )}
        <div className={`flex w-full flex-col ${sectionGap}`}>
          {sections.map((section) => {
            if (section.kind === "workflows") {
              return (
                <ExperienceSection key={section.kind} kind={section.kind} size={size} def={section.def}>
                  <ExperienceWorkflowList workflows={section.workflows} size={size} />
                </ExperienceSection>
              );
            }
            return (
              <ExperienceSection key={section.kind} kind={section.kind} size={size} def={section.def}>
                <ToolCardRow
                  tools={section.tools}
                  density={density}
                  isMain={isMain}
                />
              </ExperienceSection>
            );
          })}
        </div>
      </div>
    );
  }

  const widthClass = stackProfileCardClass(n, density);
  // Ungrouped preview (e.g. landing mini mock): keep centered. Public/results use experience sections.
  return (
    <div className={`flex flex-wrap justify-center ${gapFor(density)} ${className}`}>
      {tools.map((tool, i) => (
        <StackCard key={tool.id} tool={tool} main={isMain(tool.id, i)} className={widthClass} />
      ))}
    </div>
  );
}

function ToolCardRow({
  tools,
  density,
  isMain,
}: {
  tools: Tool[];
  density: StackCardDensity;
  isMain: (id: string, index: number) => boolean;
}) {
  const widthClass = stackProfileCardClass(tools.length, density);
  if (density === "mini") {
    return (
      <div className="grid w-full max-w-[188px] grid-cols-2 justify-items-start gap-1.5">
        {tools.map((tool, i) => (
          <StackCard key={tool.id} tool={tool} main={isMain(tool.id, i)} className={widthClass} />
        ))}
      </div>
    );
  }
  return (
    <div className={`flex flex-wrap justify-start ${gapFor(density)}`}>
      {tools.map((tool, i) => (
        <StackCard key={tool.id} tool={tool} main={isMain(tool.id, i)} className={widthClass} />
      ))}
    </div>
  );
}
