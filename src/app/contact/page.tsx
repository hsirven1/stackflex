import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — StackFlex",
  description: "Get in touch about the StackFlex public beta.",
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@stackflex.app";

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-2xl px-6 py-16 text-[#0B0B0C]">
      <p className="text-sm font-semibold text-[#8C897F]">
        <Link href="/" className="hover:text-[#0B0B0C]">
          ← StackFlex
        </Link>
      </p>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl tracking-[-0.04em]">Contact</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[#3F3D38]">
        StackFlex is in public beta. For product feedback, privacy questions, or press, email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-[#3A2EFF] underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <p className="mt-6 text-sm text-[#8C897F]">
        See also our{" "}
        <Link href="/privacy" className="font-medium text-[#3A2EFF] underline-offset-2 hover:underline">
          Privacy
        </Link>{" "}
        notice.
      </p>
    </main>
  );
}
