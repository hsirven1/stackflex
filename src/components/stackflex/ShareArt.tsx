import type { Tool } from "@/lib/stackflex/tools";
import { Mark } from "./Brand";
import type { ArtTheme } from "./Controls";
import { StackBoard } from "./StackBoard";

// Published artwork, rendered with the same StackCard as the app. Sizes are in cqw, so the same
// component renders the in-app preview and the full-size export.
// Exports: social card 1080×1080, LinkedIn banner 1584×396, X header 1500×500.
// Themes: light (default), dark (ink background, same light cards).

const GLOW = "radial-gradient(closest-side, rgba(58,46,255,.08), transparent)";
const GLOW_DARK = "radial-gradient(closest-side, rgba(58,46,255,.35), transparent)";

/** Fixed export sizes. Previews render the artwork at this size and scale it down as a whole. */
export const ART_SIZE = {
  square: { width: 1080, height: 1080 },
  banner: { width: 1584, height: 396 },
  xheader: { width: 1500, height: 500 },
} as const;

export const ART_BACKGROUND: Record<ArtTheme, string> = { light: "#FFFFFF", dark: "#0B0B0C" };

/** Soft atmospheric washes shared by social cards and profile banners. */
function Atmosphere({ dark }: { dark: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          left: "-15%",
          right: "-15%",
          bottom: "-62%",
          height: "100%",
          background: dark ? GLOW_DARK : GLOW,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse 55% 70% at 12% 20%, rgba(215,255,58,.06), transparent 55%), radial-gradient(ellipse 45% 50% at 88% 75%, rgba(58,46,255,.18), transparent 60%)"
            : "radial-gradient(ellipse 55% 70% at 10% 15%, rgba(58,46,255,.05), transparent 55%), radial-gradient(ellipse 40% 45% at 92% 80%, rgba(215,255,58,.12), transparent 55%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: dark
            ? "linear-gradient(125deg, transparent 40%, rgba(255,255,255,.03) 50%, transparent 60%)"
            : "linear-gradient(125deg, transparent 38%, rgba(58,46,255,.03) 50%, transparent 62%)",
        }}
      />
    </>
  );
}

/**
 * Board width by featured-tool count — ~20–25% smaller than the prior fill-the-square sizes
 * so six cards leave breathing room in the 1080×1080 social export.
 */
const BALANCED_WIDTH = ["64%", "64%", "72%", "68%", "68%", "74%", "74%"];

/** Square social card: compact centered grid, StackFlex mark bottom right. */
export function SocialCardArt({
  tools,
  theme = "light",
  balanced = false,
  className = "",
}: {
  tools: Tool[];
  theme?: ArtTheme;
  /** Size the grid to the tool count (Results preview and export). */
  balanced?: boolean;
  className?: string;
}) {
  const dark = theme === "dark";
  const width = balanced ? BALANCED_WIDTH[Math.min(tools.length, BALANCED_WIDTH.length - 1)] : "64%";
  return (
    <div
      className={`relative flex aspect-square items-center justify-center overflow-hidden ${className}`}
      style={{ containerType: "inline-size", background: ART_BACKGROUND[theme] }}
    >
      <Atmosphere dark={dark} />
      <div className="relative" style={{ width }}>
        <StackBoard tools={tools} layout="grid" gap="2.4cqw" max={6} />
      </div>
      <div className="absolute flex items-center" style={{ right: "4cqw", bottom: "3.5cqw", gap: "1.2cqw" }}>
        <Mark size="3cqw" outline={ART_BACKGROUND[theme]} />
        <span className="font-display font-semibold" style={{ fontSize: "2.6cqw", color: dark ? "#A8A59C" : "#55534D" }}>
          StackFlex
        </span>
      </div>
    </div>
  );
}

export type BannerProfile = {
  /** Working-style display name, e.g. "AI Strategist". */
  title: string;
  tagline?: string;
  /** Optional person name shown above the style title. */
  name?: string;
};

/**
 * Profile banner (LinkedIn or X). Cards stay clear of the left avatar crop; a quiet
 * "Made with StackFlex" mark sits bottom-right, outside typical platform overlays.
 * Optional `profile` adds the same working-style identity used on the AI profile card.
 */
export function BannerArt({
  tools,
  theme = "light",
  ratio = "4 / 1",
  profile,
  className = "",
}: {
  tools: Tool[];
  theme?: ArtTheme;
  ratio?: string;
  profile?: BannerProfile;
  className?: string;
}) {
  const dark = theme === "dark";
  const muted = dark ? "#A8A59C" : "#6B6860";
  const ink = dark ? "#FFFFFF" : "#0B0B0C";
  const body = dark ? "#C9C6D6" : "#55534D";
  const hasIdentity = Boolean(profile?.title);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: ratio,
        containerType: "inline-size",
        background: ART_BACKGROUND[theme],
      }}
    >
      <Atmosphere dark={dark} />
      {hasIdentity ? (
        <div
          className="absolute inset-y-0 flex items-center"
          style={{ left: "22.5cqw", right: "3cqw", gap: "2.4cqw" }}
        >
          <div className="min-w-0 flex-[0.95] text-left">
            {profile?.name ? (
              <p
                className="font-display font-semibold tracking-[-0.03em]"
                style={{ fontSize: "2.2cqw", lineHeight: 1.15, color: muted, margin: 0 }}
              >
                {profile.name}
              </p>
            ) : null}
            <p
              className="font-display font-medium tracking-[-0.045em]"
              style={{
                fontSize: "4.4cqw",
                lineHeight: 1.05,
                color: ink,
                margin: profile?.name ? "0.35cqw 0 0" : 0,
              }}
            >
              {profile!.title}
            </p>
            {profile?.tagline ? (
              <p
                style={{
                  fontSize: "2cqw",
                  lineHeight: 1.3,
                  color: body,
                  margin: "0.7cqw 0 0",
                  maxWidth: "34cqw",
                  textWrap: "balance",
                }}
              >
                {profile.tagline}
              </p>
            ) : null}
          </div>
          <div className="min-w-0 flex-[1.15]">
            <StackBoard tools={tools} layout="row" gap="1cqw" className="justify-end" />
          </div>
        </div>
      ) : (
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: "23.4cqw", right: "3cqw" }}>
          <StackBoard tools={tools} layout="row" gap="1cqw" className="justify-center" />
        </div>
      )}
      <div
        className="absolute flex items-center"
        style={{ right: "2.8cqw", bottom: "2.4cqw", gap: "0.9cqw" }}
      >
        <Mark size="2.4cqw" outline={ART_BACKGROUND[theme]} />
        <span className="font-display font-medium tracking-[-0.02em]" style={{ fontSize: "2cqw", color: muted }}>
          Made with StackFlex
        </span>
      </div>
    </div>
  );
}
