// Example: render the card on its own at 1080×1350 for the EXISTING image pipeline.
// Use as the page your Playwright/Puppeteer export visits (e.g. app/export/card/page.tsx),
// or mount it offscreen before calling html-to-image. Adapt `loadProfile` to your data.
import { AIProfileCard } from "../components";
import type { AIProfile, CardLook, CardTheme } from "../lib/types";

declare function loadProfile(id: string): Promise<AIProfile>; // ← your existing loader

export default async function CardExport({ searchParams }: { searchParams: { id: string; theme?: CardTheme; look?: CardLook } }) {
  const profile = await loadProfile(searchParams.id);
  return (
    <div data-sf-export="" style={{ width: 1080, height: 1350, background: "transparent" }}>
      <AIProfileCard profile={profile} theme={searchParams.theme ?? "dark"} look={searchParams.look ?? "holo"} width={1080} elevated={false} animate={false} />
    </div>
  );
}
