import type { ExperimentStep } from "@/lib/experiments/ai-portfolio/types";

const STEPS: { n: ExperimentStep; label: string }[] = [
  { n: 1, label: "Copy prompt" },
  { n: 2, label: "Paste response" },
  { n: 3, label: "Review portfolio" },
];

export function StepProgress({ step }: { step: ExperimentStep }) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const active = s.n === step;
          const done = s.n < step;
          return (
            <li key={s.n} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-current={active ? "step" : undefined}
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    active
                      ? "bg-sf-ink text-white"
                      : done
                        ? "bg-sf-lime text-sf-ink"
                        : "bg-[#EFEDE6] text-sf-muted"
                  }`}
                >
                  {done ? "✓" : s.n}
                </span>
                <span
                  className={`truncate text-[13px] font-semibold ${
                    active ? "text-sf-ink" : done ? "text-sf-body" : "text-sf-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className={`h-px flex-1 ${done ? "bg-sf-lime" : "bg-[#E7E4DC]"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
