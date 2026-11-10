// Funnel Display + Funnel Sans (Google Fonts, SIL Open Font License 1.1). Both are variable fonts (300–800).
// In app/layout.tsx:  <html className={`${funnelDisplay.variable} ${funnelSans.variable}`}>
import { Funnel_Display, Funnel_Sans } from "next/font/google";

export const funnelDisplay = Funnel_Display({ subsets: ["latin"], variable: "--font-funnel-display", display: "swap" });
export const funnelSans = Funnel_Sans({ subsets: ["latin"], variable: "--font-funnel-sans", display: "swap" });
