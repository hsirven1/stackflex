"use client";
// Preview route for visual QA (e.g. app/dev/results-preview/page.tsx). Uses SAMPLE data only.
import { AIProfileCard, AIProfileResults } from "../components";
import { SAMPLE_BUILDER, SAMPLE_CREATIVE, SAMPLE_MANY, SAMPLE_OPERATOR, SAMPLE_STRATEGIST } from "./sample-profile";

export default function ResultsPreview() {
  return (
    <>
      <AIProfileResults
        profile={SAMPLE_BUILDER}
        onDownloadCard={({ node, theme }) => console.log("download", theme, node)}
        onCopyProfileLink={() => navigator.clipboard.writeText("https://stackflex.app/s/example")}
        onEditStack={() => console.log("edit stack")}
        howDerived={<p>Based on the tools you selected and how you use them.</p>}
        toolkit={<div className="text-sm text-[#8C897F]">Plug the existing &lt;StackSections variant=&quot;page&quot; /&gt; here.</div>}
      />
      <div className="flex flex-wrap gap-7 bg-[#FAF9F6] p-12">
        {[SAMPLE_STRATEGIST, SAMPLE_CREATIVE, SAMPLE_OPERATOR, SAMPLE_MANY].map((p, i) => (
          <div key={i} className="flex flex-col gap-4">
            <AIProfileCard profile={p} theme="dark" width={300} />
            <AIProfileCard profile={p} theme="light" width={300} />
          </div>
        ))}
      </div>
    </>
  );
}
