import { Heart, MessageCircle, Repeat2, Share } from "lucide-react";
import type { ReactNode } from "react";
import { LinkedInIcon, XIcon } from "./Controls";

// Illustrative platform frames around real StackFlex artwork (landing hero, Results previews).
// System font on purpose: they represent social platform UI. Never part of an exported image.

const AVATAR = "linear-gradient(140deg, #FFC9A8, #B9A8FF)";
const FRAME =
  "overflow-hidden rounded-[14px] bg-white font-[system-ui] text-[#191919] shadow-[0_0_0_1px_rgba(11,11,12,.08),0_1px_2px_rgba(11,11,12,.04),0_24px_48px_-28px_rgba(11,11,12,.28)]";

const Avatar = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`block flex-none rounded-full ${className}`} style={{ background: AVATAR }} />
);

/** LinkedIn feed post with the artwork as its media. */
export function LinkedInPostMock({
  name,
  headline,
  caption,
  children,
  className = "",
}: {
  name: string;
  headline: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${FRAME} ${className}`}>
      <div className="flex items-start gap-2.5 px-4 pb-2.5 pt-3.5">
        <Avatar className="h-10 w-10" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13.5px] font-semibold leading-tight">{name}</span>
          <span className="truncate text-xs leading-snug text-[#666]">{headline}</span>
          <span className="text-[11px] leading-snug text-[#666]">2h</span>
        </div>
        <LinkedInIcon size={20} />
      </div>
      {caption && <p className="truncate px-4 pb-2.5 text-[13px] leading-snug">{caption}</p>}
      <div className="border-y border-[#EEE]">{children}</div>
      <div className="flex justify-around px-4 py-2 text-xs font-semibold text-[#666]">
        <span>Like</span>
        <span>Comment</span>
        <span>Repost</span>
        <span>Send</span>
      </div>
    </div>
  );
}

/** Platform-neutral feed post with the artwork as its media: the same image goes to LinkedIn and X. */
export function SocialPostMock({
  name,
  headline,
  caption,
  children,
  className = "",
  /** Tighter chrome for the Results bento (does not affect the exported square). */
  compact = false,
}: {
  name: string;
  headline: string;
  caption?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`${FRAME} ${className}`}>
      <div className={`flex items-center gap-2 ${compact ? "px-2.5 pb-1.5 pt-2" : "px-3.5 pb-2 pt-3"}`}>
        <Avatar className={compact ? "h-7 w-7" : "h-9 w-9"} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate font-semibold leading-tight ${compact ? "text-[12px]" : "text-[13px]"}`}>{name}</span>
          <span className={`truncate leading-snug text-[#666] ${compact ? "text-[10.5px]" : "text-[11.5px]"}`}>{headline}</span>
        </div>
        <span className={`flex-none text-[#888] ${compact ? "text-[10px]" : "text-[11px]"}`}>2h</span>
      </div>
      {caption && (
        <p className={`truncate leading-snug ${compact ? "px-2.5 pb-1.5 text-[11.5px]" : "px-3.5 pb-2 text-[12.5px]"}`}>
          {caption}
        </p>
      )}
      <div className={compact ? "" : "border-y border-[#EEE]"}>{children}</div>
      {!compact && (
        <div className="flex items-center gap-5 px-3.5 py-2 text-[#777]">
          <Heart className="size-4" strokeWidth={1.8} />
          <MessageCircle className="size-4" strokeWidth={1.8} />
          <Repeat2 className="size-4" strokeWidth={1.8} />
          <Share className="ml-auto size-4" strokeWidth={1.8} />
        </div>
      )}
    </div>
  );
}

/** LinkedIn profile header: banner, overlapping photo, name and headline. */
export function LinkedInProfileMock({
  name,
  headline,
  children,
  className = "",
  /** Tighter chrome for landing / miniature showcases. */
  compact = false,
}: {
  name: string;
  headline?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`${FRAME} ${className}`}>
      <div className="border-b border-[#EEE]">{children}</div>
      <div
        className={`relative flex items-start justify-between gap-2 ${
          compact ? "py-2 pl-[min(88px,28%)] pr-2.5" : "py-3 pl-[min(124px,24%)] pr-4"
        }`}
      >
        <Avatar
          className={`absolute top-0 aspect-square -translate-y-1/2 border-white ${
            compact
              ? "left-3 w-[min(56px,22%)] border-[2.5px]"
              : "left-4 w-[min(84px,17%)] border-[3px]"
          }`}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`font-semibold leading-tight ${compact ? "text-[12px]" : "text-[15px]"}`}>
            {name}
          </span>
          {headline && (
            <span className={`truncate text-[#666] ${compact ? "text-[10.5px]" : "text-[12.5px]"}`}>
              {headline}
            </span>
          )}
        </div>
        <LinkedInIcon size={compact ? 14 : 18} />
      </div>
    </div>
  );
}

/** X profile header: header image, overlapping photo, name and handle. */
export function XProfileMock({
  name,
  handle,
  children,
  className = "",
}: {
  name: string;
  handle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${FRAME} ${className}`}>
      <div className="border-b border-[#EEE]">{children}</div>
      <div className="relative flex items-start justify-between gap-3 px-4 pb-3 pt-[min(44px,8%)]">
        <Avatar className="absolute left-4 top-0 aspect-square w-[min(84px,17%)] -translate-y-1/2 border-[3px] border-white" />
        <div className="flex min-w-0 flex-col">
          <span className="text-[15px] font-extrabold leading-tight">{name}</span>
          <span className="text-[13px] text-[#536471]">{handle}</span>
        </div>
        <XIcon size={18} />
      </div>
    </div>
  );
}
