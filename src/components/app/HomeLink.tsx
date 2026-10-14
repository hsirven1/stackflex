"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { navigate } from "@/lib/view";

/** Returns to the landing page through the hash router; modified clicks keep normal link behavior. */
export function HomeLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate("home");
      }}
    >
      {children}
    </Link>
  );
}
