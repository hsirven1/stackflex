import type { ReactNode } from "react";
import { toolsForActivity, type ProfileActivity, type ProfileTool } from "@/lib/stackflex/profile";
import { ToolTag } from "./ToolTag";

type Props = {
  activities: ProfileActivity[];
  tools: ProfileTool[];
  variant?: "page" | "preview" | "showcase";
  /** Editable Results preview only. */
  emptyState?: ReactNode;
  /** e.g. "Edit activities" — Results preview only. */
  headerAction?: ReactNode;
};

/**
 * "How I use AI".
 * ≥640px: title column + tags. &lt;640px: title above tags.
 */
export function HowIUseAI({
  activities,
  tools,
  variant = "page",
  emptyState,
  headerAction,
}: Props) {
  const rows = activities
    .map((a) => ({ a, ts: toolsForActivity(a, tools) }))
    .filter((r) => r.ts.length || r.a.title);

  if (!rows.length) {
    return emptyState ? (
      <section className="flex flex-col gap-3.5">
        <Title variant={variant} action={headerAction} />
        {emptyState}
      </section>
    ) : null;
  }

  const titleCol =
    variant === "page"
      ? "sm:grid-cols-[280px_minmax(0,1fr)]"
      : variant === "preview"
        ? "sm:grid-cols-[240px_minmax(0,1fr)]"
        : "sm:grid-cols-[210px_minmax(0,1fr)]";
  const titleSize =
    variant === "page"
      ? "text-[15px] sm:text-base"
      : variant === "preview"
        ? "text-[14.5px]"
        : "text-[13.5px]";

  return (
    <section
      className={`flex flex-col ${variant === "page" ? "gap-3.5" : "gap-2"}`}
      aria-label="How I use AI"
    >
      <Title variant={variant} action={headerAction} />
      <ul className="flex flex-col gap-5 sm:gap-0">
        {rows.map(({ a, ts }, i) => (
          <li
            key={a.id}
            className={`grid gap-2 sm:items-center sm:gap-6 sm:py-3.5 ${titleCol} ${i ? "sm:border-t sm:border-[#EEECE6]" : ""}`}
          >
            <span className={`font-semibold tracking-[-0.01em] text-sf-ink ${titleSize}`}>
              {a.title}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {ts.map((t) => (
                <ToolTag key={t.id} tool={t} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Title({
  variant,
  action,
}: {
  variant: "page" | "preview" | "showcase";
  action?: ReactNode;
}) {
  const s =
    variant === "page" ? "text-[22px] sm:text-2xl" : variant === "preview" ? "text-xl" : "text-lg";
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className={`font-display font-medium leading-none tracking-[-0.035em] ${s}`}>
        How I use AI
      </h2>
      {action}
    </div>
  );
}
