/* eslint-disable @next/next/no-img-element */
import { forwardRef, type CSSProperties } from "react";
import type { AIProfile, CardLook, CardTheme, CardTool } from "../lib/types";
import { STYLE_TOKENS, toStyleId } from "../lib/working-styles";
import { StyleSymbol } from "./StyleSymbol";
import { StackFlexMark } from "./StackFlexMark";

// Every dimension is authored at 432×540 and expressed in container units, so the card renders identically
// at 300px in a gallery, 432px on the page and 1080×1350 for export.
const u = (px: number) => `${(px / 4.32).toFixed(3)}cqw`;

const FOIL = "conic-gradient(from 210deg at 62% 38%, rgba(255,150,170,0), rgba(255,200,110,.7), rgba(130,235,185,.62), rgba(110,180,255,.7), rgba(195,150,255,.7), rgba(255,150,170,0))";
const streak = (o: number) =>
  `linear-gradient(118deg, transparent 30%, rgba(140,190,255,${(o * 0.3).toFixed(3)}) 40%, rgba(255,255,255,${o}) 46%, rgba(255,190,150,${(o * 0.3).toFixed(3)}) 52%, transparent 62%)`;
const layer: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };
const MAX_CELLS = 6;

export type AIProfileCardProps = {
  profile: AIProfile;
  theme?: CardTheme;          // default "dark"
  look?: CardLook;            // default "holo"
  width?: number | string;    // default "100%" (the card is always 4:5)
  elevated?: boolean;         // outer drop shadow, on-page only. Default true. Set false for export.
  animate?: boolean;          // reveal animation (requires styles/profile-results.css). Default false.
  className?: string;
};

