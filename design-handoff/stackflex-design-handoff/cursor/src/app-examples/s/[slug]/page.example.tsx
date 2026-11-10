// Example public profile route. ADAPT: replace `loadSnapshot` with your existing snapshot decoder.
// This file shows wiring only; it holds no business logic and no mock data.
import { PersonalProfile } from "@/components/stackflex/profile";
import type { ProfileData } from "@/lib/stackflex/profile";

// import { loadSnapshot, toProfileData } from "@/lib/your-existing-snapshot";
declare function loadSnapshot(slug: string): Promise<unknown>;
declare function toProfileData(snapshot: unknown): ProfileData;

export default async function PublicProfilePage({ params }: { params: { slug: string } }) {
  const data = toProfileData(await loadSnapshot(params.slug));
  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <div className="relative mx-auto max-w-[1200px] px-4 py-8 sm:px-[79px] sm:py-[72px]">
        <div aria-hidden className="pointer-events-none absolute -top-[30%] left-[30%] right-[-10%] h-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(58,46,255,.06),transparent)]" />
        <PersonalProfile data={data} variant="page" />
      </div>
    </main>
  );
}
