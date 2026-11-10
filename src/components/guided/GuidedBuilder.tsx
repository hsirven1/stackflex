"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ComponentProps, type FormEvent } from "react";
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
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { catalog, normalize } from "@/lib/catalog/adapter";
import { defaultPurposeFor } from "@/lib/catalog/discovery";
import type { CatalogTool, CategoryId } from "@/lib/catalog/types";
import { finishGuide, resumeGuide, setGuideStep, useGuide } from "@/lib/guide";
import { track } from "@/lib/integrations/analytics";
import { markResultsReveal } from "@/lib/motion";
import { roleLabel, type ProfessionalRole } from "@/lib/profile/roles";
import { setProfile, useProfile } from "@/lib/profile/store";
import { addCustomTool, removeItem, toggleTool } from "@/lib/selection/store";
import { MAX_BADGES, type StackState } from "@/lib/selection/types";
import { stackTools, toolFromCatalog, type Tool } from "@/lib/stackflex/tools";
import { navigate } from "@/lib/view";
import { GenerateSequence } from "./GenerateSequence";
import {
  clampGuideStep,
  GUIDE_FLOW,
  GUIDE_STEP_COUNT,
  ROLE_OPTIONS,
  stackHasAssistant,
  type GuideToolStep,
} from "./steps";

/**
 * Stepped AI profile onboarding.
 * Multi-select tools across categories, role last, then generate profile.
 * Models stay out of this flow; they remain editable from the profile.
 */
