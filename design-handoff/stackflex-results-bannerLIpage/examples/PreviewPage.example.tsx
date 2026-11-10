"use client";
// Preview route for visual QA (e.g. app/dev/results-preview/page.tsx). Uses SAMPLE data only.
import { AIProfileCard, AIProfileResults, LinkedInBanner } from "../components";
import { SAMPLE_BUILDER, SAMPLE_ORCHESTRATOR, SAMPLE_STRATEGIST_ONE } from "./sample-profile";

export default function ResultsPreview() {
  return (
    <>
      <AIProfileResults
        profile={SAMPLE_BUILDER}
        onDownloadCard={({ node, theme }) => console.log("download card", theme, node)}
        onDownloadBanner={({ node, theme }) => console.log("download banner", theme, node)}
        onShareCard={async () => { await navigator.clipboard.writeText("https://stackflex.ai/s/example"); return "copied"; }}
        onCustomize={() => console.log("customize")}
      />
      {/* Edge cases from review 2e: 6 tools dark, 1 tool light, 9 tools + long names in both themes */}
      <div className="flex flex-col gap-12 bg-[#FAF9F6] p-12">
        {([[SAMPLE_BUILDER, "dark"], [SAMPLE_STRATEGIST_ONE, "light"], [SAMPLE_ORCHESTRATOR, "dark"], [SAMPLE_ORCHESTRATOR, "light"]] as const).map(([p, t], i) => (
          <div key={i} className="flex items-start gap-10">
            <AIProfileCard profile={p} theme={t} width={344} />
            <div className="min-w-0 flex-1 overflow-hidden rounded-[10px]"><LinkedInBanner profile={p} theme={t} /></div>
          </div>
        ))}
      </div>
    </>
  );
}
