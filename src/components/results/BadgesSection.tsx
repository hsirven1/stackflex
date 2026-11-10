"use client";

import { ChevronDown } from "lucide-react";
import { TextAction } from "@/components/stackflex/Controls";
import { ReadmeArt, WebsiteBadgeArt } from "@/components/stackflex/BadgeArt";
import { EXPORT_PRESETS } from "@/lib/export/presets";
import { buildReadmeMarkdown, README_HEADING } from "@/lib/selection/share";
import type { StackState } from "@/lib/selection/types";
import { categoryLabel, type Tool } from "@/lib/stackflex/tools";
import type { AssetExporter } from "./artExport";
import type { ArtExport } from "./FormatPanels";
import { CopyAction, Row } from "./ResultsUI";

const BADGE_HEIGHT = 40;

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Website badge and GitHub README: chip previews, copyable snippets and download actions. */
export function BadgeRows({
  stack,
  tools,
  strip: { exporter: stripExporter },
  github: { exporter: readmeExporter },
}: {
  stack: StackState;
  tools: Tool[];
  strip: ArtExport;
  github: ArtExport;
}) {
  const names = tools.map((t) => t.name).join(", ");
  const html = tools.length
    ? `<img src="${EXPORT_PRESETS.strip.filename}" alt="${escapeHtml(`My AI stack: ${names}`)}" height="${BADGE_HEIGHT}">`
    : "";
  const list = tools.map((t) => `- ${t.name}${t.version ? ` (${t.version})` : ""} · ${categoryLabel(t.category)}`).join("\n");
  const readme = tools.length ? `${buildReadmeMarkdown(stack)}\n${list}\n` : "";

  return (
    <div className="flex flex-col gap-8">
      <Row label="Website badges" description="Embed your AI stack on your website.">
        <WebsiteBadgeArt tools={tools} wrap />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <CopyAction text={html} label="Copy HTML" what="Badge HTML" ink />
          <DownloadAction exporter={stripExporter} what="website badge" />
        </div>
      </Row>
      <Row label="GitHub README" description="Add your tools to your GitHub profile.">
        <ReadmeArt tools={tools} heading={README_HEADING} className="w-full" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <CopyAction text={readme} label="Copy Markdown" what="README Markdown" ink />
          <DownloadAction exporter={readmeExporter} what="README image" />
        </div>
        <details className="group w-full text-sm leading-relaxed text-sf-body">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 font-medium text-sf-body hover:text-sf-ink [&::-webkit-details-marker]:hidden">
            How to add this to GitHub
            <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Download the README image ({EXPORT_PRESETS.github.filename}).</li>
            <li>Open your GitHub profile README repository.</li>
            <li>
              Upload the image to an <code className="font-mono text-[13px]">assets</code> folder.
            </li>
            <li>
              Paste the copied Markdown into <code className="font-mono text-[13px]">README.md</code>.
            </li>
            <li>Commit the changes.</li>
          </ol>
          <p className="mt-2 text-sf-subtle">
            No profile README yet? Create a public repository named exactly like your GitHub username, with a README.md.
          </p>
        </details>
      </Row>
    </div>
  );
}

/** Badge export nodes at their exact output size. Always mounted, so downloads work while the previews are collapsed. */
export function BadgeExportNodes({
  tools,
  strip: { attach: attachStrip },
  github: { attach: attachReadme },
}: {
  tools: Tool[];
  strip: ArtExport;
  github: ArtExport;
}) {
  return (
    <div aria-hidden="true" inert className="pointer-events-none fixed left-[-10000px] top-0">
      <WebsiteBadgeArt ref={attachStrip} tools={tools} />
      <ReadmeArt ref={attachReadme} tools={tools} heading={README_HEADING} />
    </div>
  );
}

function DownloadAction({ exporter, what }: { exporter: AssetExporter; what: string }) {
  const status = exporter.status;
  return (
    <>
      <TextAction onClick={() => void exporter.download()} disabled={status === "working"} aria-label={`Download ${what} PNG`}>
        {status === "working" ? "Preparing…" : status === "done" ? "Downloaded ✓" : "Download PNG"}
      </TextAction>
      <span className="sr-only" role="status">
        {status === "done" ? `Downloaded ${exporter.filename}` : status === "error" ? "The image couldn’t be created." : ""}
      </span>
    </>
  );
}
