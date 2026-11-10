import { AIProfileCard } from "@/components/stackflex/results";
import { LANDING_DECK_BACK, LANDING_SAMPLE_PROFILE } from "@/lib/stackflex/landing-sample-profile";
import type { AIProfile, CardTheme } from "@/components/stackflex/results/lib/types";

/**
 * Landing-only deck. One readable dark Builder card in front,
 * with a light Creative card and a light Strategist card fanned behind it.
 */
export function HeroCardDeck() {
  const [creative, strategist] = LANDING_DECK_BACK;

  return (
    <div
      role="img"
      aria-label="A deck of AI profile cards. AI Builder is in front, with AI Creative and AI Strategist behind it."
      className="relative mx-auto w-full max-w-[560px] px-1 py-8 sm:px-2 lg:justify-self-center lg:py-6"
    >
      <div className="relative mx-auto w-[min(100%,220px)] sm:w-[248px] lg:w-[268px]">
        {creative && (
          <BackCard
            profile={creative}
            theme="light"
            className="z-0 -top-1 origin-bottom -translate-x-[62%] -rotate-[7deg] scale-[0.94] sm:-top-2 sm:-translate-x-[88%] sm:-rotate-[16deg]"
          />
        )}
        {strategist && (
          <BackCard
            profile={strategist}
            theme="light"
            className="z-[1] top-0 origin-bottom -translate-x-[38%] rotate-[7deg] scale-[0.94] sm:-top-1 sm:-translate-x-[12%] sm:rotate-[16deg]"
          />
        )}
        <div className="relative z-[2]">
          <AIProfileCard
            profile={LANDING_SAMPLE_PROFILE}
            theme="dark"
            look="holo"
            presentation="hero"
            animate={false}
            elevated
            width="100%"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function BackCard({
  profile,
  theme,
  className,
}: {
  profile: AIProfile;
  theme: CardTheme;
  className: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 w-full ${className}`}
    >
      <AIProfileCard
        profile={profile}
        theme={theme}
        look="holo"
        presentation="hero"
        animate={false}
        elevated
        width="100%"
      />
    </div>
  );
}
