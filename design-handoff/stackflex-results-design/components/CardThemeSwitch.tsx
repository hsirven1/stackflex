import type { CardTheme } from "../lib/types";

/** Dark / Light segmented switch, placed directly above the card. Same pattern as the existing Results ThemeSwitch. */
export function CardThemeSwitch({ value, onChange }: { value: CardTheme; onChange: (t: CardTheme) => void }) {
  const opts: { v: CardTheme; label: string; swatch: string; ring: string }[] = [
    { v: "dark", label: "Dark", swatch: "#0B0B0C", ring: "#0B0B0C" },
    { v: "light", label: "Light", swatch: "#FFFFFF", ring: "#CFCBC1" },
  ];
  return (
    <div role="radiogroup" aria-label="Card theme" className="flex rounded-full bg-[#F1EFEA] p-[3px]">
      {opts.map((o) => {
        const on = o.v === value;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.v)}
            className={`flex h-[30px] items-center gap-[7px] rounded-full pl-2 pr-3.5 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#3A2EFF] ${
              on ? "bg-white font-semibold text-[#0B0B0C] shadow-[0_1px_3px_rgba(11,11,12,.14)]" : "font-medium text-[#6F6D66] hover:text-[#0B0B0C]"
            }`}
          >
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: o.swatch, boxShadow: `inset 0 0 0 1px ${o.ring}` }} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
