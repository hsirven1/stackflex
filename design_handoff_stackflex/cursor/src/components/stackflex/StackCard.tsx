/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { cardColors, logoFor, type Tool } from "@/lib/stackflex/tools";

// One card component for every size. Internals are in container-query units (cqw),
// so the card scales from a 26px share thumbnail to a 400px close-up with identical proportions.
// Values derive from the Results screen (main card 316px, standard card 152px).

export type CardVariant = "main" | "standard" | "compact" | "icon";
export type CardTheme = "light" | "dark";

export const HOLO = {
  conicLight:
    "conic-gradient(from 210deg at 62% 38%, rgba(255,160,170,0), rgba(255,206,120,.55), rgba(140,235,190,.5), rgba(120,190,255,.55), rgba(200,160,255,.55), rgba(255,160,170,0))",
  conicDark:
    "conic-gradient(from 210deg at 62% 38%, rgba(255,160,170,0), rgba(255,206,120,.5), rgba(140,235,190,.45), rgba(120,190,255,.5), rgba(200,160,255,.5), rgba(255,160,170,0))",
  streakMainLight:
    "linear-gradient(118deg, transparent 26%, rgba(140,190,255,.2) 37%, rgba(255,255,255,.75) 43%, rgba(255,190,150,.2) 49%, transparent 60%)",
  streakSmallLight:
    "linear-gradient(118deg, transparent 32%, rgba(140,190,255,.15) 41%, rgba(255,255,255,.6) 46%, rgba(255,180,210,.15) 51%, transparent 60%)",
  streakMainDark: "linear-gradient(118deg, transparent 30%, rgba(255,255,255,.28) 44%, transparent 58%)",
  streakSmallDark:
    "linear-gradient(118deg, transparent 32%, rgba(140,190,255,.25) 41%, rgba(255,255,255,.4) 46%, rgba(255,180,210,.25) 51%, transparent 60%)",
};

const SPEC = {
  main:     { radius: "10cqw",   coinW: "40%", coinTop: "45%", ring: "2.2cqw", logo: "50%", mono: "16cqw" },
  standard: { radius: "13.2cqw", coinW: "38%", coinTop: "44%", ring: "2.6cqw", logo: "50%", mono: "16cqw" },
  compact:  { radius: "21cqw",   coinW: "44%", coinTop: "40%", ring: "4.5cqw", logo: "54%", mono: "21cqw" },
  icon:     { radius: "22cqw",   coinW: "52%", coinTop: "50%", ring: "4cqw",   logo: "52%", mono: "26cqw" },
} as const;

type Props = {
  tool: Tool;
  variant?: CardVariant;
  theme?: CardTheme;
  showCategory?: boolean;
  showVersion?: boolean;
  showMainLabel?: boolean;
  highlight?: boolean; // newest pick in the questionnaire tray
  fill?: boolean;      // stretch to grid area instead of forcing 1:1 (used for the 2×2 main cell)
  className?: string;
};

