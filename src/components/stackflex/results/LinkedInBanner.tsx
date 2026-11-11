/* eslint-disable @next/next/no-img-element */
import { forwardRef, type CSSProperties } from "react";
import type { AIProfile, CardTheme, CardTool } from "./lib/types";
import { STYLE_TOKENS, toStyleId } from "./lib/working-styles";
import { StyleSymbol } from "./StyleSymbol";
import { MadeWithStackFlex } from "./MadeWithStackFlex";

/**
 * Banner artwork is authored on a 1000×250 grid.
 * Preview uses container query units (cqw). Export uses absolute px for the
 * same proportions — html-to-image clones into an SVG foreignObject where
 * container queries do not resolve, which previously stretched soft artwork.
 */
const AUTHOR_W = 1000;
const layer: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };
const FOIL =
  "conic-gradient(from 200deg at 62% 40%, rgba(255,150,170,0), rgba(255,200,110,.7), rgba(130,235,185,.62), rgba(110,180,255,.7), rgba(195,150,255,.7), rgba(255,150,170,0))";

/**
 * Max real tools rendered on the exported banner.
 * Cap at 10 (2×5) for readability inside LinkedIn's 1584×396 cover crop —
 * 12 in 3 rows becomes too cramped for logos + names.
 */
export const BANNER_MAX_TOOLS = 10;

/** LinkedIn’s recommended cover size — layout reference and 1× comparison baseline. */
export const BANNER_EXPORT = { width: 1584, height: 396 } as const;
/**
 * Default PNG download size: true 2× of the same 4:1 composition.
 * Rendered by laying the banner out at these CSS pixels (absolute units), then
 * capturing with pixelRatio 1. Do NOT use html-to-image pixelRatio:2 on a 1584
 * node — that only upscales an already-rasterized SVG foreignObject.
 */
export const BANNER_EXPORT_2X = { width: 3168, height: 792 } as const;

/** Content starts just past the LinkedIn avatar overlap (~20.7% on the profile preview). */
const CONTENT_LEFT = "22.5%";

/**
 * Content column width in authoring units (1000-wide grid).
 * Geometric max is ~747 (1000 − 22.5% left − 28 right). Use a slightly
 * conservative budget so Funnel Display advances do not clip in real renders.
 * Layout math is deterministic from tool names — never measured at paint/export time.
 */
const CONTENT_WIDTH = 700;

export type LinkedInBannerProps = {
  profile: AIProfile;
  theme?: CardTheme;
  width?: number | string;
  animate?: boolean;
  className?: string;
};

type Density = "roomy" | "compact";

type ToolLayoutPlan = {
  cols: number;
  density: Density;
  /** Display labels — full names unless a compact fallback is required. */
  labels: string[];
};

type UnitFn = (authorPx: number) => string;

/** Last-resort compact labels for names that still overflow the best grid. */
const COMPACT_LABEL_BY_NAME: Record<string, string> = {
  "Salesforce Agentforce": "Agentforce",
  "Microsoft 365 Copilot": "M365 Copilot",
  "Gemini for Google Workspace": "Gemini Workspace",
  "Adobe Premiere Pro": "Premiere Pro",
  "Canva Magic Studio": "Canva Magic",
  "GitHub Copilot": "Copilot",
  "OpenAI Agents SDK": "Agents SDK",
};

/**
 * Resolve authoring units for preview (cqw) vs export (px).
 * Numeric `width` = dedicated export surface at that CSS width.
 */
export function bannerUnits(width: number | string): { u: UnitFn; rootStyle: CSSProperties } {
  if (typeof width === "number" && Number.isFinite(width) && width > 0) {
    const k = width / AUTHOR_W;
    return {
      u: (authorPx: number) => `${(authorPx * k).toFixed(3)}px`,
      rootStyle: {
        width,
        height: (width * BANNER_EXPORT.height) / BANNER_EXPORT.width,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      },
    };
  }
  return {
    u: (authorPx: number) => `${(authorPx / 10).toFixed(3)}cqw`,
    rootStyle: {
      width,
      containerType: "inline-size",
      position: "relative",
      aspectRatio: `${BANNER_EXPORT.width} / ${BANNER_EXPORT.height}`,
      overflow: "hidden",
      boxSizing: "border-box",
    },
  };
}

