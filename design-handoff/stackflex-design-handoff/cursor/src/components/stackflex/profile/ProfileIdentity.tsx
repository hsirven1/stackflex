/* eslint-disable @next/next/no-img-element */
import type { ProfileIdentity as Identity } from "@/lib/stackflex/profile";

const SIZES = {
  page: { av: "h-16 w-16 sm:h-[88px] sm:w-[88px]", gap: "gap-4 sm:gap-[22px]", name: "text-[28px] sm:text-[40px]", title: "text-[14.5px] sm:text-[17px]", inner: "gap-1.5 sm:gap-[7px]" },
  preview: { av: "h-[68px] w-[68px]", gap: "gap-[17px]", name: "text-[30px]", title: "text-[15px]", inner: "gap-[5px]" },
  showcase: { av: "h-[60px] w-[60px]", gap: "gap-[15px]", name: "text-[26px]", title: "text-sm", inner: "gap-[5px]" },
};

export const AVATAR_FALLBACK = "linear-gradient(140deg,#FFC9A8,#B9A8FF)";

/** Photo + name + professional title. Left aligned. Title line is hidden when empty. */
export function ProfileIdentity({ identity, variant = "page" }: { identity: Identity; variant?: keyof typeof SIZES }) {
  const s = SIZES[variant];
  return (
    <div className={`flex items-center ${s.gap}`}>
      <span className={`relative flex-none overflow-hidden rounded-full shadow-[0_0_0_4px_#FFFFFF,0_12px_28px_-14px_rgba(11,11,12,.35)] ${s.av}`}
        style={identity.avatarSrc ? undefined : { background: AVATAR_FALLBACK }}>
        {identity.avatarSrc && <img src={identity.avatarSrc} alt="" className="h-full w-full object-cover" />}
      </span>
      <div className={`flex min-w-0 flex-col ${s.inner}`}>
        <h1 className={`font-display font-medium leading-none tracking-[-0.045em] ${s.name}`}>{identity.name}</h1>
        {identity.title && <p className={`text-sf-muted ${s.title}`}>{identity.title}</p>}
      </div>
    </div>
  );
}
