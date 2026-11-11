import {
  EVIDENCE_LABEL,
  PROJECT_STATUS_LABEL,
  type DraftProject,
} from "@/lib/experiments/ai-portfolio/types";
import { buildPreviewSummary, derivedCapabilities, derivedTools } from "@/lib/experiments/ai-portfolio/store";

export function PortfolioPreview({ projects }: { projects: DraftProject[] }) {
  const included = [...projects].filter((p) => p.included).sort((a, b) => a.order - b.order);
  const tools = derivedTools(included);
  const caps = derivedCapabilities(included);
  const summary = buildPreviewSummary(included);

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E5E1D8] bg-white text-sf-ink shadow-[0_24px_60px_-40px_rgba(11,11,12,.35)]">
      <header className="relative border-b border-[#EEECE6] px-6 py-7 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full opacity-80"
          style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.10), transparent)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 left-8 size-36 rounded-full opacity-70"
          style={{ background: "radial-gradient(closest-side, rgba(215,255,58,.18), transparent)" }}
        />
        <div className="relative space-y-3">
          <p className="text-[11px] font-bold tracking-[0.14em] text-sf-muted uppercase">AI Portfolio</p>
          <h3 className="font-display text-[28px] font-medium leading-[1.02] tracking-[-0.04em] sm:text-[34px]">
            What I’ve done with AI
          </h3>
          <p className="max-w-[40ch] text-[15px] leading-snug text-sf-body">{summary}</p>
        </div>
      </header>

      <section className="border-b border-[#EEECE6] px-6 py-6 sm:px-8">
        <p className="text-[11px] font-bold tracking-[0.14em] text-sf-muted uppercase">Selected work</p>
        {included.length === 0 ? (
          <p className="mt-3 text-[14px] leading-snug text-sf-muted">
            Include projects on the left to preview your portfolio.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {included.map((p) => (
              <li key={p.id} className="rounded-[16px] border border-[#EEECE6] bg-[#FBFAf7] px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-sf-ink">{p.title}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-sf-muted">
                    {PROJECT_STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-snug text-sf-body">{p.summary}</p>
                {p.outcome && (
                  <p className="mt-2 text-[12px] leading-snug text-sf-ink">
                    <span className="font-semibold">Outcome:</span> {p.outcome}
                  </p>
                )}
                {p.evidence.sourceUrl && (
                  <p className="mt-1 text-[12px] text-sf-blue">
                    <a href={p.evidence.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                      View link
                    </a>
                  </p>
                )}
                <p className="mt-2 text-[11px] text-sf-muted">{EVIDENCE_LABEL[p.evidence.kind]}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tools.length > 0 && (
        <section className="border-b border-[#EEECE6] px-6 py-6 sm:px-8">
          <p className="text-[11px] font-bold tracking-[0.14em] text-sf-muted uppercase">AI tools used</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tools.map((t) => (
              <li key={t} className="rounded-full bg-[#F1EFEA] px-3 py-1 text-[12px] font-semibold text-sf-ink">
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {caps.length > 0 && (
        <section className="px-6 py-6 sm:px-8">
          <p className="text-[11px] font-bold tracking-[0.14em] text-sf-muted uppercase">Capabilities shown</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {caps.map((c) => (
              <li key={c} className="rounded-full border border-[#E7E4DC] px-3 py-1 text-[12px] font-medium text-sf-body">
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
