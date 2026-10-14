"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { HomeLink } from "@/components/app/HomeLink";
import { Wordmark } from "@/components/stackflex/Brand";
import {
  focusRing,
  MoreToolsOption,
  PrimaryButton,
  StepIndicator,
  TextButton,
  ToolOption,
} from "@/components/stackflex/Controls";
import { StackBoard } from "@/components/stackflex/StackBoard";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { MoreTools } from "@/components/selector/CategoryCard";
import { InlineModelPicker } from "@/components/selector/InlineModelPicker";
import { catalog } from "@/lib/catalog/adapter";
import type { CatalogTool, Category } from "@/lib/catalog/types";
import { setGuideStep, useGuide } from "@/lib/guide";
import { itemLabel, itemModelLabel, itemsInCategory, modelPickerMode } from "@/lib/selection/derive";
import { removeItem, toggleTool } from "@/lib/selection/store";
import { MAX_BADGES, type SelectedItem, type StackState } from "@/lib/selection/types";
import { stackTools, toolFromCatalog, toolFromItem } from "@/lib/stackflex/tools";
import { navigate } from "@/lib/view";
import { GUIDE_STEPS, stepIndexForCategory, type GuideStep } from "./steps";

const PAD = "px-5 md:px-10 xl:px-[120px]";

