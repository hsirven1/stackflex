import { BookOpen, Code2, MessageSquare, Palette, Server, Workflow, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/lib/catalog/types";

const ICONS: Record<CategoryId, LucideIcon> = {
  daily: MessageSquare,
  coding: Code2,
  creative: Palette,
  automation: Workflow,
  research: BookOpen,
  local: Server,
};

export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon aria-hidden="true" className={className} />;
}
