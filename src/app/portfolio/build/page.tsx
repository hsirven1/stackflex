import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioBuilder } from "@/components/portfolio/PortfolioBuilder";

export const metadata: Metadata = {
  title: "AI Portfolio Builder — StackFlex",
  description:
    "Turn your AI experience into a portfolio. Import from ChatGPT or Claude, or add work manually.",
  robots: { index: false, follow: false },
};

/** Experimental — available in local development only. */
export default function PortfolioBuildPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PortfolioBuilder />;
}
