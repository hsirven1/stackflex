"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/stackflex/Brand";
import { TextButton } from "@/components/stackflex/Controls";
import { StepCopy } from "@/components/experiments/ai-portfolio/StepCopy";
import { StepPaste } from "@/components/experiments/ai-portfolio/StepPaste";
import { StepProgress } from "@/components/experiments/ai-portfolio/StepProgress";
import { StepReview } from "@/components/experiments/ai-portfolio/StepReview";
import {
  clearExperimentData,
  setProvider,
  setStep,
  useAiPortfolioExperiment,
} from "@/lib/experiments/ai-portfolio/store";

export function AiPortfolioExperiment() {
  const state = useAiPortfolioExperiment();
  const [emptyNotice, setEmptyNotice] = useState(false);
  const savedLocally = state.updatedAt > 0;

  return (
    <div className="relative min-h-svh bg-[#F7F5F0] text-sf-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#EDEAE3 1px, transparent 1px), linear-gradient(90deg, #EDEAE3 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(70% 60% at 50% 20%, #000 20%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1100px] px-5 pb-20 pt-6 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sf-blue/40">
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#E0DCCF] bg-white/80 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-sf-muted uppercase">
              Experimental
            </span>
            {savedLocally && (
              <span className="text-[12px] text-sf-muted" title="Saved in this browser only">
                Draft saved locally
              </span>
            )}
            {savedLocally && (
              <TextButton
                onClick={() => {
                  if (window.confirm("Clear this experiment draft from this browser?")) {
                    clearExperimentData();
                    setEmptyNotice(false);
                  }
                }}
              >
                Clear draft
              </TextButton>
            )}
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-[720px] text-center sm:mt-14">
          <h1 className="font-display text-[36px] font-medium leading-[0.98] tracking-[-0.045em] text-sf-ink sm:text-[48px]">
            Turn your AI work into a portfolio.
          </h1>
          <p className="mx-auto mt-4 max-w-[46ch] text-[16px] leading-snug text-sf-body sm:text-[18px]">
            Discover projects, workflows, and accomplishments you’ve worked on with AI, then turn them into a portfolio
            worth sharing.
          </p>
          <p className="mt-3 text-[14px] text-sf-muted">Start with ChatGPT or Claude. No signup required.</p>
        </section>

        <ol className="mx-auto mt-8 flex max-w-[640px] flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-semibold text-sf-muted">
          <li>1. Copy a prompt</li>
          <li aria-hidden="true" className="text-[#D2CEC3]">
            ·
          </li>
          <li>2. Paste the response</li>
          <li aria-hidden="true" className="text-[#D2CEC3]">
            ·
          </li>
          <li>3. Review your portfolio</li>
        </ol>

        <div className="mx-auto mt-8 max-w-[980px] rounded-[28px] border border-[#E7E4DC] bg-white/95 p-5 shadow-[0_30px_80px_-50px_rgba(11,11,12,.45)] sm:p-8">
          <StepProgress step={state.step} />
          <div className="mt-8">
            {state.step === 1 && (
              <StepCopy
                provider={state.provider}
                onProviderChange={setProvider}
                onContinue={() => setStep(2)}
              />
            )}
            {state.step === 2 && (
              <StepPaste
                provider={state.provider}
                onBack={() => setStep(1)}
                onEmpty={() => setEmptyNotice(true)}
              />
            )}
            {state.step === 3 && (
              <StepReview
                state={state}
                emptyNotice={emptyNotice || state.projects.length === 0}
                onBackToPaste={() => {
                  setEmptyNotice(false);
                  setStep(2);
                }}
              />
            )}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-[640px] text-center text-[12px] leading-snug text-sf-muted">
          Drafts stay in this browser and aren’t synced across devices. Clearing site data removes them. This experiment
          does not publish a public portfolio page.
        </p>
      </div>
    </div>
  );
}
