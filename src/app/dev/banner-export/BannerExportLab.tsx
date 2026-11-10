"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { catalog } from "@/lib/catalog/adapter";
import { monogramFor, toolIconSlug } from "@/lib/selection/derive";
import {
  BANNER_EXPORT,
  BANNER_EXPORT_2X,
  BannerProfilePreview,
  LinkedInBanner,
  planBannerToolLayout,
  type AIProfile,
  type CardTheme,
  type CardTool,
} from "@/components/stackflex/results";
import { logoDataUrl } from "@/lib/stackflex/logoDataUrl";
import { inspectPngDataUrl, renderPng, saveDataUrl } from "@/lib/export/download";

/** Representative profile from the sharpness brief. */
const TOOL_IDS = [
  "claude",
  "claude-code",
  "hubspot-breeze",
  "zapier",
  "make",
  "claude-design",
  "runway",
  "otter",
] as const;

type ExportRow = {
  id: string;
  label: string;
  note: string;
  width: number;
  height: number;
  bytes: number;
  dataUrl: string;
  /** Display width when comparing at equal physical size (CSS px). */
  displayWidth: number;
};

function sampleTool(toolId: string): CardTool {
  const tool = catalog.tool(toolId);
  if (!tool) {
    return { id: toolId, name: toolId, category: "Custom", monogram: monogramFor(toolId) };
  }
  const categoryId = tool.categories[0];
  const category =
    (categoryId && catalog.category(categoryId)?.cardLabel) || tool.descriptor || "AI";
  const logo = logoDataUrl(toolIconSlug(tool));
  return {
    id: tool.id,
    name: tool.name,
    category,
    ...(logo ? { logo } : {}),
    monogram: tool.monogram ?? monogramFor(tool.name),
    accent: tool.aura,
  };
}

