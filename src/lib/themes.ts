export type ThemeId = "light" | "dark" | "mono";

export interface RenderTheme {
  id: ThemeId;
  label: string;
  canvas: string;
  grid: string;
  ink: string;
  muted: string;
  rule: string;
  badgeBg: string;
  badgeBorder: string;
  badgeBorderWidth: number;
  tileBg: string;
  tileBorder: string;
  /** Icon color override. When unset, brand colors are used if they have enough contrast. */
  iconInk?: string;
  monogramInk: string;
  signal: string;
  signalInk: string;
}

export const THEMES: Record<ThemeId, RenderTheme> = {
  light: {
    id: "light",
    label: "Light",
    canvas: "#EDEFF2",
    grid: "#D3D8DE",
    ink: "#121417",
    muted: "#5C636D",
    rule: "#C9CFD6",
    badgeBg: "#FFFFFF",
    badgeBorder: "#D2D7DD",
    badgeBorderWidth: 1,
    tileBg: "#F3F4F6",
    tileBorder: "#E2E5E9",
    monogramInk: "#121417",
    signal: "#F2B200",
    signalInk: "#121417",
  },
  dark: {
    id: "dark",
    label: "Dark",
    canvas: "#0F1113",
    grid: "#23272C",
    ink: "#ECEEF0",
    muted: "#8C949D",
    rule: "#2C3137",
    badgeBg: "#171A1E",
    badgeBorder: "#2B3036",
    badgeBorderWidth: 1,
    tileBg: "#0F1113",
    tileBorder: "#262A30",
    monogramInk: "#ECEEF0",
    signal: "#F2B200",
    signalInk: "#121417",
  },
  mono: {
    id: "mono",
    label: "Monochrome",
    canvas: "#FFFFFF",
    grid: "#E3E3E3",
    ink: "#000000",
    muted: "#4D4D4D",
    rule: "#000000",
    badgeBg: "#FFFFFF",
    badgeBorder: "#000000",
    badgeBorderWidth: 2,
    tileBg: "#000000",
    tileBorder: "#000000",
    iconInk: "#FFFFFF",
    monogramInk: "#FFFFFF",
    signal: "#000000",
    signalInk: "#FFFFFF",
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(value.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Brand color when legible on the icon tile, otherwise the theme's ink. */
export function resolveIconColor(theme: RenderTheme, brandHex: string | undefined): string {
  if (theme.iconInk) return theme.iconInk;
  if (!brandHex) return theme.ink;
  const color = `#${brandHex}`;
  return contrastRatio(color, theme.tileBg) >= 2.2 ? color : theme.ink;
}
