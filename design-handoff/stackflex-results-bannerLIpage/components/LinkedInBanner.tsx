/* eslint-disable @next/next/no-img-element */
import { forwardRef, type CSSProperties } from "react";
import type { AIProfile, CardTheme, CardTool } from "../lib/types";
import { STYLE_TOKENS, toStyleId } from "../lib/working-styles";
import { StyleSymbol } from "./StyleSymbol";
import { StackFlexMark } from "./StackFlexMark";

// Banner: the tool stack is the hero; the working style is a small header. No name/role.
// Authored on a 1000-wide grid (1000×250) in container units: b(54) = 5.4cqw.
// Renders identically at 700px on the page and at 1584×396 for export.
const b = (px: number) => `${(px / 10).toFixed(3)}cqw`;
const layer: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };
const FOIL = "conic-gradient(from 200deg at 62% 40%, rgba(255,150,170,0), rgba(255,200,110,.7), rgba(130,235,185,.62), rgba(110,180,255,.7), rgba(195,150,255,.7), rgba(255,150,170,0))";
const MAX_CELLS = 6;

export const BANNER_EXPORT = { width: 1584, height: 396 } as const;

export type LinkedInBannerProps = {
  profile: AIProfile;
  theme?: CardTheme;        // default "dark"; follow the card's theme
  width?: number | string;  // default "100%" (always 4:1)
  animate?: boolean;        // secondary reveal (sfr-banner-in, 450ms after the card). Default false.
  className?: string;
};

/**
 * LinkedIn background photo generated from the same AIProfile as the card.
 * Content lives in the block x 33%→96.4%; the bottom-left is left decorative because the profile photo covers it.
 * The ref points at the 1584:396 element for PNG export.
 */
export const LinkedInBanner = forwardRef<HTMLDivElement, LinkedInBannerProps>(function LinkedInBanner(
  { profile, theme = "dark", width = "100%", animate = false, className = "" },
  ref,
) {
  const dark = theme === "dark";
  const styleId = toStyleId(profile.workingStyle.id);
  const tk = STYLE_TOKENS[styleId];
  const { title, tagline } = profile.workingStyle;

  return (
    <div style={{ width, containerType: "inline-size" }} className={className}>
      <div
        ref={ref}
        data-sf-banner=""
        className={animate ? "sfr-banner-in" : ""}
        style={{
          position: "relative", width: "100%", aspectRatio: "1584 / 396", overflow: "hidden",
          color: dark ? "#FFFFFF" : "#0B0B0C",
          fontFamily: "var(--font-sans), 'Funnel Sans', system-ui, sans-serif",
          background: dark
            ? "radial-gradient(70% 170% at 66% 0%, #26213F 0%, #131219 55%, #0B0B0E 100%)"
            : "linear-gradient(160deg, #FFFFFF 0%, #F8F6F2 55%, #F0ECF6 100%)",
        }}
      >
        <div style={{ ...layer, background: FOIL, mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.18 : 0.3 }} />
        {dark && <div style={{ ...layer, inset: "auto", left: b(-40), top: b(-100), width: b(400), height: b(400), borderRadius: "50%", background: `radial-gradient(closest-side, ${tk.c2}30, transparent)` }} />}
        <div style={{ ...layer, backgroundImage: `radial-gradient(${dark ? "rgba(255,255,255,.16)" : "rgba(11,11,12,.12)"} 1px, transparent 1.2px)`, backgroundSize: `${b(14)} ${b(14)}`, WebkitMaskImage: "radial-gradient(30% 90% at 14% 35%, #000, transparent)", maskImage: "radial-gradient(30% 90% at 14% 35%, #000, transparent)" }} />
        <div style={{ ...layer, inset: "auto", left: b(235), top: b(-15), width: b(300), height: b(300), borderRadius: "50%", background: `radial-gradient(closest-side, ${tk.c1}${dark ? "66" : "30"}, transparent)` }} />
        <div style={{ ...layer, background: `linear-gradient(105deg, transparent 52%, rgba(140,190,255,${dark ? ".05" : ".18"}) 60%, rgba(255,255,255,${dark ? ".14" : ".7"}) 65%, rgba(255,190,150,${dark ? ".05" : ".18"}) 70%, transparent 78%)` }} />

        <div style={{ position: "absolute", left: "33%", right: b(36), top: b(28), bottom: b(28), display: "flex", flexDirection: "column" }}>
          {/* Working style: small header. The stack below is the hero. Name/role intentionally omitted (LinkedIn shows them). */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: b(20) }}>
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: b(12) }}>
              <div style={{ width: b(42), height: b(42), flex: "none", filter: `drop-shadow(0 ${b(4)} ${b(8)} ${dark ? "rgba(0,0,0,.45)" : "rgba(40,30,120,.22)"})` }}>
                <StyleSymbol style={styleId} dark={dark} />
              </div>
              <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: b(3.5) }}>
                <h2 style={{
                  margin: 0, paddingBottom: b(1), font: `500 ${b(26)}/1 var(--font-display), 'Funnel Display', sans-serif`, letterSpacing: "-0.04em",
                  background: dark ? "linear-gradient(180deg, #FFFFFF 30%, #CFC8FF 70%, #9FE3D0)" : `linear-gradient(180deg, #0B0B0C 35%, ${tk.lightTitleEnd} 100%)`,
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}>{title}</h2>
                <p style={{ margin: 0, fontSize: b(12.5), lineHeight: 1.2, color: dark ? "#C9C6D6" : "#55534D", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tagline}</p>
              </div>
            </div>
            <span style={{ flex: "none", display: "flex", alignItems: "center", gap: b(6), fontSize: b(11.5), fontWeight: 600, color: dark ? "#E7E4F5" : "#55534D" }}>
              <StackFlexMark size={b(13)} outline={dark ? "#131219" : "#FFFFFF"} />
              StackFlex
            </span>
          </div>

          <div style={{ marginTop: "auto", paddingTop: b(14), display: "flex", flexDirection: "column", gap: b(10) }}>
            <span style={{ fontSize: b(10.5), lineHeight: 1, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: dark ? "#A8A3C7" : "#8C897F" }}>My AI tools</span>
            <ToolGrid tools={profile.tools} dark={dark} />
          </div>
        </div>
        {animate && <div aria-hidden className="sfr-sheen sfr-sheen-late" />}
      </div>
    </div>
  );
});

