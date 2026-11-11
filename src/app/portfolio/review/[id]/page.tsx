import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { McpDraftReview } from "@/components/mcp/McpDraftReview";
import { decodeDraftToken } from "@/lib/mcp/draft-token";

export const metadata: Metadata = {
  title: "Review portfolio draft — StackFlex",
  description: "Private review of an AI portfolio draft created via StackFlex MCP.",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function ReviewFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-sf-muted">
      <p className="text-[14px] font-medium">Loading draft…</p>
    </main>
  );
}

/**
 * Private MCP draft review. Access control today = unguessable signed token in the URL.
 * Multi-user ownership checks are required before public launch (see docs/MCP.md).
 */
async function ReviewContent({ params }: PageProps) {
  const { id } = await params;
  const token = decodeURIComponent(id);
  const draft = decodeDraftToken(token);
  if (!draft) notFound();

  return <McpDraftReview initialDraft={draft} />;
}

export default function PortfolioReviewPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ReviewFallback />}>
      <ReviewContent params={params} />
    </Suspense>
  );
}
