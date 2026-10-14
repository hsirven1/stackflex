import type { ReactNode } from "react";
import { Wordmark } from "@/components/stackflex/Brand";
import { HomeLink } from "./HomeLink";

/** Header and footer around the builder and results views. The landing page draws its own. */
export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-rule bg-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <HomeLink className="rounded-md text-sf-ink">
            <Wordmark />
          </HomeLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-6 pt-4 sm:px-6">{children}</main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-[1440px] px-4 py-5 text-xs text-graphite sm:px-6">
          No signup. Your selections stay in this browser. Brand names and logos belong to their owners; icons from Simple Icons.
        </div>
      </footer>
    </>
  );
}
