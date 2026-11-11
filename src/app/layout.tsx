import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { funnelDisplay, funnelSans } from "@/lib/stackflex/fonts";
import "./globals.css";

/** Still used by the export renderers until they move to the new card artwork. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "StackFlex — Show what you can do with AI",
  description:
    "Showcase the AI tools behind your work. Build a shareable AI profile card and LinkedIn banner. No signup.",
  applicationName: "StackFlex",
  openGraph: {
    type: "website",
    siteName: "StackFlex",
    title: "StackFlex — Show what you can do with AI",
    description:
      "Build a shareable AI profile card and LinkedIn banner from the tools you actually use. No signup.",
  },
  twitter: {
    card: "summary_large_image",
    title: "StackFlex — Show what you can do with AI",
    description:
      "Build a shareable AI profile card and LinkedIn banner from the tools you actually use. No signup.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${funnelDisplay.variable} ${funnelSans.variable} ${archivo.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
