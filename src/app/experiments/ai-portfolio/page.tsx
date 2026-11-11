import type { Metadata } from "next";
import { AiPortfolioExperiment } from "@/components/experiments/ai-portfolio/AiPortfolioExperiment";

export const metadata: Metadata = {
  title: "AI Portfolio Import Experiment — StackFlex",
  description:
    "Experimental: turn work you’ve done with AI into a portfolio draft using ChatGPT or Claude.",
  robots: { index: false, follow: false },
};

/**
 * Standalone product experiment — reachable by direct URL in production.
 * Isolated from the public MVP (landing, onboarding, Results, assets).
 */
export default function AiPortfolioExperimentPage() {
  return <AiPortfolioExperiment />;
}
