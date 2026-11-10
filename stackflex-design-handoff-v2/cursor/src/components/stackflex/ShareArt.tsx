import type { Tool } from "@/lib/stackflex/tools";
import { StackBoard } from "./StackBoard";
import { Mark } from "./Brand";
import type { ArtTheme } from "./Controls";

// Published artwork, rendered with the same StackCard as the app. Sizes in cqw so the same component
// renders the in-app preview and the full-size export.
// Exports: social card 1080×1080, LinkedIn banner 1584×396, X header 1500×500.
// Themes: light (default), dark (ink background, same light cards), mono (grayscale filter on the whole image).

const GLOW = "radial-gradient(closest-side, rgba(58,46,255,.08), transparent)";

/** Square social card: equal grid at 82% width, gap 2cqw, StackFlex mark bottom right. */
export function SocialCardArt({ tools, theme = "light", className = "" }: { tools: Tool[]; theme?: ArtTheme; className?: string }) {
  const dark = theme === "dark";
  return (
    <div className={`relative flex aspect-square items-center justify-center overflow-hidden ${className}`}
      style={{ containerType: "inline-size", background: dark ? "#0B0B0C" : "#FFFFFF", filter: theme === "mono" ? "grayscale(1)" : undefined }}>
      <div aria-hidden className="absolute rounded-full" style={{ left: "-15%", right: "-15%", bottom: "-62%", height: "100%", background: dark ? "radial-gradient(closest-side, rgba(58,46,255,.35), transparent)" : GLOW }} />
      <StackBoard tools={tools} layout="grid" gap="2cqw" className="relative w-[82%]" />
      <div className="absolute flex items-center" style={{ right: "4cqw", bottom: "3.5cqw", gap: "1.2cqw" }}>
        <Mark size={12} outline={dark ? "#0B0B0C" : "#FFFFFF"} />
        <span className="font-display font-semibold" style={{ fontSize: "2.6cqw", color: dark ? "#A8A59C" : "#55534D" }}>StackFlex</span>
      </div>
    </div>
  );
}

/** Banner: one row of equal cards, vertically centered, kept right of the profile photo (starts at 23.4% width). */
export function BannerArt({ tools, theme = "light", ratio = "4 / 1", className = "" }: { tools: Tool[]; theme?: ArtTheme; ratio?: string; className?: string }) {
  const dark = theme === "dark";
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio, containerType: "inline-size", background: dark ? "#0B0B0C" : "#FFFFFF", filter: theme === "mono" ? "grayscale(1)" : undefined }}>
      <div aria-hidden className="absolute rounded-full" style={{ left: "-10%", right: "-10%", bottom: "-120%", height: "200%", background: dark ? "radial-gradient(closest-side, rgba(58,46,255,.35), transparent)" : GLOW }} />
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: "23.4cqw", right: "3cqw" }}>
        <StackBoard tools={tools} layout="row" gap="1cqw" />
      </div>
    </div>
  );
}
