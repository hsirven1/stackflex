import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicStackView } from "@/components/share/PublicStackView";
import { StackPageError } from "@/components/share/StackPageError";
import {
  decodeStackSnapshot,
  resolveShareOrigin,
  STACK_SHARE_TITLE,
  stackShareDescription,
} from "@/lib/stack-sharing";

type Props = {
  params: Promise<{ snapshot: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { snapshot } = await params;
  const decoded = decodeStackSnapshot(snapshot);
  const { origin } = resolveShareOrigin();
  const canonical = `${origin}/s/${snapshot}`;

  if (!decoded.ok) {
    return {
      title: "Stack not found | StackFlex",
      description: "This StackFlex link could not be read.",
      robots: { index: false, follow: false },
    };
  }

  const description = stackShareDescription(decoded.stack, decoded.identity);
  const title = decoded.identity.displayName
    ? `${decoded.identity.displayName}'s AI Stack | StackFlex`
    : STACK_SHARE_TITLE;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "StackFlex",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function PublicStackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-sf-muted">
      <p className="text-[14px] font-medium">Loading stack…</p>
    </main>
  );
}

async function PublicStackContent({ params }: { params: Promise<{ snapshot: string }> }) {
  const { snapshot } = await params;
  const decoded = decodeStackSnapshot(snapshot);
  if (!decoded.ok) return <StackPageError />;
  return (
    <PublicStackView
      stack={decoded.stack}
      identity={decoded.identity}
      activities={decoded.activities}
    />
  );
}

export default function PublicStackPage({ params }: Props) {
  return (
    <Suspense fallback={<PublicStackFallback />}>
      <PublicStackContent params={params} />
    </Suspense>
  );
}