function densityTokens(density: Density, rows = 1) {
  if (density === "compact") {
    return { gap: 4, fontSize: 14.5, chrome: 5 + 24 + 6 + 7, cellH: 42, minCell: 108 };
  }
  // Roomy with three rows (e.g. 5 long names in 2 columns) needs a slightly
  // tighter cell so the stack still fits the 1584×396 safe area.
  if (rows >= 3) {
    return { gap: 6, fontSize: 16, chrome: 7 + 32 + 8 + 10, cellH: 46, minCell: 150 };
  }
  return { gap: 7, fontSize: 18, chrome: 8 + 36 + 9 + 11, cellH: 56, minCell: 128 };
}

/** Approx Funnel Display semibold advance at the given size (authoring units). */
function estimateNameWidth(name: string, fontSize: number): number {
  let units = 0;
  for (const ch of name) {
    if (ch === " ") units += 0.32;
    else if (/[iIlj1t]/.test(ch)) units += 0.42;
    else if (/[mwMW@]/.test(ch)) units += 0.86;
    else units += 0.62;
  }
  // Small pad so borderline fits do not ellipsize in real fonts.
  return units * fontSize + fontSize * 0.35;
}

function labelFor(name: string, preferCompact: boolean): string {
  if (!preferCompact) return name;
  return COMPACT_LABEL_BY_NAME[name] ?? name;
}

function scoreLayout(
  tools: CardTool[],
  cols: number,
  density: Density,
  preferCompactLabels: boolean,
): number {
  const count = tools.length;
  const rows = Math.ceil(count / cols);
  const { gap, fontSize, chrome, minCell } = densityTokens(density, rows);
  const cellW = (CONTENT_WIDTH - (cols - 1) * gap) / cols;
  const nameBudget = Math.max(0, cellW - chrome);
  const lastRow = count % cols || cols;

  let overflow = 0;
  for (const tool of tools) {
    const label = labelFor(tool.name, preferCompactLabels);
    overflow += Math.max(0, estimateNameWidth(label, fontSize) - nameBudget);
  }

  let score = 0;
  // Readable names beat column count every time.
  score -= overflow * 12;
  if (density === "roomy") score += 55;
  if (preferCompactLabels) score -= 25;

  // Avoid N skinny columns for N tools when names need room (the 5-tool bug).
  if (count >= 4 && cols === count) score -= 120;
  if (count === 5 && cols >= 5) score -= 80;
  if (count === 4 && cols === 4) score -= 60;

  // Prefer balanced multi-row compositions for mid counts.
  if (count >= 4 && count <= 6 && rows === 2 && cols <= 3) score += 35;
  if (count >= 7 && count <= 10 && rows === 2) score += 25;
  // Three rows are acceptable for 4–5 long names in 2 columns; otherwise prefer fewer rows.
  if (rows >= 3) {
    if (count <= 5 && cols === 2) score += density === "roomy" ? 10 : 0;
    else score -= density === "roomy" ? 90 : 8;
  }
  if (lastRow === 1 && rows > 1) score -= 10;

  // Keep pills above a readable minimum width.
  if (cellW < minCell) score -= (minCell - cellW) * 1.4;
  if (cellW < 96) score -= 80;

  // Long names: prefer fewer, wider columns even if that adds a third row.
  const longest = tools.reduce((n, t) => Math.max(n, labelFor(t.name, preferCompactLabels).length), 0);
  if (longest >= 16 && cols <= 2) score += 55;
  if (longest >= 20 && cols <= 2) score += 25;
  if (longest >= 16 && cols >= 3 && overflow > 0) score -= 40;

  // Mild preference for filling the row without over-columnizing short names.
  if (overflow < 1 && cols <= Math.min(count, 3) && count <= 3) score += 20;

  return score;
}