export function StackCard({
  tool,
  variant = "standard",
  theme = "light",
  showCategory = variant === "main" || variant === "standard",
  showVersion = true,
  showMainLabel = variant === "main",
  highlight = false,
  fill = false,
  className = "",
}: Props) {
  const s = SPEC[variant];
  const c = cardColors(tool.aura);
  const dark = theme === "dark";
  const isMain = variant === "main";
  const logo = logoFor(tool);
  const base = dark ? "#121216" : "#FFFFFF";

  const card: CSSProperties = {
    borderRadius: s.radius,
    background: `linear-gradient(180deg, ${base} 30%, ${dark ? c.tintDark : c.tint}), ${base}`,
    border: `1px solid ${dark ? "#23232A" : "#ECEAE4"}`,
    boxShadow: isMain && !dark ? "0 24px 48px -30px rgba(11,11,12,.32)" : undefined,
    outline: highlight ? "2px solid #3A2EFF" : undefined,
    outlineOffset: highlight ? 3 : undefined,
    color: dark ? "#FFFFFF" : "#0B0B0C",
  };

  const ringColor = dark ? c.haloDark : c.halo;
  const coinShadow =
    dark || variant === "compact" || variant === "icon"
      ? `0 0 0 ${s.ring} ${ringColor}`
      : isMain
        ? `0 0 0 ${s.ring} ${ringColor}, 0 18px 36px -14px rgba(11,11,12,.25)`
        : `0 0 0 ${s.ring} ${ringColor}, 0 8px 16px -8px rgba(11,11,12,.2)`;

  const layers: string[] =
    variant === "icon"
      ? []
      : isMain
        ? dark ? [HOLO.conicDark, HOLO.streakMainDark] : [HOLO.conicLight, HOLO.streakMainLight]
        : [dark ? HOLO.streakSmallDark : HOLO.streakSmallLight];

  const pill: CSSProperties = isMain
    ? { left: "5cqw", top: "4.4cqw", fontSize: "4.2cqw", padding: "0.95cqw 2.5cqw" }
    : { left: "5.9cqw", top: "4.6cqw", fontSize: "7.1cqw", padding: "2cqw 5.3cqw" };

  return (
    <div className={`relative min-w-0 ${fill ? "" : "aspect-square"} ${className}`} style={{ containerType: "inline-size" }}>
      <div className="absolute inset-0 overflow-hidden" style={card}>
        {layers.map((bg, i) => (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: bg,
              mixBlendMode: i === 0 && isMain ? (dark ? "screen" : "multiply") : undefined,
              opacity: i === 0 && isMain ? (dark ? 0.6 : 0.42) : undefined,
            }}
          />
        ))}

        {showCategory && (
          <span
            className="absolute rounded-full font-semibold uppercase leading-none tracking-[0.07em] text-sf-ink"
            style={{ ...pill, background: "rgba(255,255,255,.85)", boxShadow: "0 0 0 1px rgba(11,11,12,.06)" }}
          >
            {tool.category}
          </span>
        )}
        {showMainLabel && isMain && (
          <span
            className="absolute font-semibold leading-none"
            style={{ right: "6.3cqw", top: "5.7cqw", fontSize: "4.4cqw", color: dark ? "#D7FF3A" : "#3A2EFF" }}
          >
            Main
          </span>
        )}

        <div
          className="absolute left-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white"
          style={{ width: s.coinW, top: s.coinTop, boxShadow: coinShadow }}
        >
          {logo ? (
            <img src={logo} alt={tool.name} style={{ width: s.logo, height: s.logo }} className="object-contain" />
          ) : (
            <span className="font-display font-medium leading-none tracking-[-0.04em] text-sf-ink" style={{ fontSize: s.mono }}>
              {tool.monogram ?? tool.name[0]}
            </span>
          )}
        </div>

        {isMain && (
          <div
            className="absolute flex items-baseline justify-between"
            style={{ left: "6.3cqw", right: "6.3cqw", bottom: "5.7cqw", gap: "2.5cqw" }}
          >
            <span className="whitespace-nowrap font-display font-semibold leading-none tracking-[-0.035em]" style={{ fontSize: "10.8cqw" }}>
              {tool.name}
            </span>
            {showVersion && tool.version && (
              <span className="whitespace-nowrap font-medium" style={{ fontSize: "6.6cqw", color: dark ? "#FFFFFF" : "#2A2925" }}>
                {tool.version}
              </span>
            )}
          </div>
        )}

        {variant === "standard" && (
          <div
            className="absolute flex flex-col items-start"
            style={{ left: "8.6cqw", right: "8.6cqw", bottom: "7.2cqw", gap: "2cqw" }}
          >
            <span className="max-w-full truncate font-display font-semibold leading-none tracking-[-0.02em]" style={{ fontSize: "9.9cqw" }}>
              {tool.name}
            </span>
            {showVersion && tool.version && (
              <span className="font-medium leading-none" style={{ fontSize: "9.2cqw", color: dark ? "#FFFFFF" : "#2A2925" }}>
                {tool.version}
              </span>
            )}
          </div>
        )}

        {variant === "compact" && (
          <span
            className="absolute inset-x-[5cqw] truncate text-center font-display font-semibold leading-none"
            style={{ bottom: "9cqw", fontSize: "15cqw" }}
          >
            {tool.name}
          </span>
        )}
      </div>
    </div>
  );
}
