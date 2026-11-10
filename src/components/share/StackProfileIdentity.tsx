"use client";

import { profileInitials } from "@/lib/profile/store";

export type StackProfileIdentityProps = {
  /** Display name. Empty → generic placeholder. */
  name?: string;
  /** Professional title. Empty → generic placeholder. */
  title?: string;
  /** Optional photo URL (durable public or local preview). */
  avatarSrc?: string | null;
  size?: "full" | "compact" | "mini";
  className?: string;
};

const PLACEHOLDER_NAME = "Your name";
const PLACEHOLDER_TITLE = "Your professional title";

/**
 * Horizontal profile identity for the personal AI Stack page.
 * Avatar left · name + title right, vertically centered.
 */
export function StackProfileIdentity({
  name,
  title,
  avatarSrc = null,
  size = "full",
  className = "",
}: StackProfileIdentityProps) {
  const full = size === "full";
  const mini = size === "mini";
  const displayName = name?.trim() || PLACEHOLDER_NAME;
  const displayTitle = title?.trim() || PLACEHOLDER_TITLE;
  const hasRealName = Boolean(name?.trim());

  const gap = full ? "gap-5 sm:gap-6" : mini ? "gap-2.5" : "gap-3.5";
  const nameClass = full
    ? "text-[22px] leading-tight sm:text-[26px]"
    : mini
      ? "text-[12px] leading-tight"
      : "text-[17px] leading-snug sm:text-[18px]";
  const titleClass = full
    ? "mt-1 text-[13.5px] leading-snug sm:text-[14.5px]"
    : mini
      ? "mt-0.5 text-[9.5px] leading-tight"
      : "mt-0.5 text-[12px] leading-snug sm:text-[12.5px]";

  return (
    <div className={`flex items-center text-left ${gap} ${className}`}>
      <StackProfileAvatar src={avatarSrc} size={size} initials={hasRealName ? profileInitials(name!) : ""} />
      <div className="min-w-0">
        <p className={`font-display font-semibold tracking-[-0.04em] text-sf-ink ${nameClass}`}>{displayName}</p>
        <p className={`text-sf-muted ${titleClass}`}>{displayTitle}</p>
      </div>
    </div>
  );
}

/** Soft pearl avatar — photo, initials, or generic silhouette. */
export function StackProfileAvatar({
  src = null,
  size = "full",
  initials = "",
  className = "",
}: {
  src?: string | null;
  size?: "full" | "compact" | "mini";
  initials?: string;
  className?: string;
}) {
  const dim = size === "full" ? "size-[76px] sm:size-[88px]" : size === "mini" ? "size-9" : "size-14";
  const initialSize = size === "full" ? "text-[24px] sm:text-[28px]" : size === "mini" ? "text-[11px]" : "text-[16px]";

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-[3px] border-white shadow-[0_0_0_1px_#E8E5DE,0_10px_24px_-14px_rgba(11,11,12,.35)] ${dim} ${className}`}
      style={{
        background:
          "radial-gradient(circle at 35% 28%, #FFFFFF 0%, #F3F0FF 42%, #E8E4F8 70%, #D7D2EC 100%)",
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- optional user/LinkedIn photo
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : initials ? (
        <span
          className={`flex size-full items-center justify-center font-display font-semibold tracking-[-0.04em] text-sf-blue ${initialSize}`}
        >
          {initials}
        </span>
      ) : (
        <GenericAvatarMark />
      )}
    </div>
  );
}

function GenericAvatarMark() {
  return (
    <svg viewBox="0 0 96 96" className="size-full" aria-hidden="true">
      <circle cx="48" cy="36" r="16" fill="#3A2EFF" opacity="0.18" />
      <path d="M18 86c4.5-18 16-28 30-28s25.5 10 30 28" fill="#3A2EFF" opacity="0.16" />
      <circle cx="48" cy="36" r="12.5" fill="#FFFFFF" />
      <path d="M27 84c3.8-14.5 12.8-22 21-22s17.2 7.5 21 22" fill="#FFFFFF" />
    </svg>
  );
}
