"use client";

import { Pencil } from "lucide-react";
import type { RefObject } from "react";
import { useSyncExternalStore } from "react";
import { Mark } from "@/components/stackflex/Brand";
import { StackCard } from "@/components/stackflex/StackCard";
import {
  ActivitiesSection,
  type DisplayActivity,
} from "@/components/share/ActivitiesSection";
import { ExperienceSection, ExperienceWorkflowList } from "@/components/share/ExperienceSection";
import { StackProfileIdentity } from "@/components/share/StackProfileIdentity";
import {
  STACK_COLLECTION_TITLE,
  visibleExperienceSections,
  type ExperienceWorkflow,
} from "@/lib/stackflex/experience";
import type { Tool } from "@/lib/stackflex/tools";

/**
 * Results v3 page preview: identity → My AI Stack → How I use AI → Made with StackFlex.
 * Activity editing CTAs live inside this canvas; public snapshots never receive them.
 */
export function PageCanvas({
  tools,
  name,
  title,
  avatarSrc,
  activities = [],
  workflows = [],
  onEditProfile,
  editProfileRef,
  onEditActivities,
  activitiesButtonRef,
}: {
  tools: Tool[];
  name?: string;
  title?: string;
  avatarSrc?: string | null;
  activities?: DisplayActivity[];
  workflows?: ExperienceWorkflow[];
  onEditProfile?: () => void;
  editProfileRef?: RefObject<HTMLButtonElement | null>;
  onEditActivities?: () => void;
  activitiesButtonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const n = tools.length;
  const editableActivities = Boolean(onEditActivities);

  return (
    <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_#ECEAE4,0_30px_60px_-42px_rgba(11,11,12,.28)]">
      <div className="relative flex h-[34px] items-center border-b border-[#EEECE6] bg-[#F7F5F0] px-3.5">
        <span className="absolute left-3.5 flex items-center gap-1.5">
          <span className="size-[7px] rounded-full bg-[#E6E3DC]" />
          <span className="size-[7px] rounded-full bg-[#E6E3DC]" />
          <span className="size-[7px] rounded-full bg-[#E6E3DC]" />
        </span>
        <span className="mx-auto text-[11.5px] font-medium text-[#A8A59C]">stackflex.app</span>
      </div>

      <div className="relative overflow-hidden px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8">
        {onEditProfile && (
          <button
            ref={editProfileRef}
            type="button"
            onClick={onEditProfile}
            aria-label="Edit profile"
            className="absolute top-2.5 right-2.5 z-[1] inline-flex h-[30px] items-center gap-1.5 rounded-full bg-white px-3 text-[12.5px] font-semibold text-[#2A2925] shadow-[0_0_0_1px_#E6E3DC] outline-none transition-[box-shadow,color] hover:text-[#0B0B0C] hover:shadow-[0_0_0_1px_#CFCBC1] focus-visible:ring-2 focus-visible:ring-[#3A2EFF] focus-visible:ring-offset-2 lg:top-3 lg:right-3.5"
          >
            <Pencil size={13} strokeWidth={2.25} aria-hidden="true" />
            Edit profile
          </button>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.07), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-10 size-64 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,170,130,.09), transparent)" }}
        />

        <div className="relative flex flex-col">
          <StackProfileIdentity name={name} title={title} avatarSrc={avatarSrc} size="compact" />

          {n > 0 || workflows.length > 0 ? (
            <PageExperienceGrid tools={tools} workflows={workflows} className="mt-6 w-full sm:mt-7" />
          ) : (
            <p className="mt-6 text-left text-[14px] text-sf-muted">Add tools to preview your page.</p>
          )}

          {(n > 0 || editableActivities) && (
            <ActivitiesSection
              activities={activities}
              tools={tools}
              density="compact"
              previewLimit={4}
              editable={editableActivities}
              onAdd={onEditActivities}
              onEdit={onEditActivities}
              addButtonRef={activitiesButtonRef}
              className="mt-6 sm:mt-7"
            />
          )}

          <p className="mt-7 flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-sf-subtle">
            <Mark size={14} outline="#FFFFFF" />
            Made with StackFlex
          </p>
        </div>
      </div>
    </div>
  );
}

function pageColumns(n: number, mobile: boolean): number {
  if (mobile) return Math.min(3, Math.max(1, n));
  if (n <= 5) return Math.max(1, n);
  if (n === 6) return 3;
  return 5;
}

function subscribeMq(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useMedia(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => (typeof window === "undefined" ? () => {} : subscribeMq(query, onStoreChange)),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function PageExperienceGrid({
  tools,
  workflows,
  className = "",
}: {
  tools: Tool[];
  workflows: ExperienceWorkflow[];
  className?: string;
}) {
  const mobile = !useMedia("(min-width: 1024px)");
  const wide = useMedia("(min-width: 1400px)");
  const card = mobile || !wide ? 92 : 100;
  const gap = 8;
  const sections = visibleExperienceSections(tools, workflows);
  const mainId = tools[0]?.id;

  if (sections.length === 0) return null;

  if (sections.length === 1 && sections[0]!.kind !== "workflows") {
    const only = sections[0]!;
    return (
      <div className={className}>
        <ExperienceSection kind={only.kind} size="compact" def={only.def}>
          <PageToolGrid tools={only.tools} card={card} gap={gap} mobile={mobile} mainId={mainId} />
        </ExperienceSection>
      </div>
    );
  }

  const toolSectionCount = sections.filter((s) => s.kind !== "workflows").length;
  const showCollectionTitle = toolSectionCount > 1;

  return (
    <div className={`w-full ${className}`}>
      {showCollectionTitle && (
        <h2 className="mb-4 font-display text-[16px] font-semibold tracking-[-0.04em] text-sf-ink">
          {STACK_COLLECTION_TITLE}
        </h2>
      )}
      <div className="flex w-full flex-col gap-5">
        {sections.map((section) => {
          if (section.kind === "workflows") {
            return (
              <ExperienceSection key={section.kind} kind={section.kind} size="compact" def={section.def}>
                <ExperienceWorkflowList workflows={section.workflows} size="compact" />
              </ExperienceSection>
            );
          }
          return (
            <ExperienceSection key={section.kind} kind={section.kind} size="compact" def={section.def}>
              <PageToolGrid tools={section.tools} card={card} gap={gap} mobile={mobile} mainId={mainId} />
            </ExperienceSection>
          );
        })}
      </div>
    </div>
  );
}

function PageToolGrid({
  tools,
  card,
  gap,
  mobile,
  mainId,
}: {
  tools: Tool[];
  card: number;
  gap: number;
  mobile: boolean;
  mainId?: string;
}) {
  const cols = pageColumns(tools.length, mobile);
  return (
    <div
      className="grid justify-items-start"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${card}px)`,
        gap,
        justifyContent: "start",
      }}
    >
      {tools.map((tool) => (
        <StackCard key={tool.id} tool={tool} main={tool.id === mainId} className="w-full" />
      ))}
    </div>
  );
}
