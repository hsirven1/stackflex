"use client";

import { useEffect } from "react";
import { BuilderView } from "@/components/builder/BuilderView";
import { GuidedBuilder } from "@/components/guided/GuidedBuilder";
import { LandingView } from "@/components/landing/LandingView";
import { ResultsView } from "@/components/results/ResultsView";
import { finishGuide, resumeGuide } from "@/lib/guide";
import { useHydrated, useStack } from "@/lib/selection/store";
import { useRoute, type View } from "@/lib/view";
import { AppChrome } from "./AppChrome";
import { NoticeToast } from "./NoticeToast";

export function StackFlexApp() {
  const stack = useStack();
  const hydrated = useHydrated();
  const route = useRoute();

  // The bare URL (or an unknown hash) opens the landing page; it links to a saved stack's Results.
  let view: View = route ?? "home";
  if (view === "results" && stack.items.length === 0) view = "guide";

  useEffect(() => {
    if (!hydrated) return;
    if (view === "guide") resumeGuide();
    else if (view === "results") finishGuide();
  }, [hydrated, view]);

  if (!hydrated) return <div className="min-h-screen flex-1 bg-white" />;

  return (
    <>
      {view === "home" ? (
        <LandingView stack={stack} />
      ) : view === "guide" ? (
        <GuidedBuilder stack={stack} />
      ) : view === "results" ? (
        <ResultsView stack={stack} />
      ) : (
        <AppChrome>
          <BuilderView stack={stack} />
        </AppChrome>
      )}
      <NoticeToast />
    </>
  );
}