function candidateLayouts(count: number): Array<{ cols: number; density: Density }> {
  const out: Array<{ cols: number; density: Density }> = [];
  const add = (cols: number, density: Density) => {
    if (cols < 1 || cols > count) return;
    out.push({ cols, density });
  };

  if (count <= 3) {
    add(count, "roomy");
    add(count, "compact");
    if (count === 3) add(2, "roomy");
  } else if (count <= 6) {
    // Prefer 2–3 columns so longer names can wrap to a second row.
    for (const cols of [2, 3, 4]) {
      add(cols, "roomy");
      add(cols, "compact");
    }
  } else if (count <= 8) {
    for (const cols of [3, 4]) {
      add(cols, "compact");
      add(cols, "roomy");
    }
  } else {
    for (const cols of [4, 5, 3]) {
      add(cols, "compact");
      if (cols <= 4) add(cols, "roomy");
    }
  }

  // Drop layouts that cannot fit the 1584×396 safe area.
  return out.filter(({ cols, density }) => {
    const rows = Math.ceil(count / cols);
    if (rows > 3) return false;
    // Roomy 3-row only for small stacks that need wider cells (long names).
    if (density === "roomy" && rows >= 3 && count > 5) return false;
    return true;
  });
}

/**
 * Pick columns + density from tool count and name lengths.
 * Deterministic: same tools always produce the same grid in preview and PNG export.
 */
export function planBannerToolLayout(tools: CardTool[]): ToolLayoutPlan {
  const count = tools.length;
  if (count === 0) return { cols: 1, density: "roomy", labels: [] };

  const candidates = candidateLayouts(count);
  let best = candidates[0] ?? { cols: Math.min(count, 3), density: "compact" as Density };
  let bestScore = -Infinity;
  let bestCompact = false;

  for (const preferCompactLabels of [false, true]) {
    for (const candidate of candidates) {
      const score = scoreLayout(tools, candidate.cols, candidate.density, preferCompactLabels);
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
        bestCompact = preferCompactLabels;
      }
    }
    // If full names already fit cleanly, do not consider compact labels.
    if (!preferCompactLabels) {
      const rows = Math.ceil(count / best.cols);
      const { gap, fontSize, chrome } = densityTokens(best.density, rows);
      const cellW = (CONTENT_WIDTH - (best.cols - 1) * gap) / best.cols;
      const budget = Math.max(0, cellW - chrome);
      const fits = tools.every((t) => estimateNameWidth(t.name, fontSize) <= budget + 0.5);
      if (fits) break;
    }
  }

  return {
    cols: best.cols,
    density: best.density,
    labels: tools.map((t) => labelFor(t.name, bestCompact)),
  };
}

/**
 * LinkedIn background photo from the same AIProfile as the card.
 * Content lives just right of the avatar safe zone; title + tools stay one block.
 * Pass a numeric `width` (e.g. BANNER_EXPORT.width) for PNG capture so sizes are px, not cqw.
 */
