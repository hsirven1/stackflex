import type { ReactNode } from "react";

/** Minimal browser chrome for Results preview and landing showcase. */
export function BrowserFrame({
  address = "stackflex.app",
  children,
  className = "",
  barHeight = 34,
}: {
  address?: string;
  children: ReactNode;
  className?: string;
  barHeight?: number;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_#ECEAE4,0_30px_60px_-42px_rgba(11,11,12,.28)] ${className}`}
    >
      <div
        className="relative flex items-center border-b border-[#F2F0EB] px-3.5"
        style={{ height: barHeight }}
      >
        <span className="absolute left-3.5 flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#E6E3DC]" />
          <span className="size-2 rounded-full bg-[#E6E3DC]" />
          <span className="size-2 rounded-full bg-[#E6E3DC]" />
        </span>
        <span className="mx-auto truncate text-[11.5px] text-sf-faint">{address}</span>
      </div>
      {children}
    </div>
  );
}