export function GuidedBuilder({ stack }: { stack: StackState }) {
  const guide = useGuide();
  const profile = useProfile();
  const stepIndex = clampGuideStep(guide.step);
  const step = GUIDE_FLOW[stepIndex]!;
  const [generating, setGenerating] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [query, setQuery] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchPanelId = useId();

  const tools = stackTools(stack);
  const count = stack.items.length;
  const selectedIds = useMemo(() => new Set(stack.items.map((i) => i.id)), [stack.items]);
  const full = count >= MAX_BADGES;
  const hasAssistant = useMemo(() => stackHasAssistant(stack.items), [stack.items]);
  const isFirst = stepIndex === 0;
  const isRole = step.kind === "role";

  useEffect(() => {
    resumeGuide();
  }, []);

  // Step 1 is mandatory: never stay past assistants without at least one selected.
  useEffect(() => {
    if (!hasAssistant && stepIndex > 0) {
      setGuideStep(0);
    }
  }, [hasAssistant, stepIndex]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

  function resetStepUi() {
    setSearchOpen(false);
    setCustomOpen(false);
    setQuery("");
    setCustomName("");
  }

  const featuredTools = useMemo(() => {
    if (step.kind !== "tools") return [] as Tool[];
    const purpose = step.purposeHint;
    return step.featuredIds
      .map((id) => catalog.tool(id))
      .filter((t): t is CatalogTool => Boolean(t))
      .map((t) => toolFromCatalog(t, purpose));
  }, [step]);

  const allCatalogTools = useMemo(() => {
    const seen = new Set<string>();
    const list: CatalogTool[] = [];
    for (const cat of catalog.categories()) {
      for (const t of catalog.toolsInCategory(cat.id)) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        list.push(t);
      }
    }
    return list;
  }, []);

  const q = normalize(query);
  const searchResults = useMemo(() => {
    if (!q) return [] as CatalogTool[];
    return allCatalogTools
      .filter((t) => toolMatchesQuery(t, q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 40);
  }, [allCatalogTools, q]);

  function purposeForAdd(tool: CatalogTool): CategoryId {
    if (step.kind === "tools") {
      // Catch-all step: keep each tool's own catalog purpose for classification/display.
      if (step.id === "other") return defaultPurposeFor(tool);
      return step.purposeHint;
    }
    return defaultPurposeFor(tool);
  }

  function toggleCatalogTool(tool: CatalogTool) {
    if (selectedIds.has(tool.id)) {
      removeItem(tool.id);
      return;
    }
    if (full) return;
    toggleTool(tool.id, purposeForAdd(tool), "quick_pick");
  }

  function completeOnboarding() {
    if (!hasAssistant) return;
    track({ name: "onboarding_completed", props: {} });
    finishGuide();
    setGenerating(true);
  }

  function advance() {
    if (isFirst && !hasAssistant) return;
    if (stepIndex >= GUIDE_STEP_COUNT - 1) {
      completeOnboarding();
      return;
    }
    resetStepUi();
    setGuideStep(stepIndex + 1);
  }

  function goNext() {
    advance();
  }

  function goBack() {
    if (stepIndex <= 0) {
      navigate("home");
      return;
    }
    resetStepUi();
    setGuideStep(stepIndex - 1);
  }

  /** Skip advances without changing selections. Role skip leaves role unspecified. */
  function skipStep() {
    if (isFirst) return;
    if (isRole) {
      setProfile({ professionalRole: undefined });
      completeOnboarding();
      return;
    }
    advance();
  }

  function selectRole(role: ProfessionalRole) {
    setProfile({
      professionalRole: role,
      professionalTitle: profile.professionalTitle.trim() || roleLabel(role),
    });
  }

  function submitCustom(e: FormEvent) {
    e.preventDefault();
    const name = customName.trim();
    if (!name || full) return;
    const purpose: CategoryId =
      step.kind === "tools" ? (step as GuideToolStep).purposeHint : "daily";
    addCustomTool(name, purpose);
    setCustomName("");
    setCustomOpen(false);
    setSearchOpen(false);
  }

  /** Step 1 and finish require an assistant; steps 2–6 are always optional. */
  const primaryLabel = isRole ? "Create my profile" : "Next";
  const primaryDisabled = !hasAssistant && (isFirst || isRole);

  return (
    <div data-page className="fixed inset-0 z-0 flex flex-col overflow-hidden bg-white text-sf-ink">
      <div inert={generating} className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-[56px] flex-none items-center justify-between gap-4 px-5 md:h-[64px] md:px-8 lg:px-10">
          <HomeLink className="rounded-md text-sf-ink">
            <Wordmark />
          </HomeLink>
          <TextButton onClick={() => navigate("home")} className="text-[15px]">
            Exit
          </TextButton>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="mx-auto my-auto flex w-full max-w-[720px] flex-col px-5 py-5 md:px-8 md:py-6">
            <StepIndicator step={stepIndex + 1} total={GUIDE_STEP_COUNT} />

            <span className="mt-4 text-[14px] font-medium text-sf-blue md:text-[15px]">
              {step.eyebrow}
            </span>
            <h1
              id="guide-question"
              ref={headingRef}
              tabIndex={-1}
              className="mt-1.5 font-display text-[32px] font-medium leading-[0.98] tracking-[-0.045em] outline-none md:text-[40px] lg:text-[44px]"
            >
              {step.question}
            </h1>

            {isRole ? (
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {ROLE_OPTIONS.map((role) => {
                  const on = profile.professionalRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => selectRole(role.id)}
                      className={`rounded-2xl px-4 py-4 text-left text-[15px] font-semibold transition-colors ${focusRing} ${
                        on
                          ? "bg-[#F3F1FF] text-sf-blue shadow-[inset_0_0_0_2px_#3A2EFF]"
                          : "bg-[#FAF9F6] text-sf-ink shadow-[inset_0_0_0_1px_#E6E3DC] hover:shadow-[inset_0_0_0_1px_#CFCBC1]"
                      }`}
                    >
                      {role.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5">
                  {featuredTools.map((tool) => (
                    <ToolOption
                      key={tool.id}
                      tool={tool}
                      selected={selectedIds.has(tool.id)}
                      unavailable={full && !selectedIds.has(tool.id)}
                      onClick={() => {
                        const cat = catalog.tool(tool.id);
                        if (cat) toggleCatalogTool(cat);
                      }}
                    />
                  ))}
                  <MoreToolsOption
                    expanded={searchOpen}
                    controls={searchPanelId}
                    onClick={() => {
                      setSearchOpen((v) => !v);
                      setCustomOpen(false);
                      requestAnimationFrame(() => searchRef.current?.focus());
                    }}
                  />
                </div>

                {searchOpen && (
                  <div
                    id={searchPanelId}
                    className="mt-6 rounded-[18px] border border-[#E6E3DC] bg-[#FAF9F6] p-4"
                  >
                    <label className="relative block">
                      <span className="sr-only">Search all tools</span>
                      <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-sf-muted"
                        strokeWidth={2.2}
                      />
                      <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the full catalog…"
                        className={`h-11 w-full rounded-full border border-[#DAD7CF] bg-white pl-10 pr-10 text-[15px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            searchRef.current?.focus();
                          }}
                          className={`absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-sf-muted hover:bg-[#F3F1EB] ${focusRing}`}
                          aria-label="Clear search"
                        >
                          <X className="size-3.5" strokeWidth={2.2} />
                        </button>
                      )}
                    </label>

                    {q && (
                      <ul className="mt-3 max-h-[220px] overflow-y-auto">
                        {searchResults.length === 0 ? (
                          <li className="px-1 py-3 text-[13.5px] text-sf-muted">No matching tools</li>
                        ) : (
                          searchResults.map((t) => {
                            const on = selectedIds.has(t.id);
                            return (
                              <li key={t.id}>
                                <button
                                  type="button"
                                  aria-pressed={on}
                                  disabled={full && !on}
                                  onClick={() => toggleCatalogTool(t)}
                                  className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white disabled:opacity-40 ${focusRing}`}
                                >
                                  <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#E6E3DC]">
                                    <ToolLogo
                                      tool={toolFromCatalog(t, purposeForAdd(t))}
                                      size="18px"
                                      monogramSize="14px"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1 text-[14px] font-semibold text-sf-ink">
                                    {t.name}
                                  </span>
                                  <span className="text-[12px] font-semibold text-sf-muted">
                                    {on ? "Selected" : "Add"}
                                  </span>
                                </button>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    )}

                    {!customOpen ? (
                      <button
                        type="button"
                        onClick={() => setCustomOpen(true)}
                        className={`mt-3 rounded-md text-[13px] font-semibold text-sf-muted hover:text-sf-ink ${focusRing}`}
                      >
                        + Other (custom tool)
                      </button>
                    ) : (
                      <form onSubmit={submitCustom} className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value.slice(0, 32))}
                          placeholder="Tool name"
                          maxLength={32}
                          className={`h-10 min-w-[180px] flex-1 rounded-full border border-[#DAD7CF] bg-white px-4 text-[14px] ${focusRing}`}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!customName.trim() || full}
                          className={`h-10 rounded-full bg-sf-ink px-4 text-[13px] font-semibold text-white disabled:opacity-40 ${focusRing}`}
                        >
                          Add
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center">
                {stepIndex > 0 && <GuideNavButton onClick={goBack}>Back</GuideNavButton>}
              </div>
              <div className="flex flex-col items-end gap-2">
                {isFirst && !hasAssistant && (
                  <p id="assistants-hint" className="text-[13px] font-medium text-sf-muted">
                    Select at least one AI assistant to continue
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {!isFirst && <GuideNavButton onClick={skipStep}>Skip</GuideNavButton>}
                  <PrimaryButton
                    size={isRole ? undefined : "sm"}
                    onClick={goNext}
                    disabled={primaryDisabled}
                    aria-describedby={isFirst && !hasAssistant ? "assistants-hint" : undefined}
                    className={primaryDisabled ? "opacity-40" : ""}
                  >
                    {primaryLabel}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {generating && (
        <GenerateSequence
          tools={tools}
          onDone={() => {
            markResultsReveal();
            navigate("results");
          }}
          onCancel={() => setGenerating(false)}
        />
      )}
    </div>
  );
}

/** Outlined pill for Back and Skip. Next uses the main black and lime CTA. */
function GuideNavButton({ children, className = "", ...rest }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-11 items-center justify-center rounded-full border border-[#DAD7CF] bg-white px-5 text-[15px] font-semibold text-sf-ink transition-colors hover:border-[#B7B3A8] hover:bg-[#FAF9F6] ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

function toolMatchesQuery(tool: CatalogTool, q: string): boolean {
  if (normalize(tool.name).includes(q)) return true;
  if (tool.aliases?.some((a) => normalize(a).includes(q))) return true;
  if (normalize(tool.descriptor).includes(q)) return true;
  if (tool.parentPlatform && normalize(tool.parentPlatform).includes(q)) return true;
  return false;
}