export const LinkedInBanner = forwardRef<HTMLDivElement, LinkedInBannerProps>(function LinkedInBanner(
  { profile, theme = "dark", width = "100%", animate = false, className = "" },
  ref,
) {
  const dark = theme === "dark";
  const styleId = toStyleId(profile.workingStyle.id);
  const tk = STYLE_TOKENS[styleId];
  const { title, tagline } = profile.workingStyle;
  const visibleTools = profile.tools.slice(0, BANNER_MAX_TOOLS);
  const layout = planBannerToolLayout(visibleTools);
  const compact = layout.density === "compact";
  const { u, rootStyle } = bannerUnits(width);

  return (
    <div
      ref={ref}
      data-sf-banner=""
      className={`${animate ? "sfr-banner-in" : ""} ${className}`.trim()}
      style={{
        ...rootStyle,
        color: dark ? "#FFFFFF" : "#0B0B0C",
        fontFamily: "var(--font-sans), 'Funnel Sans', system-ui, sans-serif",
        background: dark
          ? "radial-gradient(70% 170% at 66% 0%, #26213F 0%, #131219 55%, #0B0B0E 100%)"
          : "linear-gradient(160deg, #FFFFFF 0%, #F8F6F2 55%, #F0ECF6 100%)",
      }}
    >
      <div style={{ ...layer, background: FOIL, mixBlendMode: dark ? "screen" : "multiply", opacity: dark ? 0.18 : 0.3 }} />
      {dark && (
        <div
          style={{
            ...layer,
            inset: "auto",
            left: u(-40),
            top: u(-100),
            width: u(400),
            height: u(400),
            borderRadius: "50%",
            background: `radial-gradient(closest-side, ${tk.c2}30, transparent)`,
          }}
        />
      )}
      <div
        style={{
          ...layer,
          backgroundImage: `radial-gradient(${dark ? "rgba(255,255,255,.16)" : "rgba(11,11,12,.12)"} 1px, transparent 1.2px)`,
          backgroundSize: `${u(14)} ${u(14)}`,
          WebkitMaskImage: "radial-gradient(30% 90% at 14% 35%, #000, transparent)",
          maskImage: "radial-gradient(30% 90% at 14% 35%, #000, transparent)",
        }}
      />
      <div
        style={{
          ...layer,
          inset: "auto",
          left: u(235),
          top: u(-15),
          width: u(300),
          height: u(300),
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${tk.c1}${dark ? "66" : "30"}, transparent)`,
        }}
      />
      <div
        style={{
          ...layer,
          background: `linear-gradient(105deg, transparent 52%, rgba(140,190,255,${dark ? ".05" : ".18"}) 60%, rgba(255,255,255,${dark ? ".14" : ".7"}) 65%, rgba(255,190,150,${dark ? ".05" : ".18"}) 70%, transparent 78%)`,
        }}
      />

      {/* ~36px inset at 1584×396 — closer to the top-right safe corner than the title row. */}
      <MadeWithStackFlex
        size={compact ? u(11.5) : u(12.5)}
        fontSize={compact ? u(10) : u(11)}
        outline={dark ? "#131219" : "#FFFFFF"}
        color={dark ? "#E0DCEC" : "#5C5A54"}
        style={{
          position: "absolute",
          // ~32–36px inset at 1584×396 (author units × 1.584).
          top: compact ? u(18) : u(20),
          right: compact ? u(20) : u(22),
          zIndex: 2,
          flex: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: CONTENT_LEFT,
          right: u(28),
          top: compact ? u(16) : u(18),
          bottom: compact ? u(14) : u(16),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: compact ? u(10) : u(12),
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: u(10), flex: "none", paddingRight: u(150) }}>
          <div
            style={{
              width: compact ? u(34) : u(42),
              height: compact ? u(34) : u(42),
              flex: "none",
            }}
          >
            <StyleSymbol style={styleId} dark={dark} />
          </div>
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: compact ? u(2) : u(3) }}>
            <h2
              className="sfr-title"
              style={{
                margin: 0,
                paddingBottom: u(1),
                font: `600 ${compact ? u(22) : u(26)}/1 var(--font-display), 'Funnel Display', sans-serif`,
                letterSpacing: "-0.04em",
                backgroundImage: dark
                  ? "linear-gradient(180deg, #FFFFFF 30%, #CFC8FF 70%, #9FE3D0)"
                  : `linear-gradient(180deg, #0B0B0C 35%, ${tk.lightTitleEnd} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              {title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: compact ? u(12) : u(13.5),
                lineHeight: 1.25,
                fontWeight: 500,
                color: dark ? "#D4D1E0" : "#4A4842",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tagline}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: compact ? u(6) : u(8),
            minHeight: 0,
            flex: "none",
          }}
        >
          <span
            style={{
              fontSize: compact ? u(10) : u(11),
              lineHeight: 1,
              fontWeight: 650,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: dark ? "#B8B3D4" : "#7A776E",
            }}
          >
            My AI tools
          </span>
          <ToolGrid
            tools={visibleTools}
            labels={layout.labels}
            dark={dark}
            cols={layout.cols}
            density={layout.density}
            u={u}
          />
        </div>
      </div>
      {animate && <div aria-hidden className="sfr-sheen sfr-sheen-late" />}
    </div>
  );
});