/** Default flow: one category question per screen, with the stack assembling in the tray below. */
export function GuidedBuilder({ stack }: { stack: StackState }) {
  const guide = useGuide();
  const index = Math.min(guide.step, GUIDE_STEPS.length - 1);
  const step = GUIDE_STEPS[index];
  const category = catalog.category(step.categoryId);
  const last = index === GUIDE_STEPS.length - 1;
  const [askedForTool, setAskedForTool] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const needsTool = askedForTool && stack.items.length === 0;
  const total = GUIDE_STEPS.length;

  useEffect(() => {
    if (moved.current) headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  function goTo(next: number) {
    moved.current = true;
    setAskedForTool(false);
    setMoreOpen(false);
    setGuideStep(next);
    window.scrollTo({ top: 0 });
  }

  function advance() {
    if (!last) return goTo(index + 1);
    if (stack.items.length === 0) return setAskedForTool(true);
    navigate("results");
  }

  function openItem(itemId: string) {
    const item = stack.items.find((i) => i.id === itemId);
    const target = item ? stepIndexForCategory(item.categoryId) : -1;
    if (target >= 0 && target !== index) goTo(target);
  }

  if (!category) return null;

  const actions = (
    <div className="flex flex-col items-end gap-2 self-end lg:self-auto">
      <div className="flex items-center gap-7">
        <TextButton onClick={() => (index > 0 ? goTo(index - 1) : navigate("home"))}>Back</TextButton>
        <TextButton onClick={advance}>Skip</TextButton>
        <PrimaryButton onClick={advance}>{last ? "Generate my stack" : "Next"}</PrimaryButton>
      </div>
      <p role="status" className="text-[15px] font-medium">
        {needsTool && "Pick at least one tool first, then we’ll make your assets."}
      </p>
    </div>
  );

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-white text-sf-ink">
      <header className={`flex h-[88px] flex-none items-center justify-between gap-6 ${PAD}`}>
        <HomeLink className="rounded-md text-sf-ink">
          <Wordmark />
        </HomeLink>
        <div className="hidden md:block">
          <StepIndicator step={index + 1} total={total} />
        </div>
        <div className="flex items-center gap-6">
          <TextButton onClick={() => navigate("edit")} className="hidden text-[15px] sm:inline">
            Edit full stack
          </TextButton>
          <TextButton onClick={() => navigate("home")} className="text-[15px]">
            Exit
          </TextButton>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section
          key={step.categoryId}
          aria-labelledby="guide-question"
          className={`flex flex-1 animate-step-in flex-col pb-10 pt-9 ${PAD}`}
        >
          <div className="mb-6 md:hidden">
            <StepIndicator step={index + 1} total={total} />
          </div>
          <StepQuestion
            step={step}
            category={category}
            stack={stack}
            headingRef={headingRef}
            moreOpen={moreOpen}
            onMoreOpenChange={setMoreOpen}
            actions={actions}
          />
        </section>

        <section
          aria-labelledby="guide-tray"
          className={`flex flex-none flex-col gap-6 border-t border-[#EEECE6] bg-white py-8 lg:h-[240px] lg:flex-row lg:items-center lg:gap-14 lg:py-0 ${PAD}`}
        >
          <div className="flex flex-col gap-1.5 lg:w-[200px] lg:flex-none">
            <h2 id="guide-tray" className="font-display text-[26px] font-medium tracking-[-0.035em]">
              Your stack
            </h2>
            <span className="text-[15px] text-sf-muted" aria-live="polite">
              {stack.items.length} of {MAX_BADGES} picked
            </span>
          </div>
          <StackBoard
            tools={stackTools(stack)}
            layout="tray"
            highlightLast
            onAdd={() => setMoreOpen(true)}
            onOpen={(t) => openItem(t.id)}
            onRemove={(t) => removeItem(t.id)}
            className="w-full max-w-[480px]"
          />
          <p className="max-w-[260px] flex-1 text-sm leading-normal text-sf-subtle">
            Your first pick is the main card. You can change it later in Edit stack.
          </p>
        </section>
      </main>
    </div>
  );
}

interface StepQuestionProps {
  step: GuideStep;
  category: Category;
  stack: StackState;
  headingRef: RefObject<HTMLHeadingElement | null>;
  moreOpen: boolean;
  onMoreOpenChange: (open: boolean) => void;
  actions: ReactNode;
}

function StepQuestion({ step, category, stack, headingRef, moreOpen, onMoreOpenChange, actions }: StepQuestionProps) {
  const [focusId, setFocusId] = useState<string>();
  const moreId = useId();
  const full = stack.items.length >= MAX_BADGES;
  const selectedIds = new Set(stack.items.map((i) => i.id));
  const owned = itemsInCategory(stack, category.id);
  const quickPicks = category.quickPicks
    .map((toolId) => catalog.tool(toolId))
    .filter((t): t is CatalogTool => Boolean(t));
  const extras = owned.filter((i) => !category.quickPicks.includes(i.id));
  const modelItems = owned.filter((i) => modelPickerMode(i) !== "none");

  function toggle(tool: CatalogTool, source: "quick_pick" | "more") {
    if (toggleTool(tool.id, category.id, source) === "added") setFocusId(tool.id);
  }

  return (
    <>
      <span className="text-[17px] font-medium text-sf-blue">{category.cardLabel}</span>
      <h1
        id="guide-question"
        ref={headingRef}
        tabIndex={-1}
        className="mt-2.5 font-display text-[44px] font-medium leading-none tracking-[-0.05em] outline-none md:text-[64px] lg:text-[80px]"
      >
        {step.title}
      </h1>

      <div
        role="group"
        aria-label={`${category.name} tools`}
        className="mt-12 grid grid-cols-3 justify-items-center gap-y-8 sm:grid-cols-5 lg:grid-cols-[repeat(auto-fill,120px)] lg:justify-between lg:gap-x-3.5"
      >
        {quickPicks.map((tool) => (
          <ToolOption
            key={tool.id}
            tool={toolFromCatalog(tool, category.id)}
            selected={selectedIds.has(tool.id)}
            unavailable={full && !selectedIds.has(tool.id)}
            onClick={() => toggle(tool, "quick_pick")}
          />
        ))}
        {extras.map((item) => (
          <ToolOption key={item.id} tool={toolFromItem(item)} selected onClick={() => removeItem(item.id)} />
        ))}
        <MoreToolsOption expanded={moreOpen} controls={moreId} onClick={() => onMoreOpenChange(!moreOpen)} />
      </div>

      {moreOpen && (
        <MorePanel
          id={moreId}
          onClose={() => onMoreOpenChange(false)}
          category={category}
          owned={owned}
          selectedIds={selectedIds}
          full={full}
          onToggle={(tool) => toggle(tool, "more")}
        />
      )}

      <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <StepModels items={modelItems} focusId={focusId} onFocus={setFocusId} primaryId={stack.primaryId} />
        </div>
        {actions}
      </div>
    </>
  );
}

interface MorePanelProps {
  id: string;
  onClose: () => void;
  category: Category;
  owned: SelectedItem[];
  selectedIds: Set<string>;
  full: boolean;
  onToggle: (tool: CatalogTool) => void;
}

/** The rest of the category, contextual search and custom entry, opened from the "More tools" coin. */
function MorePanel({ id, onClose, ...props }: MorePanelProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    regionRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, []);

  return (
    <div
      id={id}
      ref={regionRef}
      role="region"
      aria-label={`More ${props.category.name} tools`}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        onClose();
      }}
      className="mt-10 max-h-[260px] overflow-y-auto rounded-3xl bg-sf-paper p-5"
    >
      <MoreTools {...props} />
    </div>
  );
}

