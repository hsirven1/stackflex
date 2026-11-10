import type { ReactNode } from "react";

/** Minimal browser chrome: 3 dots + centered address. Used by the Results preview and the landing showcase. */
export function BrowserFrame({ address = "stackflex.app", children, className = "", barHeight = 34 }: {
  address?: string; children: ReactNode; className?: string; barHeight?: number;
}) {
  return (
    <div className={`overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_#ECEAE4,0_30px_60px_-42px_rgba(11,11,12,.28)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-[#F2F0EB] px-3.5" style={{ height: barHeight }}>
        <span className="h-2 w-2 rounded-full bg-[#E6E3DC]" />
        <span className="h-2 w-2 rounded-full bg-[#E6E3DC]" />
        <span className="h-2 w-2 rounded-full bg-[#E6E3DC]" />
        <span className="mr-[38px] flex-1 truncate text-center text-[11.5px] text-sf-faint">{address}</span>
      </div>
      {children}
    </div>
  );
}