function buildProfile(): AIProfile {
  const tools = TOOL_IDS.map(sampleTool);
  return {
    workingStyle: {
      id: "builder",
      title: "AI Builder",
      tagline: "Ships real products, with AI as a co-builder.",
    },
    tools,
    toolCount: tools.length,
    categoryCount: new Set(tools.map((t) => t.category)).size,
  };
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Dev lab: prove true 2× (CSS 3168 layout) vs soft upscale (pixelRatio 2 on 1584).
 */
function subscribeNever() {
  return () => {};
}

export function BannerExportLab() {
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const [theme, setTheme] = useState<CardTheme>("dark");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<ExportRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const native1xRef = useRef<HTMLDivElement>(null);
  const true2xRef = useRef<HTMLDivElement>(null);

  const profile = useMemo(() => buildProfile(), []);
  const plan = useMemo(() => planBannerToolLayout(profile.tools), [profile.tools]);

  async function runExports() {
    const nativeNode = native1xRef.current;
    const true2xNode = true2xRef.current;
    if (!nativeNode || !true2xNode) return;

    setBusy(true);
    setError(null);
    try {
      await document.fonts.ready;
      const bg = theme === "dark" ? "#0B0B0E" : "#FFFFFF";

      // A — native 1× (LinkedIn recommended size)
      const nativeUrl = await renderPng(nativeNode, {
        width: BANNER_EXPORT.width,
        height: BANNER_EXPORT.height,
        pixelRatio: 1,
        filename: "stackflex-banner-1584x396.png",
        backgroundColor: bg,
      });
      const nativeMeta = await inspectPngDataUrl(nativeUrl);

      // Fake 2× — pixelRatio 2 on a 1584 node (upscales foreignObject raster)
      const fake2xUrl = await renderPng(nativeNode, {
        width: BANNER_EXPORT.width,
        height: BANNER_EXPORT.height,
        pixelRatio: 2,
        filename: "stackflex-banner-fake-2x-upscale.png",
        backgroundColor: bg,
      });
      const fake2xMeta = await inspectPngDataUrl(fake2xUrl);

      // B — true 2×: layout at 3168×792 CSS, capture 1:1
      const true2xUrl = await renderPng(true2xNode, {
        width: BANNER_EXPORT_2X.width,
        height: BANNER_EXPORT_2X.height,
        pixelRatio: 1,
        filename: "stackflex-linkedin-banner.png",
        backgroundColor: bg,
      });
      const true2xMeta = await inspectPngDataUrl(true2xUrl);

      setRows([
        {
          id: "1x",
          label: "A · Native 1×",
          note: "CSS 1584×396 · pixelRatio 1 · LinkedIn recommended size.",
          ...nativeMeta,
          dataUrl: nativeUrl,
          displayWidth: 792,
        },
        {
          id: "fake2x",
          label: "Fake 2× (pixelRatio upscale — avoid)",
          note: "CSS 1584×396 · pixelRatio 2 · same soft raster, stretched. Looks soft at 100% zoom.",
          ...fake2xMeta,
          dataUrl: fake2xUrl,
          displayWidth: 792,
        },
        {
          id: "true2x",
          label: "B · True 2× (default download)",
          note: "CSS 3168×792 layout · pixelRatio 1 · HTML/text/SVG painted at 2× density.",
          ...true2xMeta,
          dataUrl: true2xUrl,
          displayWidth: 792,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) {
    return <main className="min-h-screen bg-[#F7F5F0] px-6 py-10 text-[#0B0B0C]" />;
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] px-6 py-10 text-[#0B0B0C]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C897F]">Dev</p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-[-0.04em]">
              LinkedIn banner export quality
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6F6D66]">
              Profile: Claude, Claude Code, HubSpot Breeze, Zapier, Make, Claude Design, Runway,
              Otter.ai · layout {plan.cols} col · {plan.density}. html-to-image{" "}
              <code className="text-[12px]">pixelRatio:2</code> upscales a soft foreignObject
              raster — true 2× means laying out at 3168 CSS px.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 gap-0.5 rounded-full bg-white p-1 shadow-sm" role="radiogroup" aria-label="Theme">
              {(["dark", "light"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={theme === t}
                  onClick={() => {
                    setTheme(t);
                    setRows([]);
                  }}
                  className={`rounded-full px-3 text-sm font-semibold capitalize ${
                    theme === t ? "bg-[#0B0B0C] text-white" : "text-[#6F6D66]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void runExports()}
              className="h-10 rounded-full bg-[#0B0B0C] px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Exporting…" : "Run export comparison"}
            </button>
          </div>
        </header>

        {error && <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">{error}</p>}

        {/* Capture surfaces — untransformed, opacity 0 (same pattern as production download). */}
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[-1] overflow-hidden opacity-0"
          style={{ width: BANNER_EXPORT.width, height: BANNER_EXPORT.height }}
        >
          <LinkedInBanner ref={native1xRef} profile={profile} theme={theme} width={BANNER_EXPORT.width} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[-1] overflow-hidden opacity-0"
          style={{ width: BANNER_EXPORT_2X.width, height: BANNER_EXPORT_2X.height }}
        >
          <LinkedInBanner ref={true2xRef} profile={profile} theme={theme} width={BANNER_EXPORT_2X.width} />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#8C897F]">
              1× preview ({BANNER_EXPORT.width}×{BANNER_EXPORT.height})
            </h2>
            <div className="mt-3 overflow-auto">
              <LinkedInBanner profile={profile} theme={theme} width={BANNER_EXPORT.width} />
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#8C897F]">
              True 2× preview (scaled for display only)
            </h2>
            <div className="mt-3 overflow-hidden" style={{ height: BANNER_EXPORT.height }}>
              <div
                style={{
                  transform: "scale(0.5)",
                  transformOrigin: "top left",
                  width: BANNER_EXPORT_2X.width,
                }}
              >
                <LinkedInBanner profile={profile} theme={theme} width={BANNER_EXPORT_2X.width} />
              </div>
            </div>
            <p className="mt-2 text-xs text-[#8C897F]">
              Download uses a separate unscaled 3168×792 node — this scale is display-only.
            </p>
          </div>
        </section>

        <div className="max-w-[720px] rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#8C897F]">
            LinkedIn mockup (not exported)
          </h2>
          <div className="mt-3">
            <BannerProfilePreview profile={profile} theme={theme} displayName="Alex Morgan" />
          </div>
        </div>

        {rows.length > 0 && (
          <section className="flex flex-col gap-8">
            {rows.map((row) => (
              <article key={row.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em]">{row.label}</h2>
                    <p className="mt-1 text-sm text-[#6F6D66]">{row.note}</p>
                    <p className="mt-2 font-mono text-xs text-[#8C897F]">
                      {row.width}×{row.height}px · {formatBytes(row.bytes)}
                      {row.bytes >= 8 * 1024 * 1024 ? " · OVER 8 MB" : " · under 8 MB"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="h-9 rounded-full bg-[#F4F3EF] px-4 text-sm font-semibold hover:bg-[#ECEAE4]"
                    onClick={() =>
                      saveDataUrl(
                        row.dataUrl,
                        row.id === "true2x"
                          ? "stackflex-linkedin-banner-3168x792.png"
                          : row.id === "fake2x"
                            ? "stackflex-banner-fake-2x-upscale.png"
                            : "stackflex-banner-1584x396.png",
                      )
                    }
                  >
                    Download PNG
                  </button>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8C897F]">
                      At 100% pixels (scroll) — inspect glyph edges
                    </p>
                    <div className="overflow-auto rounded-lg bg-[#E8E6E0] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.dataUrl}
                        alt=""
                        width={row.width}
                        height={row.height}
                        style={{
                          width: row.width,
                          height: row.height,
                          maxWidth: "none",
                          imageRendering: "auto",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#8C897F]">
                      Same physical width ({row.displayWidth} CSS px)
                    </p>
                    <div className="overflow-hidden rounded-lg bg-[#E8E6E0] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.dataUrl}
                        alt=""
                        style={{ width: row.displayWidth, height: "auto", imageRendering: "auto" }}
                      />
                    </div>
                    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#8C897F]">
                      Magnified crop · title + first tools (left 42%)
                    </p>
                    <div className="overflow-hidden rounded-lg bg-[#E8E6E0]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.dataUrl}
                        alt=""
                        style={{
                          width: `${(100 / 0.42) * 1.6}%`,
                          maxWidth: "none",
                          transformOrigin: "top left",
                          // Show left content block larger for edge comparison
                          clipPath: "inset(8% 58% 45% 22%)",
                          marginBottom: "-20%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
