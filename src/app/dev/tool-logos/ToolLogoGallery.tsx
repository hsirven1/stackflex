"use client";

import { useMemo, useState } from "react";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import { auditAllToolLogos, type LogoAuditStatus } from "@/lib/catalog/logoAudit";
import { catalog } from "@/lib/catalog/adapter";

const STATUS_FILTERS: Array<"All" | LogoAuditStatus> = [
  "All",
  "Verified official",
  "Verified maintained library",
  "Parent-brand fallback",
  "Monogram fallback",
  "Missing",
  "Needs review",
];

/** Interactive review grid for every catalog tool logo (dev only). */
export function ToolLogoGallery() {
  const rows = useMemo(() => auditAllToolLogos(), []);
  const categories = useMemo(() => catalog.categories().map((c) => c.id), []);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [category, setCategory] = useState<string>("All");
  const [q, setQ] = useState("");

  const filtered = rows.filter((r) => {
    if (status !== "All" && r.status !== status) return false;
    if (category !== "All" && !r.tool.categories.includes(category as never)) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      if (!`${r.name} ${r.id} ${r.iconSlug ?? ""}`.toLowerCase().includes(needle)) return false;
    }
    return true;
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length };
    for (const s of STATUS_FILTERS.slice(1)) c[s] = rows.filter((r) => r.status === s).length;
    return c;
  }, [rows]);

  return (
    <main className="min-h-svh bg-[#F4F3EF] px-4 py-8 text-sf-ink md:px-8">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8C897F]">Development only</p>
        <h1 className="mt-1 font-display text-[32px] font-medium tracking-[-0.04em] md:text-[40px]">Tool logo audit</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-[#6F6D66]">
          Every catalog tool rendered through the shared <code className="rounded bg-white px-1.5 py-0.5 text-[13px]">getLogo</code>{" "}
          resolver. Review light and dark surfaces, then update{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-[13px]">docs/tool-logo-audit.md</code>.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                status === s ? "bg-sf-ink text-white" : "bg-white text-[#55534D] shadow-[inset_0_0_0_1px_#E6E3DC]"
              }`}
            >
              {s}
              <span className="ml-1.5 opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="text-[13px] font-medium text-[#8C897F]">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-full border border-[#DAD7CF] bg-white px-3 text-[13px] font-semibold"
          >
            <option value="All">All</option>
            {categories.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or id…"
            className="h-9 min-w-[200px] flex-1 rounded-full border border-[#DAD7CF] bg-white px-4 text-[13px]"
          />
          <span className="text-[13px] text-[#8C897F]">
            Showing {filtered.length} / {rows.length}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article key={r.id} className="overflow-hidden rounded-[16px] bg-white shadow-[0_0_0_1px_#E6E3DC]">
              <div className="grid grid-cols-2">
                <div className="flex items-center justify-center bg-[#FAF9F6] py-6">
                  <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#E6E3DC]">
                    <ToolLogo tool={{ iconSlug: r.iconSlug, monogram: r.tool.monogram ?? r.name.slice(0, 2).toUpperCase() }} size="22px" monogramSize="14px" />
                  </span>
                </div>
                <div className="flex items-center justify-center bg-[#121218] py-6">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#1C1B22] shadow-[0_0_0_1px_#2A2733]">
                    <ToolLogo
                      tool={{ iconSlug: r.iconSlug, monogram: r.tool.monogram ?? r.name.slice(0, 2).toUpperCase() }}
                      size="22px"
                      monogramSize="14px"
                      monogramClassName="font-display font-medium leading-none tracking-[-0.04em] text-white"
                    />
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-[#EEECE6] p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em]">{r.name}</h2>
                  <StatusPill status={r.status} />
                </div>
                <p className="font-mono text-[12px] text-[#8C897F]">{r.id}</p>
                <p className="text-[12.5px] text-[#6F6D66]">
                  <span className="font-semibold text-[#55534D]">Category:</span> {r.category}
                </p>
                <p className="text-[12.5px] leading-snug text-[#6F6D66]">
                  <span className="font-semibold text-[#55534D]">Source:</span> {r.source}
                </p>
                {r.notes && <p className="text-[12px] leading-snug text-[#8C897F]">{r.notes}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: LogoAuditStatus }) {
  const tone =
    status === "Verified official" || status === "Verified maintained library"
      ? "bg-[#EAF8E4] text-[#2F6B2F]"
      : status === "Parent-brand fallback"
        ? "bg-[#EEF2FF] text-[#3A2EFF]"
        : status === "Monogram fallback" || status === "Missing"
          ? "bg-[#F8E8E4] text-[#9B3B2F]"
          : "bg-[#F4F1E4] text-[#8A6A18]";
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{status}</span>;
}
