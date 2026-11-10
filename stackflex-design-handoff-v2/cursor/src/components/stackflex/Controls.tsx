/* eslint-disable @next/next/no-img-element */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { logoFor, type Tool } from "@/lib/stackflex/tools";

// Focus ring is not in the mocks; it is required for accessibility. Keep it this subtle.
const focus = "outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2";

type Btn = ButtonHTMLAttributes<HTMLButtonElement>;

/** Ink pill + lime arrow coin. lg = landing (64px), md = questionnaire (56px). */
export function PrimaryButton({ children, size = "md", icon = "→", className = "", ...rest }: Btn & { size?: "sm" | "md" | "lg"; icon?: ReactNode }) {
  const lg = size === "lg";
  const sm = size === "sm";
  return (
    <button
      type="button"
      {...rest}
      className={`group inline-flex items-center rounded-full bg-sf-ink font-semibold text-white ${
        lg ? "h-16 gap-5 pl-[30px] pr-2 text-lg" : sm ? "h-12 gap-3.5 pl-[22px] pr-[5px] text-[15px]" : "h-14 gap-4 pl-[26px] pr-1.5 text-[17px]"
      } ${focus} ${className}`}
    >
      {children}
      <span
        aria-hidden
        className={`flex items-center justify-center rounded-full bg-sf-lime text-sf-ink transition-transform duration-150 ease-out group-hover:translate-x-0.5 ${
          lg ? "h-12 w-12 text-xl" : sm ? "h-[38px] w-[38px] text-base" : "h-11 w-11 text-lg"
        }`}
      >
        {icon}
      </span>
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
      } ${focus} ${className}`}
    >
      {children}
    </button>
  );
}

export function TextButton({ children, className = "", ...rest }: Btn) {
  return (
    <button type="button" {...rest} className={`text-base font-medium text-sf-muted hover:text-sf-ink ${focus} ${className}`}>
      {children}
    </button>
  );
}

/** Model / version choice. Selected = ultramarine. "ghost" = the trailing "Other" option. */
export function ModelPill({ children, selected, ghost, ...rest }: Btn & { selected?: boolean; ghost?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      {...rest}
      className={`flex h-11 items-center rounded-full px-5 text-base ${
        selected ? "bg-sf-blue font-semibold text-white" : ghost ? "font-medium text-sf-muted" : "bg-sf-chip font-medium text-sf-ink"
      } ${focus}`}
    >
      {children}
    </button>
  );
}

/** 6 bars, 44×6, gap 6. Done = ink, current = ultramarine, upcoming = line. */
export function StepIndicator({ step, total = 6 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-3.5" aria-label={`Step ${step} of ${total}`}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-11 rounded-[3px] ${i < step - 1 ? "bg-sf-ink" : i === step - 1 ? "bg-sf-blue" : "bg-sf-line"}`}
          />
        ))}
      </div>
      <span className="text-[15px] font-semibold">
        {step}
        <span className="text-sf-faint"> / {total}</span>
      </span>
    </div>
  );
}

const RING_OFF = "shadow-[0_0_0_1px_#ECEAE4,0_8px_20px_-10px_rgba(11,11,12,.16)]";
const RING_HOVER = "group-hover:-translate-y-[3px] group-hover:shadow-[0_0_0_1px_#D6D3CA,0_16px_30px_-12px_rgba(11,11,12,.22)]";
const RING_ON = "shadow-[0_0_0_2px_#3A2EFF,0_14px_30px_-12px_rgba(58,46,255,.45)]";

/** Questionnaire tool option: 88px logo coin, no box. States: rest / hover / picked. */
export function ToolOption({ tool, selected, onClick }: { tool: Tool; selected: boolean; onClick: () => void }) {
  const logo = logoFor(tool);
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`group flex w-[120px] flex-col items-center gap-3.5 ${focus} rounded-2xl`}>
      <span
        className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white transition duration-150 ease-out ${
          selected ? RING_ON : `${RING_OFF} ${RING_HOVER}`
        }`}
      >
        {logo ? (
          <img src={logo} alt="" className="h-10 w-10 object-contain" />
        ) : (
          <span className="font-display text-[34px] font-medium tracking-[-0.04em]">{tool.monogram}</span>
        )}
        {selected && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border-[3px] border-white bg-sf-lime text-xs font-extrabold text-sf-ink">
            ✓
          </span>
        )}
      </span>
      <span className={`whitespace-nowrap text-base ${selected ? "font-semibold text-sf-blue" : "font-medium text-sf-ink"}`}>{tool.name}</span>
    </button>
  );
}

export function MoreToolsOption({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-[120px] flex-col items-center gap-3.5 ${focus} rounded-2xl`}>
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[1.5px] border-dashed border-[#CFCBC1] font-display text-[34px] font-light text-sf-muted">
        +
      </span>
      <span className="whitespace-nowrap text-base font-medium text-sf-muted">More tools</span>
    </button>
  );
}

export type ArtTheme = "light" | "dark" | "mono";

/** Results: Light / Dark / Mono segmented switch, always placed right above or beside the preview it controls. */
export function ThemeSwitch({ value, onChange }: { value: ArtTheme; onChange: (t: ArtTheme) => void }) {
  const opts: { v: ArtTheme; label: string; swatch: string; ring: string }[] = [
    { v: "light", label: "Light", swatch: "#FFFFFF", ring: "#CFCBC1" },
    { v: "dark", label: "Dark", swatch: "#0B0B0C", ring: "#0B0B0C" },
    { v: "mono", label: "Mono", swatch: "linear-gradient(90deg,#FFFFFF 50%,#0B0B0C 50%)", ring: "#0B0B0C" },
  ];
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[13px] font-semibold text-sf-muted">Theme</span>
      <div role="radiogroup" aria-label="Theme" className="flex rounded-full bg-[#F1EFEA] p-[3px]">
        {opts.map((o) => {
          const on = o.v === value;
          return (
            <button key={o.v} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.v)}
              className={`flex h-8 items-center gap-[7px] rounded-full pl-2 pr-[13px] text-[13px] ${on ? "bg-white font-semibold text-sf-ink shadow-[0_1px_3px_rgba(11,11,12,.14)]" : "font-medium text-sf-muted"} ${focus}`}>
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: o.swatch, boxShadow: `inset 0 0 0 1px ${o.ring}` }} />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Quiet secondary action: plain text, optional platform icon. */
export function TextAction({ children, icon, className = "", ...rest }: Btn & { icon?: ReactNode }) {
  return (
    <button type="button" {...rest} className={`flex items-center gap-[7px] whitespace-nowrap text-sm font-medium text-sf-body hover:text-sf-ink ${focus} ${className}`}>
      {icon}
      {children}
    </button>
  );
}

export const LinkedInIcon = ({ size = 16 }: { size?: number }) => (
  <span aria-hidden className="flex flex-none items-center justify-center rounded-[4px] bg-[#0A66C2] font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.52 }}>in</span>
);
export const XIcon = ({ size = 16 }: { size?: number }) => (
  <span aria-hidden className="flex flex-none items-center justify-center rounded-full bg-sf-ink" style={{ width: size, height: size }}>
    <img src="https://cdn.simpleicons.org/x/ffffff" alt="" style={{ width: size * 0.45, height: size * 0.45 }} />
  </span>
);