/** The shareable AI working-style card. Pure presentation; the ref points at the 4:5 card element for PNG export. */
export const AIProfileCard = forwardRef<HTMLDivElement, AIProfileCardProps>(function AIProfileCard(
  { profile, theme = "dark", look = "holo", width = "100%", elevated = true, animate = false, className = "" },
  ref,
) {
  const dark = theme === "dark";
  const styleId = toStyleId(profile.workingStyle.id);
  const tk = STYLE_TOKENS[styleId];
  const { title, tagline } = profile.workingStyle;
  const tagSize = tagline.length > 80 ? 13 : 15;

  const shadow = elevated
    ? `0 0 0 1px ${dark ? "#2A2733" : "#E6E3DC"}, 0 40px 80px -40px ${dark ? "rgba(30,20,90,.7)" : "rgba(40,30,120,.4)"}`
    : `0 0 0 1px ${dark ? "#2A2733" : "#E6E3DC"}`;

  const titleGradient = dark
    ? "linear-gradient(180deg, #FFFFFF 30%, #CFC8FF 70%, #9FE3D0)"
    : `linear-gradient(180deg, #0B0B0C 35%, ${tk.lightTitleEnd} 100%)`;

  const rise = animate ? "sfr-rise" : "";

  const tools = <ToolsBlock tools={profile.tools} dark={dark} />;
  const footer = <Footer dark={dark} />;

  return (
    <div style={{ width, containerType: "inline-size" }} className={className}>
      <div
        ref={ref}
        className={animate ? "sfr-card-in" : ""}
        data-sf-card=""
        style={{
          position: "relative", width: "100%", aspectRatio: "4 / 5", overflow: "hidden", boxSizing: "border-box",
          borderRadius: u(look === "holo" ? 30 : 28),
          color: dark ? "#FFFFFF" : "#0B0B0C",
          fontFamily: "var(--font-sans), 'Funnel Sans', system-ui, sans-serif",
          boxShadow: shadow,
          background: look === "holo"
            ? dark
              ? "radial-gradient(120% 80% at 50% 0%, #24203A 0%, #121218 60%, #0B0B0E 100%)"
              : "radial-gradient(120% 80% at 50% 0%, #FFFFFF 0%, #F8F6F2 60%, #F1EEE8 100%)"
            : dark
              ? "radial-gradient(120% 70% at 50% 0%, #211D33 0%, #121218 55%, #0B0B0E 100%)"
              : "linear-gradient(165deg, #FFFFFF 0%, #F8F6F2 60%, #F1EEE8 100%)",
        }}
      >
        {look === "holo" ? (
          <>
            <div style={{ ...layer, background: FOIL, mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.32 : 0.42 }} />
            <div style={{ ...layer, inset: u(10), borderRadius: u(22), border: `1px solid ${dark ? "rgba(255,255,255,.12)" : "rgba(11,11,12,.08)"}` }} />
            <div style={{ ...layer, inset: "auto", left: "50%", top: u(118), width: u(280), height: u(280), transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(closest-side, ${tk.c1}${dark ? "70" : "38"}, transparent)` }} />
            <div style={{ ...layer, background: streak(dark ? 0.2 : 0.7) }} />
            <div style={{ position: "relative", height: "100%", boxSizing: "border-box", padding: `${u(34)} ${u(28)} ${u(24)}`, display: "flex", flexDirection: "column" }}>
              <div style={{ alignSelf: "center", width: u(148), height: u(148), filter: `drop-shadow(0 ${u(12)} ${u(22)} ${dark ? "rgba(0,0,0,.45)" : "rgba(40,30,120,.22)"})` }}>
                <StyleSymbol style={styleId} dark={dark} />
              </div>
              <h2 className={rise} style={{ margin: `${u(20)} 0 0`, textAlign: "center", font: `500 ${u(42)}/1 var(--font-display), 'Funnel Display', sans-serif`, letterSpacing: "-0.045em", background: titleGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                {title}
              </h2>
              <p className={rise} style={{ margin: `${u(9)} auto 0`, maxWidth: u(340), textAlign: "center", fontSize: u(tagSize), lineHeight: 1.38, color: dark ? "#C9C6D6" : "#55534D", textWrap: "balance" as CSSProperties["textWrap"] }}>
                {tagline}
              </p>
              <div style={{ flex: 1, minHeight: u(12) }} />
              {tools}
              <div style={{ marginTop: u(12) }}>{footer}</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ ...layer, background: streak(dark ? 0.12 : 0.35) }} />
            <div style={{ position: "relative", height: "100%", boxSizing: "border-box", padding: u(14), display: "flex", flexDirection: "column" }}>
              <div style={{
                position: "relative", height: u(200), flex: "none", borderRadius: u(20), overflow: "hidden",
                boxShadow: `inset 0 0 0 1px ${dark ? "rgba(255,255,255,.08)" : "rgba(11,11,12,.04)"}`,
                background: dark
                  ? `radial-gradient(90% 80% at 30% 20%, ${tk.c2}55, transparent 70%), radial-gradient(80% 90% at 85% 90%, ${tk.c1}66, transparent 70%), linear-gradient(160deg, #1C1A28, #0F0E15)`
                  : `radial-gradient(90% 80% at 30% 20%, ${tk.c2}55, transparent 70%), radial-gradient(80% 90% at 85% 90%, ${tk.c1}40, transparent 70%), linear-gradient(160deg, #FFFFFF, #F2F0F8)`,
              }}>
                <div style={{ ...layer, background: FOIL, mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.38 : 0.4 }} />
                <div style={{ ...layer, backgroundImage: `radial-gradient(${dark ? "rgba(255,255,255,.16)" : "rgba(11,11,12,.12)"} 1px, transparent 1.2px)`, backgroundSize: `${u(14)} ${u(14)}`, WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, #000, transparent)", maskImage: "radial-gradient(70% 70% at 50% 50%, #000, transparent)" }} />
                <div style={{ ...layer, background: streak(dark ? 0.3 : 0.75) }} />
                <div style={{ position: "absolute", left: "50%", top: "50%", width: u(138), height: u(138), transform: "translate(-50%,-50%)", filter: `drop-shadow(0 ${u(12)} ${u(16)} ${dark ? "rgba(0,0,0,.5)" : "rgba(40,30,120,.22)"})` }}>
                  <StyleSymbol style={styleId} dark={dark} />
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, padding: `${u(18)} ${u(8)} 0`, display: "flex", flexDirection: "column" }}>
                <h2 className={rise} style={{ margin: 0, font: `500 ${u(40)}/1 var(--font-display), 'Funnel Display', sans-serif`, letterSpacing: "-0.045em" }}>{title}</h2>
                <p className={rise} style={{ margin: `${u(8)} 0 0`, fontSize: u(tagSize), lineHeight: 1.38, color: dark ? "#C9C6D6" : "#55534D" }}>{tagline}</p>
                <div style={{ flex: 1, minHeight: u(10) }} />
                {tools}
                <div style={{ marginTop: u(11), paddingBottom: u(4) }}>{footer}</div>
              </div>
            </div>
          </>
        )}
        {animate && <div aria-hidden className="sfr-sheen" />}
      </div>
    </div>
  );
});

function ToolsBlock({ tools, dark }: { tools: CardTool[]; dark: boolean }) {
  const over = tools.length > MAX_CELLS;
  const shown = over ? tools.slice(0, MAX_CELLS - 1) : tools;
  const more = tools.length - shown.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: u(8) }}>
      <span style={{ fontSize: u(11), lineHeight: 1, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: dark ? "#A8A3C7" : "#8C897F" }}>
        My AI tools
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: u(6) }}>
        {shown.map((t, i) => <ToolCell key={t.id} tool={t} dark={dark} main={i === 0} />)}
        {more > 0 && (
          <div style={{ height: u(42), borderRadius: u(11), boxShadow: `inset 0 0 0 1px ${dark ? "rgba(255,255,255,.1)" : "#ECEAE4"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: u(12.5), fontWeight: 600, color: dark ? "#C9C6D6" : "#55534D" }}>
            +{more} more
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCell({ tool, dark, main }: { tool: CardTool; dark: boolean; main: boolean }) {
  const a = /^#[0-9a-f]{6}$/i.test(tool.accent ?? "") ? tool.accent! : "#A8A59C";
  return (
    <div style={{
      minWidth: 0, height: u(42), boxSizing: "border-box", borderRadius: u(11), padding: `0 ${u(9)} 0 ${u(7)}`,
      display: "flex", alignItems: "center", gap: u(8), textAlign: "left",
      background: dark ? `linear-gradient(90deg, ${a}2E, rgba(255,255,255,.04) 60%)` : `linear-gradient(90deg, ${a}26, rgba(255,255,255,.85) 60%)`,
      boxShadow: `inset 0 0 0 1px ${main ? a + "88" : dark ? "rgba(255,255,255,.1)" : "#ECEAE4"}`,
    }}>
      <span style={{ position: "relative", width: u(28), height: u(28), flex: "none", borderRadius: "50%", background: "#FFFFFF", boxShadow: `0 0 0 ${u(2)} ${a}${dark ? "C0" : "99"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {tool.logo ? (
          <img src={tool.logo} alt="" crossOrigin="anonymous" style={{ width: "54%", height: "54%", objectFit: "contain" }} />
        ) : (
          <span style={{ font: `600 ${u(11)}/1 var(--font-display), 'Funnel Display', sans-serif`, color: "#0B0B0C" }}>{tool.monogram ?? tool.name.charAt(0)}</span>
        )}
        {main && (
          <span aria-label="Main tool" style={{ position: "absolute", right: u(-3), top: u(-3), width: u(11), height: u(11), borderRadius: "50%", background: "#3A2EFF", color: "#FFFFFF", boxShadow: `0 0 0 1.5px ${dark ? "#16151E" : "#FFFFFF"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: u(7), lineHeight: 1 }}>✦</span>
        )}
      </span>
      <span style={{ minWidth: 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: u(1) }}>
        <span style={{ maxWidth: "100%", font: `600 ${u(12.5)}/1.1 var(--font-display), 'Funnel Display', sans-serif`, letterSpacing: "-0.02em", color: dark ? "#FFFFFF" : "#0B0B0C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tool.name}</span>
        {tool.model && (
          <span style={{ maxWidth: "100%", fontSize: u(10.5), lineHeight: 1.15, fontWeight: 500, color: dark ? "#A8A3C7" : "#6F6D66", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tool.model}</span>
        )}
      </span>
    </div>
  );
}

function Footer({ dark }: { dark: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E6E3DC"}`, paddingTop: u(11) }}>
      <span style={{ display: "flex", alignItems: "center", gap: u(6), fontSize: u(11.5), fontWeight: 600, color: dark ? "#E7E4F5" : "#55534D" }}>
        <StackFlexMark size={u(13)} outline={dark ? "#121218" : "#FFFFFF"} />
        StackFlex
      </span>
    </div>
  );
}
