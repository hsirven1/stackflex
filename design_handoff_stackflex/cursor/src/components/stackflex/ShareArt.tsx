import type { Tool } from "@/lib/stackflex/tools";
import { StackBoard } from "./StackBoard";

// The artwork users publish. Rendered with the same StackBoard/StackCard as the app.
// Everything inside scales with container width (cqw), so the same component renders
// the 400px landing preview and the full-size export.
//
// Export sizes: square social card 1080×1080 (size not fixed in the mocks; 1080 recommended),
// LinkedIn banner 1584×396, X header 1500×500.

const GLOW = "radial-gradient(closest-side, rgba(58,46,255,.10), transparent)";

/** Square social card: board on white, faint ultramarine glow from the bottom. No title, no link. */
export function SocialCardArt({ tools, className = "" }: { tools: Tool[]; className?: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden bg-white ${className}`} style={{ containerType: "inline-size" }}>
      <div aria-hidden className="absolute rounded-full" style={{ left: "-10%", right: "-10%", bottom: "-60%", height: "100%", background: GLOW }} />
      <div className="absolute flex flex-col justify-center" style={{ inset: "7.5cqw" }}>
        <StackBoard tools={tools} layout="square" gap="2.5cqw" />
      </div>
    </div>
  );
}

/** Banner (LinkedIn 4:1 light, X 3:1 dark). Main card + 5 cards two per column, mark tile last, right-aligned. */
export function BannerArt({
  tools,
  theme = "light",
  ratio = "4 / 1",
  className = "",
}: {
  tools: Tool[];
  theme?: "light" | "dark";
  ratio?: string;
  className?: string;
}) {
  const dark = theme === "dark";
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio, containerType: "inline-size", background: dark ? "#0B0B0C" : "#FFFFFF" }}
    >
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{ left: "-10%", right: "-10%", bottom: "-120%", height: "200%", background: dark ? "radial-gradient(closest-side, rgba(58,46,255,.35), transparent)" : GLOW }}
      />
      <div className="absolute top-1/2 -translate-y-1/2" style={{ right: "4.67cqw", width: "50.67cqw" }}>
        <StackBoard tools={tools} layout="banner" theme={theme} gap="1cqw" />
      </div>
    </div>
  );
}
