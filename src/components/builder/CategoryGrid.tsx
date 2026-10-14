"use client";

import { useState } from "react";
import { CategoryCard, type OpenPanel } from "@/components/selector/CategoryCard";
import { catalog } from "@/lib/catalog/adapter";
import type { StackState } from "@/lib/selection/types";

/** The six category cards with the one contextual panel that may be open across them. */
export function CategoryGrid({ stack, singleColumn = false }: { stack: StackState; singleColumn?: boolean }) {
  const [panel, setPanel] = useState<OpenPanel | null>(null);
  return (
    <>
      <h2 className="sr-only">Categories</h2>
      <div className={singleColumn ? "grid gap-3" : "grid gap-3 md:grid-cols-2 xl:auto-rows-fr xl:grid-cols-3"}>
        {catalog.categories().map((category) => (
          <CategoryCard key={category.id} category={category} stack={stack} panel={panel} onPanel={setPanel} />
        ))}
      </div>
    </>
  );
}
