/** Discrete professional roles collected in onboarding (last step). */
export type ProfessionalRole =
  | "product-manager"
  | "software-engineer"
  | "designer"
  | "founder"
  | "marketing"
  | "sales"
  | "operations"
  | "other";

export const PROFESSIONAL_ROLES: readonly {
  id: ProfessionalRole;
  label: string;
}[] = [
  { id: "product-manager", label: "Product Manager" },
  { id: "software-engineer", label: "Software Engineer" },
  { id: "designer", label: "Designer" },
  { id: "founder", label: "Founder / Entrepreneur" },
  { id: "marketing", label: "Marketing" },
  { id: "sales", label: "Sales" },
  { id: "operations", label: "Operations" },
  { id: "other", label: "Other" },
] as const;

const ROLE_IDS = new Set(PROFESSIONAL_ROLES.map((r) => r.id));

export function isProfessionalRole(value: unknown): value is ProfessionalRole {
  return typeof value === "string" && ROLE_IDS.has(value as ProfessionalRole);
}

export function roleLabel(role: ProfessionalRole | undefined | null): string {
  if (!role) return "";
  return PROFESSIONAL_ROLES.find((r) => r.id === role)?.label ?? "";
}
