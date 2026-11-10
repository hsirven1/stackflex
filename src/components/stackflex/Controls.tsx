import { useRef, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { siX } from "simple-icons";
import { DURATION, EASE, play, reducedMotion } from "@/lib/motion";
import type { Tool } from "@/lib/stackflex/tools";
import { ToolLogo } from "./ToolLogo";

// Focus ring is not in the mocks; it is required for accessibility. Keep it this subtle.
export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2";

type Btn = ComponentProps<"button">;

/** Right chevron for primary CTAs. Geometric center of the path is the visual center. */
export function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`block ${className}`}>
      <path
        d="M5 12h12M13 6.5 18.5 12 13 17.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Download chevron for export actions. Same viewBox and stroke as ArrowRightIcon. */
export function ArrowDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`block ${className}`}>
      <path
        d="M12 5v12M6.5 13 12 18.5 17.5 13"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Lime coin that holds the PrimaryButton glyph. SVG icons are flex-centered in a fixed box so
 * typographic baseline / line-height cannot shift them.
 */
function LimeIcon({ size, children }: { size: "sm" | "md" | "lg"; children: ReactNode }) {
  const box = size === "lg" ? "size-12" : size === "sm" ? "size-[38px]" : "size-11";
  const glyph = size === "lg" ? "size-[22px]" : size === "sm" ? "size-[15px]" : "size-[18px]";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex flex-none items-center justify-center rounded-full bg-sf-lime text-sf-ink transition-transform duration-150 ease-out group-hover:translate-x-0.5 ${box}`}
    >
      <span className={`inline-flex items-center justify-center leading-none ${glyph} [&_svg]:size-full`}>
        {children}
      </span>
    </span>
  );
}

/**
 * Compact progress for the stepped questionnaire.
 * `step` is 1-indexed. Default layout: “Step X of N” above the bar (beside the question).
 */
export function StepIndicator({
  step,
  total = 6,
  layout = "stacked",
}: {
  step: number;
  total?: number;
  /** stacked = label above bar (onboarding); inline = bar + fraction side-by-side */
  layout?: "stacked" | "inline";
}) {
  const bar = (
    <div className="flex w-full gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-[3px] ${
            i < step - 1 ? "bg-sf-ink" : i === step - 1 ? "bg-sf-blue" : "bg-sf-line"
          }`}
        />
      ))}
    </div>
  );

  if (layout === "inline") {
    return (
      <div className="flex items-center gap-3.5" aria-label={`Step ${step} of ${total}`}>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-8 rounded-[3px] sm:w-11 ${
                i < step - 1 ? "bg-sf-ink" : i === step - 1 ? "bg-sf-blue" : "bg-sf-line"
              }`}
            />
          ))}
        </div>
        <span className="text-[14px] font-semibold sm:text-[15px]">
          {step}
          <span className="text-sf-faint"> / {total}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2" aria-label={`Step ${step} of ${total}`}>
      <p className="text-[13px] font-semibold tracking-[0.02em] text-sf-muted">
        Step {step} of {total}
      </p>
      {bar}
    </div>
  );
}

/** Ink pill + lime arrow coin. lg = landing (64px), md = questionnaire (56px), sm = Results downloads (48px). */
export function PrimaryButton({
  children,
  size = "md",
  icon,
  className = "",
  ...rest
}: Btn & { size?: "sm" | "md" | "lg"; icon?: ReactNode }) {
  const lg = size === "lg";
  const sm = size === "sm";
  return (
    <button
      type="button"
      {...rest}
      className={`group inline-flex items-center rounded-full bg-sf-ink font-semibold text-white transition-transform duration-150 ease-premium active:scale-[0.97] ${
        lg ? "h-16 gap-5 pl-[30px] pr-2 text-lg" : sm ? "h-12 gap-3.5 pl-[22px] pr-[5px] text-[15px]" : "h-14 gap-4 pl-[26px] pr-1.5 text-[17px]"
      } ${focusRing} ${className}`}
    >
      {children}
      <LimeIcon size={size}>{icon ?? <ArrowRightIcon />}</LimeIcon>
    </button>
  );
}

/** Warm-gray pill. Results header uses size "sm" (44px), identity board shows "md" (48px). */
export function SecondaryButton({ children, size = "md", className = "", ...rest }: Btn & { size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center rounded-full bg-sf-chip font-semibold text-sf-ink ${
        size === "sm" ? "h-11 px-[18px] text-[15px]" : "h-12 px-[22px] text-base"
      } ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextButton({ children, className = "", ...rest }: Btn) {
  return (
    <button
      type="button"
      {...rest}
      className={`text-base font-medium text-sf-muted hover:text-sf-ink ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

/** Model / version choice. Selected = ultramarine. "ghost" = the trailing "Other" option. */
export function ModelPill({
  children,
  selected,
  ghost,
  className = "",
  ...rest
}: Btn & { selected?: boolean; ghost?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={`flex h-11 items-center rounded-full px-5 text-base ${
        selected
          ? "bg-sf-blue font-semibold text-white"
          : ghost
            ? "font-medium text-sf-muted hover:text-sf-ink"
            : "bg-sf-chip font-medium text-sf-ink"
      } ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

const RING_OFF = "shadow-[0_0_0_1px_#ECEAE4,0_8px_20px_-10px_rgba(11,11,12,.16)]";
const RING_HOVER =
  "group-hover:-translate-y-[3px] group-hover:shadow-[0_0_0_1px_#D6D3CA,0_16px_30px_-12px_rgba(11,11,12,.22)]";
const RING_ON = "shadow-[0_0_0_2px_#3A2EFF,0_14px_30px_-12px_rgba(58,46,255,.45)]";

/** Questionnaire tool option: 88px logo coin, no box. States: rest / hover / picked. */
export function ToolOption({
  tool,
  selected,
  unavailable = false,
  onClick,
}: {
  tool: Tool;
  selected: boolean;
  /** Stack is full and this tool isn't picked: still clickable (shows the limit notice) but dimmed. */
  unavailable?: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const coinRef = useRef<HTMLSpanElement>(null);
  function press(event: MouseEvent<HTMLButtonElement>) {
    const coin = coinRef.current;
    if (coin && !unavailable && !reducedMotion()) {
      void play(coin, [{ transform: "scale(1)" }, { transform: "scale(0.9)", offset: 0.3 }, { transform: "scale(1.05)", offset: 0.7 }, { transform: "scale(1)" }], {
        duration: DURATION.press,
        easing: EASE.out,
      });
    }
    onClick(event);
  }
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={unavailable || undefined}
      title={unavailable ? "Stack full — remove a tool first" : undefined}
      onClick={press}
      className={`group flex w-full max-w-[120px] flex-col items-center gap-3.5 rounded-2xl ${unavailable ? "opacity-45" : ""} ${focusRing}`}
    >
      <span
        ref={coinRef}
        className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white transition duration-200 ease-premium ${
          selected ? RING_ON : `${RING_OFF} ${RING_HOVER}`
        }`}
      >
        <ToolLogo tool={tool} size="40px" monogramSize="34px" />
        {selected && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-[26px] w-[26px] animate-check-in items-center justify-center rounded-full border-[3px] border-white bg-sf-lime text-xs font-extrabold text-sf-ink"
          >
            ✓
          </span>
        )}
      </span>
      <span
        className={`max-w-full text-balance text-center text-base leading-tight transition-colors duration-200 ${selected ? "font-semibold text-sf-blue" : "font-medium text-sf-ink"}`}
      >
        {tool.name}
      </span>
    </button>
  );
}

export function MoreToolsOption({
  onClick,
  expanded,
  controls,
}: {
  onClick?: () => void;
  expanded?: boolean;
  /** Id of the picker this option opens. */
  controls?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={expanded ? controls : undefined}
      className={`flex w-full max-w-[120px] flex-col items-center gap-3.5 rounded-2xl ${focusRing}`}
    >
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[1.5px] border-dashed border-[#CFCBC1] font-display text-[34px] font-light text-sf-muted">
        +
      </span>
      <span className="whitespace-nowrap text-base font-medium text-sf-muted">More tools</span>
    </button>
  );
}

export type ArtTheme = "light" | "dark";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

/** Small segmented radio group (Results module headers): arrow keys move and select. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-none rounded-full bg-[#F1EFEA] p-[3px]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
              e.preventDefault();
              const i = options.findIndex((x) => x.value === value);
              const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : options.length - 1;
              const next = (i + step) % options.length;
              onChange(options[next].value);
              (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
            }}
            className={`flex h-8 items-center gap-[7px] rounded-full text-[13px] ${o.icon ? "pl-2 pr-[13px]" : "px-[13px]"} ${
              on ? "bg-white font-semibold text-sf-ink shadow-[0_1px_3px_rgba(11,11,12,.14)]" : "font-medium text-sf-muted hover:text-sf-ink"
            } ${focusRing}`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const Swatch = ({ color, ring }: { color: string; ring: string }) => (
  <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full" style={{ background: color, boxShadow: `inset 0 0 0 1px ${ring}` }} />
);

const THEME_OPTIONS: SegmentOption<ArtTheme>[] = [
  { value: "light", label: "Light", icon: <Swatch color="#FFFFFF" ring="#CFCBC1" /> },
  { value: "dark", label: "Dark", icon: <Swatch color="#0B0B0C" ring="#0B0B0C" /> },
];

/** Results: Light / Dark switch in a format module's header. */
export function ThemeSwitch({ value, onChange, label }: { value: ArtTheme; onChange: (t: ArtTheme) => void; label: string }) {
  return <Segmented value={value} options={THEME_OPTIONS} onChange={onChange} label={label} />;
}

/** Quiet secondary action: plain text, optional platform icon. */
export function TextAction({ children, icon, className = "", ...rest }: Btn & { icon?: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      className={`flex items-center gap-[7px] whitespace-nowrap rounded-sm text-sm font-medium text-sf-body hover:text-sf-ink disabled:cursor-default disabled:opacity-50 ${focusRing} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <span
    aria-hidden="true"
    className="flex flex-none items-center justify-center rounded-[4px] bg-sf-linkedin font-bold leading-none text-white"
    style={{ width: size, height: size, fontSize: size * 0.52 }}
  >
    in
  </span>
);

export const XIcon = ({ size = 16 }: { size?: number }) => (
  <span aria-hidden="true" className="flex flex-none items-center justify-center rounded-full bg-sf-ink" style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" style={{ width: size * 0.45, height: size * 0.45 }}>
      <path fill="#FFFFFF" d={siX.path} />
    </svg>
  </span>
);
