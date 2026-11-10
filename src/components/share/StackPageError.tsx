import Link from "next/link";
import { Wordmark } from "@/components/stackflex/Brand";

/** Polished fallback when a snapshot token cannot be decoded. */
export function StackPageError() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-sf-ink">
      <header className="border-b border-[#EFECE5]">
        <div className="mx-auto flex h-[72px] max-w-[960px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2">
            <Wordmark />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[32rem] flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[12px] font-semibold tracking-[0.08em] text-sf-muted uppercase">Unavailable</p>
        <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight tracking-[-0.04em] sm:text-[36px]">
          We couldn&apos;t read this AI Stack.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-sf-body">
          This link may be incomplete, outdated, or damaged. You can still build your own stack on StackFlex.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/#guide"
            className="inline-flex h-11 items-center justify-center rounded-full bg-sf-ink px-5 text-[14px] font-semibold text-white hover:bg-sf-ink/90"
          >
            Build your own stack
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-semibold text-sf-muted hover:text-sf-ink"
          >
            Go to StackFlex
          </Link>
        </div>
      </div>
    </main>
  );
}
