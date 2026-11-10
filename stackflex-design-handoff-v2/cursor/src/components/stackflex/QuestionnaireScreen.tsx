"use client";
import { useMemo, useState } from "react";
import type { Tool } from "@/lib/stackflex/tools";
import { Wordmark } from "./Brand";
import { ModelPill, MoreToolsOption, PrimaryButton, StepIndicator, TextButton, ToolOption } from "./Controls";
import { StackBoard } from "./StackBoard";

// One question per screen. Connect step/question/options to your existing questionnaire config;
// only step 2 ("Build" / "What do you build with?") is drawn in the approved mocks.
// Motion (approved): a picked tool flies into the next open tray slot (240ms), then its tint fades in.

type Props = {
  step?: number;
  total?: number;
  eyebrow?: string;
  question?: string;
  options: Tool[]; // from your existing tool catalog
  stack?: Tool[];
  onStackChange?: (next: Tool[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onExit?: () => void;
  onMoreTools?: () => void;
};

export function QuestionnaireScreen({
  step = 2,
  total = 6,
  eyebrow = "Build",
  question = "What do you build with?",
  options,
  stack: controlled,
  onStackChange,
  onNext,
  onBack,
  onSkip,
  onExit,
  onMoreTools,
}: Props) {
  const [local, setLocal] = useState<Tool[]>(controlled ?? []);
  const stack = controlled ?? local;
  const setStack = (next: Tool[]) => (onStackChange ? onStackChange(next) : setLocal(next));
  const ids = useMemo(() => new Set(stack.map((t) => t.id)), [stack]);

  // Model row follows the most recently picked option that offers models.
  const active = [...stack].reverse().find((t) => options.some((o) => o.id === t.id) && t.models?.length);

  const toggle = (opt: Tool) =>
    setStack(ids.has(opt.id) ? stack.filter((t) => t.id !== opt.id) : [...stack, { ...opt }]);

  const pickModel = (m: string | undefined) =>
    active && setStack(stack.map((t) => (t.id === active.id ? { ...t, version: m } : t)));

  return (
    <main className="flex min-h-screen flex-col bg-white text-sf-ink lg:h-[900px] lg:min-h-0">
      <header className="flex h-[88px] flex-none items-center justify-between px-5 md:px-10 xl:px-[120px]">
        <Wordmark />
        <div className="hidden md:block"><StepIndicator step={step} total={total} /></div>
        <TextButton onClick={onExit} className="text-[15px]">Exit</TextButton>
      </header>

      <section className="flex flex-1 flex-col px-5 pt-9 md:px-10 xl:px-[120px]">
        <div className="mb-6 md:hidden"><StepIndicator step={step} total={total} /></div>
        <span className="text-[17px] font-medium text-sf-blue">{eyebrow}</span>
        <h1 className="mt-2.5 font-display text-[44px] font-medium leading-none tracking-[-0.05em] md:text-[64px] lg:text-[80px]">{question}</h1>

        <div className="mt-12 grid grid-cols-3 justify-items-center gap-y-8 sm:grid-cols-5 lg:flex lg:justify-between">
          {options.map((o) => (
            <ToolOption key={o.id} tool={o} selected={ids.has(o.id)} onClick={() => toggle(o)} />
          ))}
          <MoreToolsOption onClick={onMoreTools} />
        </div>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-h-11 flex-wrap items-center gap-2.5">
            {active && (
              <>
                <span className="mr-2 text-lg text-sf-muted">{active.name} with</span>
                {active.models!.map((m) => (
                  <ModelPill key={m} selected={stack.find((t) => t.id === active.id)?.version === m} onClick={() => pickModel(m)}>
                    {m}
                  </ModelPill>
                ))}
                <ModelPill ghost>Other</ModelPill>
              </>
            )}
          </div>
          <div className="flex items-center gap-7 self-end lg:self-auto">
            <TextButton onClick={onBack}>Back</TextButton>
            <TextButton onClick={onSkip}>Skip</TextButton>
            <PrimaryButton onClick={onNext}>Next</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Live stack tray. White, separated by a hairline. */}
      <section className="mt-10 flex flex-none flex-col gap-6 border-t border-[#EEECE6] bg-white px-5 py-8 md:px-10 lg:mt-0 lg:h-[240px] lg:flex-row lg:items-center lg:gap-10 lg:py-0 xl:px-[120px]">
        <div className="flex flex-col gap-1.5 lg:w-[200px]">
          <span className="font-display text-[26px] font-medium tracking-[-0.035em]">Your stack</span>
          <span className="text-[15px] text-sf-muted">{stack.length} picked · add as many as you like</span>
        </div>
        <StackBoard tools={stack} layout="tray" highlightLast onAdd={onMoreTools} className="flex-none overflow-x-auto" />
        <span className="max-w-[260px] flex-1 text-sm leading-normal text-sf-subtle">
          Your first pick is the main card. Drag any card onto it to swap.
        </span>
      </section>
    </main>
  );
}
