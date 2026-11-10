"use client";

import { useEffect, useState, type ReactNode } from "react";
import { focusRing, TextAction } from "@/components/stackflex/Controls";
import { copyText } from "@/lib/clipboard";

/** True for two seconds after `flash()`; drives "Copied ✓"-style confirmations. */
export function useFlash() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const timer = setTimeout(() => setOn(false), 2000);
    return () => clearTimeout(timer);
  }, [on]);
  return [on, () => setOn(true)] as const;
}

export const MODULE =
  "rounded-[22px] bg-white shadow-[0_0_0_1px_#ECEAE4,0_1px_2px_rgba(11,11,12,.04),0_20px_44px_-36px_rgba(11,11,12,.22)]";

/**
 * One visual format: title + controls, then preview and actions.
 * `layout="below"` (bento default): preview full-width, actions in a compact toolbar underneath.
 * `layout="beside"`: actions sit beside the preview at wider container widths.
 */
export function FormatModule({
  id,
  title,
  controls,
  preview,
  actions,
  layout = "below",
  className = "",
  compact = false,
}: {
  id: string;
  title: string;
  /** Segmented switches (platform, theme), right of the title. */
  controls?: ReactNode;
  preview: ReactNode;
  actions?: ReactNode;
  layout?: "below" | "beside";
  className?: string;
  /** Tighter padding / smaller title for right-column bento cards. */
  compact?: boolean;
}) {
  const body =
    layout === "beside" ? (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 px-3 pb-3 @[640px]:grid-cols-[minmax(0,1fr)_240px] @[640px]:items-center @[640px]:gap-5 @[640px]:pr-5">
        <div className="flex min-w-0 justify-center rounded-[16px] bg-sf-paper p-3 sm:px-5">{preview}</div>
        {actions && <div className="px-2 pb-2 @[640px]:p-0">{actions}</div>}
      </div>
    ) : (
      <div className={`flex flex-col gap-2.5 ${compact ? "px-3.5 pb-3.5" : "px-4 pb-4"}`}>
        <div className={`flex min-w-0 justify-center rounded-[14px] bg-sf-paper ${compact ? "p-2" : "p-2.5 sm:p-3"}`}>
          {preview}
        </div>
        {actions && <div className="px-0.5">{actions}</div>}
      </div>
    );

  return (
    <section aria-labelledby={id} className={`${MODULE} flex flex-col ${className}`}>
      <header
        className={`flex flex-none flex-wrap items-center justify-between gap-x-3 gap-y-2 ${
          compact ? "px-3.5 pb-1.5 pt-2.5" : "px-5 pb-3 pt-4"
        }`}
      >
        <h3
          id={id}
          className={`font-display font-medium leading-[1.1] tracking-[-0.035em] ${
            compact ? "text-[18px]" : "text-[22px]"
          }`}
        >
          {title}
        </h3>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </header>
      {body}
    </section>
  );
}

/**
 * Stable shell for download → next-step action swaps so the bento layout doesn’t jump.
 * Keeps a minimum height across idle / preparing / started / error.
 */
export function ActionStage({ children }: { children: ReactNode }) {
  return <div className="flex min-h-[3.25rem] flex-col justify-center">{children}</div>;
}

/** Action cluster: toolbar row when `inline`, otherwise a compact stacked grid. */
export function ShareActions({
  children,
  note,
  status,
  inline = false,
}: {
  children: ReactNode;
  note?: ReactNode;
  status?: string;
  /** Horizontal wrapping toolbar (Social Post / compact modules). */
  inline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={inline ? "flex flex-wrap items-center gap-2" : "grid gap-2 sm:grid-cols-2"}>
        {children}
      </div>
      {note && <p className="text-[12.5px] leading-[1.45] text-sf-subtle">{note}</p>}
      <p role="status" className="text-[12.5px] font-medium leading-snug text-sf-body empty:hidden">
        {status}
      </p>
    </div>
  );
}

type UtilityProps = React.ComponentProps<"button"> & { icon?: ReactNode };

const UTILITY =
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-shadow disabled:cursor-default disabled:opacity-50";

/**
 * Compact filled utility action for Results downloads / copy — no lime arrow coin.
 * Reserve Controls `PrimaryButton` (black + lime) for product-level CTAs only.
 */