/** "Claude Code with" leads the pill row; single-version tools and custom tools read differently. */
function modelLead(item: SelectedItem): string {
  const label = itemLabel(item);
  const models = item.toolId ? catalog.modelsForTool(item.toolId) : [];
  if (models.length === 0) return `${label} model`;
  if (models.length === 1 && models[0].name.toLowerCase() === label.toLowerCase()) return `${label} version`;
  return `${label} with`;
}

interface StepModelsProps {
  items: SelectedItem[];
  focusId: string | undefined;
  onFocus: (id: string) => void;
  primaryId: string | null;
}

/** Optional model → version choice. It follows the most recently picked tool; chips switch between tools. */
function StepModels({ items, focusId, onFocus, primaryId }: StepModelsProps) {
  const [revealed, setRevealed] = useState<string[]>([]);

  if (items.length === 0) return null;

  const focused = items.find((i) => i.id === focusId) ?? items[items.length - 1];
  const label = itemLabel(focused);
  // Custom tools have no catalog models; their free-text field waits for a click so it can't steal focus.
  const collapsed = !focused.toolId && focused.customModel === undefined && !revealed.includes(focused.id);

  return (
    <div>
      {items.length > 1 && (
        <div role="group" aria-label="Choose which tool to set a model for" className="mb-3 flex flex-wrap gap-2.5 p-0.5">
          {items.map((i) => {
            const pressed = i.id === focused.id;
            const model = itemModelLabel(i);
            return (
              <button
                key={i.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => onFocus(i.id)}
                className={[
                  "inline-flex h-10 max-w-full items-center gap-2 rounded-full bg-white pl-1 pr-4 text-[15px] transition-shadow",
                  pressed
                    ? "font-semibold text-sf-ink shadow-[0_0_0_2px_#3A2EFF]"
                    : "font-medium text-sf-muted shadow-[0_0_0_1px_#ECEAE4] hover:text-sf-ink",
                  focusRing,
                ].join(" ")}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#ECEAE4]">
                  <ToolLogo tool={toolFromItem(i)} size="16px" monogramSize="14px" />
                </span>
                <span className="truncate">{itemLabel(i)}</span>
                {model && <span className="truncate font-normal text-sf-muted">· {model}</span>}
              </button>
            );
          })}
        </div>
      )}
      {collapsed ? (
        <button
          type="button"
          onClick={() => setRevealed((r) => [...r, focused.id])}
          className={`inline-flex h-11 items-center rounded-full border-[1.5px] border-dashed border-[#CFCBC1] px-5 text-base font-medium text-sf-muted hover:text-sf-ink ${focusRing}`}
        >
          + Add a {label} model (optional)
        </button>
      ) : (
        <InlineModelPicker key={focused.id} item={focused} isPrimary={primaryId === focused.id} large heading={modelLead(focused)} />
      )}
    </div>
  );
}
