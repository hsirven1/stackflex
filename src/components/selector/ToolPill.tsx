"use client";

import { Check, Plus } from "lucide-react";
import { ToolIcon } from "./ToolIcon";

interface ToolPillProps {
  label: string;
  iconSlug?: string;
  selected: boolean;
  /** Loadout is full and this pill isn't selected: still clickable (shows the limit notice) but dimmed. */
  unavailable?: boolean;
  /** Marks a "create custom tool" action rather than a catalog tool. */
  variant?: "tool" | "create";
  onClick: () => void;
  /** Lets the header loadout focus this pill. */
  pillId?: string;
}

/** Logo + name selection pill. Selection is shown by fill and a check mark, not color alone. */
export function ToolPill({ label, iconSlug, selected, unavailable, variant = "tool", onClick, pillId }: ToolPillProps) {
  return (
    <button
      type="button"
      aria-pressed={variant === "tool" ? selected : undefined}
      aria-disabled={unavailable || undefined}
      title={unavailable ? "Stack full — remove a tool first" : undefined}
      data-pill={pillId}
      onClick={onClick}
      className={[
        "inline-flex h-10 max-w-full items-center gap-2 rounded-full pl-1 text-[15px] transition-shadow",
        "outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2",
        selected
          ? "bg-white pr-2 font-semibold text-sf-blue shadow-[0_0_0_2px_#3A2EFF]"
          : variant === "create"
            ? "border-[1.5px] border-dashed border-[#CFCBC1] bg-white pr-4 font-medium text-sf-muted hover:text-sf-ink"
            : "bg-white pr-4 font-medium text-sf-ink shadow-[0_0_0_1px_#ECEAE4] hover:shadow-[0_0_0_1px_#D6D3CA,0_8px_16px_-10px_rgba(11,11,12,.22)]",
        unavailable ? "opacity-45" : "",
      ].join(" ")}
    >
      {variant === "create" ? (
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-sf-chip">
          <Plus aria-hidden="true" className="size-3.5" />
        </span>
      ) : (
        <ToolIcon slug={iconSlug} label={label} size={18} rounded />
      )}
      <span className="truncate">{label}</span>
      {selected && (
        <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sf-lime text-sf-ink">
          <Check className="size-3" strokeWidth={4} />
        </span>
      )}
    </button>
  );
}
