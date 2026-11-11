"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AI_PROFILE_CARD_EXPORT,
  AIProfileCard,
  AIProfileResults,
  BANNER_EXPORT_2X,
  LinkedInBanner,
  type CardTheme,
} from "@/components/stackflex/results";
import { StartOver } from "@/components/stackflex/StartOver";
import { canShareImageFile, copyText, shareImageDataUrl } from "@/lib/clipboard";
import { renderPng, saveDataUrl } from "@/lib/export/download";
import { track } from "@/lib/integrations/analytics";
import { roleLabel, type ProfessionalRole } from "@/lib/profile/roles";
import { profileDisplayAvatar, setProfile, useProfile } from "@/lib/profile/store";
import { resolveWorkingStyle } from "@/lib/profile/resolveWorkingStyle";
import { classifyWorkingStyle } from "@/lib/profile/workingStyle";
import type { StackState } from "@/lib/selection/types";
import { createStackShareUrl, resolveShareOrigin } from "@/lib/stack-sharing";
import { toAIProfile } from "@/lib/stackflex/toAIProfile";
import { stackTools } from "@/lib/stackflex/tools";
import { EditAiProfileModal } from "./EditAiProfileModal";

const CARD_FILE = "stackflex-ai-profile.png";
const BANNER_FILE = "stackflex-linkedin-banner.png";

function subscribeNothing() {
  return () => {};
}

function browserCanShareCard() {
  try {
    const probe = new File([new Uint8Array([137, 80, 78, 71])], CARD_FILE, { type: "image/png" });
    return canShareImageFile(probe);
  } catch {
    return false;
  }
}

function publicProfileUrl(
  stack: StackState,
  displayName: string,
  professionalTitle: string,
  professionalRole: ProfessionalRole | undefined,
  roleLabelText: string,
) {
  if (typeof window === "undefined" || stack.items.length === 0) return null;
  const { isLocal } = resolveShareOrigin({ origin: window.location.origin });
  if (isLocal) return null;
  try {
    const created = createStackShareUrl(stack, {
      origin: window.location.origin,
      profile: {
        displayName,
        professionalTitle: professionalTitle || roleLabelText,
        professionalRole,
      },
    });
    return created.isLocal ? null : created.url;
  } catch {
    return null;
  }
}

const CARD_THEME_KEY = "stackflex:card-theme";
const BANNER_THEME_KEY = "stackflex:banner-theme";
const cardThemeListeners = new Set<() => void>();
const bannerThemeListeners = new Set<() => void>();

function readStoredTheme(key: string, fallback: CardTheme): CardTheme {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v === "light" || v === "dark" ? v : fallback;
  } catch {
    return fallback;
  }
}

/** New profiles: Light card. Saved choices always win. */
function readCardTheme(): CardTheme {
  return readStoredTheme(CARD_THEME_KEY, "light");
}

/** New profiles: Dark banner. Independent of the card theme. */
function readBannerTheme(): CardTheme {
  return readStoredTheme(BANNER_THEME_KEY, "dark");
}

function subscribeCardTheme(onStoreChange: () => void) {
  cardThemeListeners.add(onStoreChange);
  return () => cardThemeListeners.delete(onStoreChange);
}

function subscribeBannerTheme(onStoreChange: () => void) {
  bannerThemeListeners.add(onStoreChange);
  return () => bannerThemeListeners.delete(onStoreChange);
}

function writeCardTheme(next: CardTheme) {
  try {
    localStorage.setItem(CARD_THEME_KEY, next);
  } catch {
    /* ignore */
  }
  cardThemeListeners.forEach((l) => l());
}

function writeBannerTheme(next: CardTheme) {
  try {
    localStorage.setItem(BANNER_THEME_KEY, next);
  } catch {
    /* ignore */
  }
  bannerThemeListeners.forEach((l) => l());
}

/**
 * Results studio: Claude Design card + LinkedIn banner from one shared AIProfile.
 */
