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
    label: "Social card",
    description: "1080 × 1080 PNG",
    /** Light theme; the downloaded file is named per theme (see exportFilename). */
    filename: "stackflex-social-light.png",
    transparent: false,
  },
  strip: {
    id: "strip",
    label: "Website badge",
    description: "Transparent PNG, 2×",
    filename: "stackflex-website-badges.png",
    transparent: true,
  },
  /** README image; the filename must match README_IMAGE_PATH in the Markdown. */
  github: {
    id: "github",
    label: "GitHub README",
    description: "Transparent PNG, 800px wide, 2×",
    filename: "stackflex-badges.png",
    transparent: true,
  },
};
