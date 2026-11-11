import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — StackFlex",
  description: "How StackFlex handles data for the public beta.",
  robots: { index: true, follow: true },
};

/**
 * Lean privacy notice for the public beta. Not a substitute for legal review.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl px-6 py-16 text-[#0B0B0C]">
      <p className="text-sm font-semibold text-[#8C897F]">
        <Link href="/" className="hover:text-[#0B0B0C]">
          ← StackFlex
        </Link>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl tracking-[-0.04em]">Privacy</h1>
      <p className="mt-3 text-sm text-[#6F6D66]">Last updated: November 10, 2026 · Public beta</p>

      <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-[#3F3D38]">
        <p>
          StackFlex helps you build a shareable AI profile card and LinkedIn banner. You can use the
          product without creating an account.
        </p>
        <section className="space-y-2">
          <h2 className="font-semibold text-[#0B0B0C]">What stays on your device</h2>
          <p>
            Your tool stack, profile fields, and theme preferences are stored in your browser
            (localStorage). Clearing site data removes them.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold text-[#0B0B0C]">What we may process on our servers</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Optional LinkedIn sign-in (OpenID Connect) to import a display name and profile photo
              preview. Access tokens are not stored after the import handshake.
            </li>
            <li>
              Anonymous product analytics via Vercel Web Analytics (page views and referring
              websites). Optional funnel events (for example Start clicked, onboarding completed, or
              asset downloaded) may be collected when that feature is enabled on our hosting plan.
              Events do not include your full tool stack, custom tool names, or personal identifiers.
            </li>
            <li>Standard hosting logs (IP address, user agent, timestamps) from our infrastructure.</li>
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold text-[#0B0B0C]">Sharing</h2>
          <p>
            Public share links encode stack data in the URL. Anyone with the link can view that
            snapshot. Do not put sensitive information in custom tool names or profile fields you
            intend to share.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold text-[#0B0B0C]">Contact</h2>
          <p>
            Questions about this notice:{" "}
            <Link href="/contact" className="font-medium text-[#3A2EFF] underline-offset-2 hover:underline">
              Contact
            </Link>
            .
          </p>
        </section>
        <p className="text-sm text-[#8C897F]">
          This page describes product behavior for the beta. It is not legal advice and does not by
          itself establish regulatory compliance.
        </p>
      </div>
    </main>
  );
}
