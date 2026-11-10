import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioFullPreview } from "@/components/portfolio/PortfolioFullPreview";

export const metadata: Metadata = {
  title: "AI Portfolio Preview — StackFlex",
  description: "Local preview of your StackFlex AI portfolio.",
  robots: { index: false, follow: false },
};

/** Experimental — available in local development only. */
export default function PortfolioPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PortfolioFullPreview />;
}
