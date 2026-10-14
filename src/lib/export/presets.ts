export type ExportFormat = "banner" | "xheader" | "square" | "strip" | "github";

export interface ExportPreset {
  id: ExportFormat;
  label: string;
  description: string;
  filename: string;
  transparent: boolean;
}

export const EXPORT_PRESETS: Record<ExportFormat, ExportPreset> = {
  banner: {
    id: "banner",
    label: "LinkedIn banner",
    description: "1584 × 396 PNG",
    filename: "stackflex-linkedin-banner.png",
    transparent: false,
  },
  xheader: {
    id: "xheader",
    label: "X header",
    description: "1500 × 500 PNG",
    filename: "stackflex-x-header.png",
    transparent: false,
  },
  square: {
    id: "square",
    label: "Square card",
    description: "1080 × 1080 PNG",
    filename: "stackflex-square-card.png",
    transparent: false,
  },
  strip: {
    id: "strip",
    label: "Website Badges",
    description: "Transparent PNG",
    filename: "stackflex-website-badges.png",
    transparent: true,
  },
  /** Same strip as Website Badges; the filename must match README_IMAGE_PATH in the Markdown. */
  github: {
    id: "github",
    label: "GitHub README badges",
    description: "Transparent PNG",
    filename: "stackflex-badges.png",
    transparent: true,
  },
};
