import type { ReactNode } from "react";
import { splitBySection, type ProfileTool } from "@/lib/stackflex/profile";
import { AiAppsIcon, AiSoftwareIcon } from "./SectionIcons";
import { StackCardRow, type RowCardSize } from "./StackCardRow";

export type StackSectionsVariant = "page" | "preview" | "showcase";

const GRID: Record<StackSectionsVariant, string> = { page: "sf-grid", preview: "sf-grid--preview", showcase: "sf-grid--showcase" };
const CARD: Record<StackSectionsVariant, RowCardSize> = { page: "auto", preview: "preview", showcase: "sm" };
const H2: Record<StackSectionsVariant, string> = {
  page: "text-[22px] sm:text-2xl",
  preview: "text-xl",
  showcase: "text-lg",
};

type Props = {
  tools: ProfileTool[];
  mainToolId?: string;
  variant?: StackSectionsVariant;
  onToolClick?: (tool: ProfileTool) => void;
  /** Editable contexts only (Results preview): shown when there are no tools at all. */
  emptyState?: ReactNode;
};

/** "My AI Stack" with its AI Apps / AI-Powered Software subsections. Empty subsections are hidden. */
export function StackSections({ tools, mainToolId, variant = "page", onToolClick, emptyState }: Props) {
  const { apps, software } = splitBySection(tools);
  if (!tools.length) return emptyState ? <section className="flex flex-col gap-4"><Title variant={variant} />{emptyState}</section> : null;
  const main = mainToolId ?? tools[0]?.id;
  const gap = variant === "page" ? "gap-[18px] sm:gap-[22px]" : variant === "preview" ? "gap-4" : "gap-3.5";
  return (
    <section className={`flex flex-col ${gap}`} aria-label="My AI Stack">
      <Title variant={variant} />
      {apps.length > 0 && <Sub icon={<AiAppsIcon />} label="AI Apps" items={apps} {...{ variant, main, onToolClick }} />}
      {software.length > 0 && <Sub icon={<AiSoftwareIcon />} label="AI-Powered Software" items={software} {...{ variant, main, onToolClick }} />}
    </section>
  );
}

function Title({ variant }: { variant: StackSectionsVariant }) {
  return <h2 className={`font-display font-medium leading-none tracking-[-0.035em] ${H2[variant]}`}>My AI Stack</h2>;
}

function Sub({ icon, label, items, variant, main, onToolClick }: {
  icon: ReactNode; label: string; items: ProfileTool[]; variant: StackSectionsVariant; main?: string; onToolClick?: (t: ProfileTool) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-[9px]">
        {icon}
        <h3 className="text-[15px] font-semibold">{label}</h3>
        <span className="text-[13px] text-sf-faint">{items.length}</span>
      </div>
      <div className={GRID[variant]} role="list">
        {items.map((t) => (
          <StackCardRow key={t.id} tool={t} main={t.id === main} size={CARD[variant]} onClick={onToolClick ? () => onToolClick(t) : undefined} />
        ))}
      </div>
    </div>
  );
}
