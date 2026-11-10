import Link from "next/link";
import { WorkingStyleProfileCard } from "@/components/results/WorkingStyleProfileCard";
import { Mark, Wordmark } from "@/components/stackflex/Brand";
import { PersonalProfile } from "@/components/stackflex/profile";
import { features } from "@/lib/features";
import { roleLabel } from "@/lib/profile/roles";
import { classifyWorkingStyle } from "@/lib/profile/workingStyle";
import { toProfileDataFromSnapshot } from "@/lib/stackflex/toProfileData";
import { stackTools } from "@/lib/stackflex/tools";
import type {
  SnapshotActivities,
  SnapshotIdentity,
  StackShareInput,
} from "@/lib/stack-sharing";

/**
 * Read-only personal AI Stack page from a URL snapshot.
 * Working style is recomputed from tools; identity comes only from the token.
 */
export function PublicStackView({
  stack,
  identity,
  activities = [],
}: {
  stack: StackShareInput;
  identity?: SnapshotIdentity;
  activities?: SnapshotActivities;
}) {
  const data = toProfileDataFromSnapshot({ stack, identity, activities });
  const tools = stackTools(stack);
  const style = classifyWorkingStyle({
    toolIds: stack.items.map((i) => i.id),
    role: identity?.professionalRole,
  });
  const role =
    roleLabel(identity?.professionalRole) || identity?.professionalTitle || undefined;

  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <header className="sticky top-0 z-20 border-b border-[#EFECE5] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-8 lg:px-10">
          <Link
            href="/"
            className="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2"
          >
            <Wordmark />
          </Link>
          <Link
            href="/#guide"
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-sf-ink px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-sf-ink/90 sm:h-10 sm:px-4"
          >
            Discover your profile
          </Link>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-[880px] px-4 pb-10 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-12 lg:pt-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 right-0 size-72 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(58,46,255,.06), transparent)" }}
        />
        <WorkingStyleProfileCard
          name={identity?.displayName}
          roleLabel={role}
          style={style}
          tools={tools}
          className="mb-10"
        />
        {features.SHOW_PERSONAL_PAGE_PREVIEW && (
          <div className="mx-auto max-w-[1200px]">
            <PersonalProfile data={data} variant="page" />
          </div>
        )}
        <p className="mx-auto mt-10 max-w-sm text-center text-[12px] leading-relaxed text-sf-subtle">
          Shared snapshot — this page stays the same even if the creator updates their stack later.
        </p>
      </div>

      <footer className="mt-6 border-t border-[#EFECE5] bg-[#FAF9F6]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 py-10 sm:px-8">
          <div className="flex items-center gap-2 text-[13px] text-sf-muted">
            <Mark size={16} />
            <span>
              Made with <span className="font-semibold text-sf-ink">StackFlex</span>
            </span>
          </div>
          <Link
            href="/#guide"
            className="group inline-flex h-14 items-center gap-4 rounded-full bg-sf-ink pl-[26px] pr-1.5 text-[17px] font-semibold text-white transition-transform duration-150 ease-premium hover:bg-sf-ink/90 active:scale-[0.97]"
          >
            Create your AI profile
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-full bg-sf-lime text-[18px] font-bold text-sf-ink"
            >
              →
            </span>
          </Link>
        </div>
      </footer>
    </main>
  );
}