function ToolGrid({
  tools,
  labels,
  dark,
  cols,
  density,
  u,
}: {
  tools: CardTool[];
  labels: string[];
  dark: boolean;
  cols: number;
  density: Density;
  u: UnitFn;
}) {
  const count = tools.length;
  if (count === 0) return null;

  const rows = Math.ceil(count / cols);
  const compact = density === "compact";
  const tokens = densityTokens(density, rows);
  const cellH = u(tokens.cellH);
  const logo = compact ? u(24) : rows >= 3 ? u(32) : u(36);
  const nameSize = u(tokens.fontSize);
  const padX = compact ? u(7) : u(11);
  const gap = u(tokens.gap);
  const star = compact ? u(11) : u(13);

  // Comfortable max widths for sparse stacks so pills do not stretch into empty space.
  const maxCol =
    count === 1 ? u(360) : count === 2 ? u(300) : count === 3 && cols === 3 ? u(260) : undefined;

  const cell: CSSProperties = {
    minWidth: 0,
    height: cellH,
    boxSizing: "border-box",
    borderRadius: compact ? u(10) : u(13),
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: maxCol
          ? `repeat(${cols}, minmax(0, ${maxCol}))`
          : `repeat(${cols}, minmax(0, 1fr))`,
        gap,
        justifyContent: maxCol ? "start" : undefined,
      }}
    >
      {tools.map((t, i) => {
        const a = /^#[0-9a-f]{6}$/i.test(t.accent ?? "") ? t.accent! : "#A8A59C";
        const main = i === 0;
        const label = labels[i] ?? t.name;
        return (
          <div
            key={t.id}
            style={{
              ...cell,
              padding: `0 ${padX} 0 ${compact ? u(5) : u(8)}`,
              gap: compact ? u(6) : u(9),
              background: dark
                ? `linear-gradient(90deg, ${a}2E, rgba(255,255,255,.04) 60%)`
                : `linear-gradient(90deg, ${a}26, rgba(255,255,255,.85) 60%)`,
              boxShadow: `inset 0 0 0 1px ${main ? a + "88" : dark ? "rgba(255,255,255,.1)" : "#ECEAE4"}`,
            }}
          >
            <span
              style={{
                position: "relative",
                width: logo,
                height: logo,
                flex: "none",
                borderRadius: "50%",
                background: "#FFFFFF",
                boxShadow: `0 0 0 ${u(2.2)} ${a}${dark ? "C0" : "99"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.logo ? (
                <img
                  src={t.logo}
                  alt=""
                  crossOrigin="anonymous"
                  decoding="sync"
                  style={{ width: "58%", height: "58%", objectFit: "contain" }}
                />
              ) : (
                <span
                  style={{
                    font: `600 ${compact ? u(11) : u(13)}/1 var(--font-display), 'Funnel Display', sans-serif`,
                    color: "#0B0B0C",
                  }}
                >
                  {t.monogram ?? t.name.charAt(0)}
                </span>
              )}
              {main && (
                <span
                  aria-label="Main tool"
                  style={{
                    position: "absolute",
                    right: u(-3),
                    top: u(-3),
                    width: star,
                    height: star,
                    borderRadius: "50%",
                    background: "#3A2EFF",
                    color: "#FFFFFF",
                    boxShadow: `0 0 0 1.5px ${dark ? "#16151E" : "#FFFFFF"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: compact ? u(7) : u(8.5),
                    lineHeight: 1,
                  }}
                >
                  ✦
                </span>
              )}
            </span>
            <span style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
              <span
                title={t.name !== label ? t.name : undefined}
                style={{
                  maxWidth: "100%",
                  font: `650 ${nameSize}/1.15 var(--font-display), 'Funnel Display', sans-serif`,
                  letterSpacing: "-0.02em",
                  color: dark ? "#FFFFFF" : "#0B0B0C",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
