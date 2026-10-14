"use client";

import { ChevronDown } from "lucide-react";
import { EXPORT_PRESETS } from "@/lib/export/presets";
import { buildReadmeMarkdown, README_HEADING } from "@/lib/selection/share";
import { setAssetTheme } from "@/lib/selection/store";
import type { StackState } from "@/lib/selection/types";
import type { Tool } from "@/lib/stackflex/tools";
import { BadgeStripPreview, type ArtExport } from "./FormatPanels";
import { CopyButton, DownloadButton, ExportError, Panel, ThemeToggle } from "./ResultsUI";

/** The badge strip as a GitHub profile README section: PNG for the repo plus matching Markdown. */
export function GitHubReadmeCard({ stack, tools, art }: { stack: StackState; tools: Tool[]; art: ArtExport }) {
  const markdown = buildReadmeMarkdown(stack);

  return (
    <Panel
      id="asset-github"
      title="GitHub README"
      meta="Markdown and badges PNG"
      actions={
        <>
          <ThemeToggle label="GitHub badges theme" value={art.theme} onChange={(t) => setAssetTheme("github", t)} />
          <CopyButton text={markdown} label="Copy Markdown" />
          <DownloadButton exporter={art.exporter} label="Download badges" ariaLabel="Download GitHub badges PNG" />
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <span className="font-display text-lg font-medium tracking-[-0.02em]">{README_HEADING}</span>
        <BadgeStripPreview tools={tools} art={art} />
      </div>
      <ExportError exporter={art.exporter} />
      <details className="group rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold [&::-webkit-details-marker]:hidden">
          How to add this to GitHub
          <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sf-body">
          <li>Download the badges PNG ({EXPORT_PRESETS.github.filename}).</li>
          <li>Open your GitHub profile README repository.</li>
          <li>
            Upload the image to an <code className="font-mono text-[13px]">assets</code> folder.
          </li>
          <li>
            Paste the copied Markdown into <code className="font-mono text-[13px]">README.md</code>.
          </li>
          <li>Commit the changes.</li>
        </ol>
        <p className="mt-2 text-sf-muted">
          No profile README yet? Create a public repository named exactly like your GitHub username, with a README.md.
        </p>
      </details>
    </Panel>
  );
}
