/* eslint-disable @next/next/no-img-element */
import type { ProfileIdentityData } from "@/lib/stackflex/profile";

/** Server-safe initials (avoid importing client-only profile store). */
function profileInitials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N} ]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]!.charAt(0) + words[1]!.charAt(0)).toUpperCase();
}

const SIZES = {
  page: {
    av: "h-16 w-16 sm:h-[88px] sm:w-[88px]",
    gap: "gap-4 sm:gap-[22px]",
    name: "text-[28px] sm:text-[40px]",
    title: "text-[14.5px] sm:text-[17px]",
    inner: "gap-1.5 sm:gap-[7px]",
    initials: "text-[22px] sm:text-[28px]",
  },
  preview: {
    av: "h-[68px] w-[68px]",
    gap: "gap-[17px]",
    name: "text-[30px]",
    title: "text-[15px]",
    inner: "gap-[5px]",
    initials: "text-[22px]",
  },
  showcase: {
    av: "h-[60px] w-[60px]",
    gap: "gap-[15px]",
    name: "text-[26px]",
    title: "text-sm",
    inner: "gap-[5px]",
    initials: "text-[18px]",
  },
};

export const AVATAR_FALLBACK = "linear-gradient(140deg,#FFC9A8,#B9A8FF)";

/** Photo + name + professional title. Left aligned. Title line hidden when empty. */
export function ProfileIdentity({
  identity,
  variant = "page",
}: {
  identity: ProfileIdentityData;
  variant?: keyof typeof SIZES;
}) {
  const s = SIZES[variant];
  const initials = identity.name.trim() ? profileInitials(identity.name) : "";
  return (
    <div className={`flex items-center ${s.gap}`}>
      <span
        className={`relative flex flex-none items-center justify-center overflow-hidden rounded-full shadow-[0_0_0_4px_#FFFFFF,0_12px_28px_-14px_rgba(11,11,12,.35)] ${s.av}`}
        style={identity.avatarSrc ? undefined : { background: AVATAR_FALLBACK }}
      >
        {identity.avatarSrc ? (
          <img src={identity.avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          initials && (
            <span className={`font-display font-semibold tracking-[-0.04em] text-white/95 ${s.initials}`}>
              {initials}
            </span>
          )
        )}
      </span>
      <div className={`flex min-w-0 flex-col ${s.inner}`}>
        <h1 className={`font-display font-medium leading-none tracking-[-0.045em] ${s.name}`}>
          {identity.name}
        </h1>
        {identity.title && <p className={`text-sf-muted ${s.title}`}>{identity.title}</p>}
      </div>
    </div>
  );
}