export function UtilityButton({ children, icon, className = "", ...rest }: UtilityProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${UTILITY} bg-sf-ink text-white hover:bg-sf-ink/90 ${focusRing} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Outlined secondary utility — Open LinkedIn/X, Copy image beside a primary download. */
export function ActionButton({ children, icon, className = "", ...rest }: UtilityProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${UTILITY} bg-white text-sf-ink shadow-[0_0_0_1px_#E3E0D8] hover:shadow-[0_0_0_1px_#CFCBC1,0_6px_16px_-10px_rgba(11,11,12,.25)] ${focusRing} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Tertiary text/ghost control — Download again, quiet secondary links. */
export function GhostButton({ children, icon, className = "", ...rest }: UtilityProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-10 items-center gap-1.5 rounded-sm px-1.5 text-[13px] font-medium text-sf-body hover:text-sf-ink disabled:cursor-default disabled:opacity-50 ${focusRing} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/** Label and short purpose + content, used inside "More ways to share". */
export function Row({ label, description, children }: { label: string; description: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 @[600px]:grid-cols-[200px_minmax(0,1fr)] @[600px]:gap-6">
      <div className="flex flex-col gap-[3px] @[600px]:pt-1">
        <span className="text-[15px] font-semibold">{label}</span>
        <span className="text-[13px] leading-snug text-sf-subtle">{description}</span>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-3.5">{children}</div>
    </div>
  );
}

/** Copies `text`, confirming with "Copied ✓" and a status message. */
export function CopyAction({
  text,
  label = "Copy",
  what,
  onCopied,
  ink = false,
}: {
  text: string;
  label?: string;
  /** Spoken in the confirmation and the button name, e.g. "LinkedIn headline". */
  what: string;
  onCopied?: () => void;
  /** Ink pill (Badges) instead of a quiet text action. */
  ink?: boolean;
}) {
  const [copied, flash] = useFlash();
  async function copy() {
    if (await copyText(text)) {
      flash();
      onCopied?.();
    }
  }
  const content = copied ? "Copied ✓" : label;
  return (
    <>
      {ink ? (
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          aria-label={label === "Copy" ? `Copy ${what}` : undefined}
          className={`h-10 rounded-full bg-sf-ink px-[18px] text-sm font-semibold text-white hover:bg-sf-ink/85 disabled:opacity-40 ${focusRing}`}
        >
          {content}
        </button>
      ) : (
        <TextAction onClick={copy} disabled={!text} aria-label={label === "Copy" ? `Copy ${what}` : undefined}>
          {content}
        </TextAction>
      )}
      <span className="sr-only" role="status">
        {copied ? `${what} copied to clipboard` : ""}
      </span>
    </>
  );
}

/** Text format row: label (and options) · text · Copy. */
export function TextRow({
  label,
  description,
  detail,
  options,
  text,
  onCopied,
}: {
  label: string;
  /** What the text is for, under the label. */
  description?: string;
  /** Quiet note beside the label, e.g. a character count. */
  detail?: string;
  /** Variant switch under the label. */
  options?: ReactNode;
  text: string;
  onCopied?: () => void;
}) {
  return (
    <div className="grid gap-2 border-t border-[#F2F0EB] py-[18px] @[600px]:grid-cols-[200px_minmax(0,1fr)_auto] @[600px]:items-baseline @[600px]:gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold">
          {label}
          {detail && <span className="ml-2 text-[12.5px] font-medium tabular-nums text-sf-subtle">{detail}</span>}
        </span>
        {description && <span className="text-[13px] leading-snug text-sf-subtle">{description}</span>}
        {options}
      </div>
      <p className="whitespace-pre-line text-[15px] leading-normal text-sf-ver [text-wrap:pretty]">{text}</p>
      <div className="justify-self-start">
        <CopyAction text={text} what={label} onCopied={onCopied} />
      </div>
    </div>
  );
}

/** Quiet inline variant switch, e.g. "Expressive · Clean". */
export function VariantSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <span role="group" aria-label={label} className="text-[13px] font-medium text-sf-subtle">
      {options.map((o, i) => (
        <span key={o.value}>
          {i > 0 && " · "}
          <button
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-sm hover:text-sf-ink ${value === o.value ? "font-semibold text-sf-ink" : ""} ${focusRing}`}
          >
            {o.label}
          </button>
        </span>
      ))}
    </span>
  );
}

/** White pill in the stack panel ("+ Add tool", "Edit stack"). */
export function PanelButton({ children, onClick }: { children: ReactNode; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 flex-1 rounded-full bg-white text-[14px] font-semibold text-sf-ink shadow-[0_0_0_1px_#E8E5DE] transition-shadow hover:shadow-[0_0_0_1px_#CFCBC1,0_6px_16px_-10px_rgba(11,11,12,.25)] ${focusRing}`}
    >
      {children}
    </button>
  );
}