export function AiProfileSection({
  stack,
  playReveal = false,
}: {
  stack: StackState;
  playReveal?: boolean;
}) {
  const profile = useProfile();
  const toolIds = useMemo(() => stack.items.map((i) => i.id), [stack.items]);
  const classified = useMemo(
    () => classifyWorkingStyle({ toolIds, role: profile.professionalRole }),
    [toolIds, profile.professionalRole],
  );
  const { style, hideTitle } = useMemo(
    () => resolveWorkingStyle(classified, profile.workingStylePreference, profile.professionalRole),
    [classified, profile.workingStylePreference, profile.professionalRole],
  );
  const roleLabelText = roleLabel(profile.professionalRole) || profile.professionalTitle;
  const aiProfile = useMemo(
    () =>
      toAIProfile(stack, style, {
        name: profile.displayName || undefined,
        role: roleLabelText || undefined,
        hideTitle,
      }),
    [stack, style, hideTitle, profile.displayName, roleLabelText],
  );

  const exportCardRef = useRef<HTMLDivElement>(null);
  const exportBannerRef = useRef<HTMLDivElement>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const cardTheme = useSyncExternalStore(subscribeCardTheme, readCardTheme, () => "light" as CardTheme);
  const bannerTheme = useSyncExternalStore(subscribeBannerTheme, readBannerTheme, () => "dark" as CardTheme);
  const fileShare = useSyncExternalStore(subscribeNothing, browserCanShareCard, () => false);
  const publicUrl = useSyncExternalStore(
    subscribeNothing,
    () => publicProfileUrl(stack, profile.displayName, profile.professionalTitle, profile.professionalRole, roleLabelText),
    () => null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const tools = useMemo(() => stackTools(stack), [stack]);
  const avatarUrl = profileDisplayAvatar(profile) ?? undefined;

  async function captureCard() {
    const node = exportCardRef.current;
    if (!node) throw new Error("Preview not ready.");
    await document.fonts.ready;
    return renderPng(node, {
      width: AI_PROFILE_CARD_EXPORT.width,
      height: AI_PROFILE_CARD_EXPORT.height,
      pixelRatio: 1,
      filename: CARD_FILE,
      backgroundColor: cardTheme === "dark" ? "#0B0B0E" : "#FFFFFF",
    });
  }

  async function captureBanner() {
    const node = exportBannerRef.current;
    if (!node) throw new Error("Banner not ready.");
    await document.fonts.ready;
    // True 2×: node is laid out at 3168×792 CSS px (absolute units). Capture 1:1.
    // Do not use pixelRatio:2 on a 1584 node — html-to-image would upscale a soft raster.
    return renderPng(node, {
      width: BANNER_EXPORT_2X.width,
      height: BANNER_EXPORT_2X.height,
      pixelRatio: 1,
      filename: BANNER_FILE,
      backgroundColor: bannerTheme === "dark" ? "#0B0B0E" : "#FFFFFF",
    });
  }

  async function downloadCard() {
    saveDataUrl(await captureCard(), CARD_FILE);
    track({ name: "card_downloaded", props: { theme: cardTheme } });
  }

  async function downloadBanner() {
    saveDataUrl(await captureBanner(), BANNER_FILE);
    track({ name: "banner_downloaded", props: { theme: bannerTheme } });
  }

  async function shareCard(): Promise<"shared" | "copied" | void> {
    try {
      if (fileShare) {
        const dataUrl = await captureCard();
        const result = await shareImageDataUrl(dataUrl, CARD_FILE, "My AI profile");
        if (result === "shared") return "shared";
        if (result === "aborted") return;
        if (result === "unsupported" && publicUrl) {
          const ok = await copyText(publicUrl);
          return ok ? "copied" : undefined;
        }
        if (result === "unsupported") {
          saveDataUrl(dataUrl, CARD_FILE);
          return;
        }
        return;
      }
      if (publicUrl) {
        const ok = await copyText(publicUrl);
        return ok ? "copied" : undefined;
      }
    } catch {
      /* quiet failure — button stays idle */
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AIProfileResults
        profile={aiProfile}
        cardTheme={cardTheme}
        onCardThemeChange={writeCardTheme}
        bannerTheme={bannerTheme}
        onBannerThemeChange={writeBannerTheme}
        look="holo"
        animateReveal={false}
        playReveal={playReveal}
        onDownloadCard={() => downloadCard()}
        onDownloadBanner={() => downloadBanner()}
        onShareCard={fileShare || publicUrl ? () => shareCard() : undefined}
        onCustomize={() => setEditOpen(true)}
        avatarUrl={avatarUrl}
        displayName={profile.displayName || undefined}
        headline={roleLabelText || undefined}
        headerEnd={
          <StartOver
            count={tools.length}
            label="Start over"
            className="!h-10 shrink-0 px-3.5 text-[13px] text-[#6F6D66] hover:text-[#0B0B0C]"
          />
        }
      />

      <button ref={editBtnRef} type="button" className="sr-only" tabIndex={-1} aria-hidden />

      {/*
        Dedicated native-resolution export surfaces — not the LinkedIn mockup.
        Kept in-layout (opacity 0) so fonts/images decode; never CSS-scaled for capture.
      */}
      <div
        aria-hidden
        data-sf-export=""
        className="pointer-events-none fixed top-0 left-0 z-[-1] overflow-hidden opacity-0"
        style={{ width: AI_PROFILE_CARD_EXPORT.width, height: AI_PROFILE_CARD_EXPORT.height }}
      >
        <AIProfileCard
          ref={exportCardRef}
          profile={aiProfile}
          theme={cardTheme}
          look="holo"
          width={AI_PROFILE_CARD_EXPORT.width}
          elevated={false}
          animate={false}
        />
      </div>
      <div
        aria-hidden
        data-sf-export=""
        className="pointer-events-none fixed top-0 left-0 z-[-1] overflow-hidden opacity-0"
        style={{ width: BANNER_EXPORT_2X.width, height: BANNER_EXPORT_2X.height }}
      >
        <LinkedInBanner
          ref={exportBannerRef}
          profile={aiProfile}
          theme={bannerTheme}
          width={BANNER_EXPORT_2X.width}
          animate={false}
        />
      </div>

      {editOpen && (
        <EditAiProfileModal
          stack={stack}
          onClose={() => setEditOpen(false)}
          returnFocusTo={editBtnRef}
        />
      )}
    </div>
  );
}

/** Sync profile role into title when empty — runs once after mount if needed. */
export function useEnsureRoleTitle() {
  const profile = useProfile();
  useEffect(() => {
    if (profile.professionalRole && !profile.professionalTitle.trim()) {
      setProfile({ professionalTitle: roleLabel(profile.professionalRole) });
    }
  }, [profile.professionalRole, profile.professionalTitle]);
}