/** Same cell language as the card's ToolsBlock (accent wash, ring, ✦ Main), laid out 3×2. */
function ToolGrid({ tools, dark }: { tools: CardTool[]; dark: boolean }) {
  const over = tools.length > MAX_CELLS;
  const shown = over ? tools.slice(0, MAX_CELLS - 1) : tools;
  const more = tools.length - shown.length;
  const cell: CSSProperties = { minWidth: 0, height: b(56), boxSizing: "border-box", borderRadius: b(14), display: "flex", alignItems: "center" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: b(8) }}>
      {shown.map((t, i) => {
        const a = /^#[0-9a-f]{6}$/i.test(t.accent ?? "") ? t.accent! : "#A8A59C";
        const main = i === 0;
        return (
          <div key={t.id} style={{
            ...cell, gridColumn: tools.length === 1 ? "span 2" : undefined, padding: `0 ${b(12)} 0 ${b(9)}`, gap: b(10),
            background: dark ? `linear-gradient(90deg, ${a}2E, rgba(255,255,255,.04) 60%)` : `linear-gradient(90deg, ${a}26, rgba(255,255,255,.85) 60%)`,
            boxShadow: `inset 0 0 0 1px ${main ? a + "88" : dark ? "rgba(255,255,255,.1)" : "#ECEAE4"}`,
          }}>
            <span style={{ position: "relative", width: b(36), height: b(36), flex: "none", borderRadius: "50%", background: "#FFFFFF", boxShadow: `0 0 0 ${b(2.5)} ${a}${dark ? "C0" : "99"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {t.logo
                ? <img src={t.logo} alt="" crossOrigin="anonymous" style={{ width: "54%", height: "54%", objectFit: "contain" }} />
                : <span style={{ font: `600 ${b(14)}/1 var(--font-display), 'Funnel Display', sans-serif`, color: "#0B0B0C" }}>{t.monogram ?? t.name.charAt(0)}</span>}
              {main && (
                <span aria-label="Main tool" style={{ position: "absolute", right: b(-4), top: b(-4), width: b(14), height: b(14), borderRadius: "50%", background: "#3A2EFF", color: "#FFFFFF", boxShadow: `0 0 0 1.5px ${dark ? "#16151E" : "#FFFFFF"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: b(9), lineHeight: 1 }}>✦</span>
              )}
            </span>
            <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: b(1.5) }}>
              <span style={{ maxWidth: "100%", font: `600 ${b(16.5)}/1.1 var(--font-display), 'Funnel Display', sans-serif`, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              {t.model && <span style={{ maxWidth: "100%", fontSize: b(13), lineHeight: 1.15, fontWeight: 500, color: dark ? "#A8A3C7" : "#6F6D66", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.model}</span>}
            </span>
          </div>
        );
      })}
      {more > 0 && (
        <div style={{ ...cell, justifyContent: "center", fontSize: b(14), fontWeight: 600, color: dark ? "#C9C6D6" : "#55534D", boxShadow: `inset 0 0 0 1px ${dark ? "rgba(255,255,255,.1)" : "#ECEAE4"}` }}>
          +{more} more
        </div>
      )}
    </div>
  );
}
