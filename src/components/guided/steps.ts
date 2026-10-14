import type { CategoryId } from "@/lib/catalog/types";

export interface GuideStep {
  categoryId: CategoryId;
  title: string;
}

export const GUIDE_STEPS: GuideStep[] = [
  { categoryId: "daily", title: "What’s your daily AI?" },
  { categoryId: "coding", title: "What do you build with?" },
  { categoryId: "creative", title: "What do you create with?" },
  { categoryId: "automation", title: "What powers your automations?" },
  { categoryId: "research", title: "What helps you research?" },
  { categoryId: "local", title: "Running anything locally?" },
];

export function stepIndexForCategory(categoryId: CategoryId | null): number {
  return GUIDE_STEPS.findIndex((s) => s.categoryId === categoryId);
}
