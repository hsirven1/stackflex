"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ResultsPagePreview,
  YourPageHeader,
} from "@/components/stackflex/profile";
import {
  publishableActivities,
  reconcileActivitiesWithStack,
  useActivities,
} from "@/lib/activities";
import { copyText } from "@/lib/clipboard";
import { profileDisplayAvatar, useProfile } from "@/lib/profile/store";
import { createStackShareUrl } from "@/lib/stack-sharing";
import { toProfileDataFromLocal } from "@/lib/stackflex/toProfileData";
import { stackTools } from "@/lib/stackflex/tools";
import type { StackState } from "@/lib/selection/types";
import { ActivitiesInlinePanel } from "./ActivitiesInlinePanel";
import { EditProfileModal } from "./EditProfileModal";

const subscribeNoop = () => () => {};
const clientOrigin = () => window.location.origin;
const serverOrigin = () => "";

/**
 * Results "Your page": approved toolbar + horizontal-card profile preview.
 * Activity selection is inline inside the personal-page preview.
 */
export function YourStackPageSection({ stack }: { stack: StackState }) {
  const tools = useMemo(() => stackTools(stack), [stack]);
  const profile = useProfile();
  const activitiesState = useActivities();
  const origin = useSyncExternalStore(subscribeNoop, clientOrigin, serverOrigin);
  const stackToolIds = useMemo(() => stack.items.map((i) => i.id), [stack.items]);
  const reconciled = useMemo(
    () => reconcileActivitiesWithStack(activitiesState.items, stackToolIds),
    [activitiesState.items, stackToolIds],
  );
  const shareActivities = useMemo(
    () =>
      publishableActivities(reconciled, stackToolIds).map((a) => ({
        label: a.label,
        toolIds: a.toolIds,
      })),
    [reconciled, stackToolIds],
  );
  const previewActivities = useMemo(
    () =>
      publishableActivities(reconciled, stackToolIds).map((a) => ({
        id: a.id,
        label: a.label,
        toolIds: a.toolIds,
      })),
    [reconciled, stackToolIds],
  );
  const needsReassignment = reconciled.some((a) => a.toolIds.length === 0 && a.label.trim());
  const stackKey = useMemo(
    () => JSON.stringify({ items: stack.items, primaryId: stack.primaryId }),
    [stack.items, stack.primaryId],
  );
  const profileKey = `${profile.displayName}|${profile.professionalTitle}|${profile.avatarReference ?? ""}|${profile.avatarPreview ?? ""}`;
  const activitiesKey = shareActivities
    .map((a) => `${a.label}:${a.toolIds.join(",")}`)
    .join("|");

  const [status, setStatus] = useState("");
  const [lastUrl, setLastUrl] = useState("");
  const [localNote, setLocalNote] = useState(false);
  const [seenKey, setSeenKey] = useState(stackKey + profileKey + activitiesKey);
  const [editingProfile, setEditingProfile] = useState(false);
  const [linkedInConfigured, setLinkedInConfigured] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    name: string;
    picture: string | null;
  } | null>(null);
  const [fetchLinkedInImport, setFetchLinkedInImport] = useState(false);
  const [liCallbackHandled, setLiCallbackHandled] = useState(false);
  const editOpener = useRef<HTMLButtonElement | null>(null);

  const liCallback = useSyncExternalStore(
    subscribeNoop,
    () => {
      const li = new URLSearchParams(window.location.search).get("li");
      return li === "import" || li === "error" ? li : null;
    },
    () => null,
  );

  if (seenKey !== stackKey + profileKey + activitiesKey) {
    setSeenKey(stackKey + profileKey + activitiesKey);
    setLastUrl("");
    setStatus("");
    setLocalNote(false);
  }

  if (liCallback && !liCallbackHandled) {
    setLiCallbackHandled(true);
    setEditingProfile(true);
    if (liCallback === "import") setFetchLinkedInImport(true);
    if (liCallback === "error") {
      setStatus("LinkedIn import didn’t complete. Your manual details are unchanged.");
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("li");
    url.searchParams.delete("li_reason");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/linkedin/status")
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => {
        if (!cancelled) setLinkedInConfigured(Boolean(data.configured));
      })
      .catch(() => {
        if (!cancelled) setLinkedInConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fetchLinkedInImport) return;
    let cancelled = false;
    fetch("/api/auth/linkedin/import")
      .then((r) => r.json())
      .then((data: { ok?: boolean; import?: { name: string; picture: string | null } | null }) => {
        if (!cancelled && data.ok && data.import) setPendingImport(data.import);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFetchLinkedInImport(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchLinkedInImport]);

  const shareableProfile = useMemo(
    () => ({
      displayName: profile.displayName,
      professionalTitle: profile.professionalTitle,
      avatarReference: profile.avatarReference,
    }),
    [profile.displayName, profile.professionalTitle, profile.avatarReference],
  );

  const sharePreview = useMemo(() => {
    if (!origin || tools.length === 0) return null;
    try {
      return createStackShareUrl(stack, {
        origin,
        profile: shareableProfile,
        activities: shareActivities,
      });
    } catch {
      return null;
    }
  }, [stack, tools.length, origin, shareableProfile, shareActivities]);

  const previewUrl = sharePreview?.url ?? "";
  const isPubliclyAccessible = Boolean(sharePreview && !sharePreview.isLocal);
  const displayUrl = lastUrl || previewUrl;
  const avatarSrc = profileDisplayAvatar(profile);

  const profileData = useMemo(
    () =>
      toProfileDataFromLocal({
        stack,
        profile,
        avatarSrc,
        activities: previewActivities,
      }),
    [stack, profile, avatarSrc, previewActivities],
  );

  function buildUrl() {
    return createStackShareUrl(stack, {
      origin: window.location.origin,
      profile: shareableProfile,
      activities: shareActivities,
    });
  }

  async function copyLink() {
    setLocalNote(false);
    if (tools.length === 0) {
      setStatus("Add tools first.");
      return;
    }
    try {
      const { url, isLocal } = buildUrl();
      setLastUrl(url);
      setLocalNote(isLocal);
      if (await copyText(url)) {
        setStatus("");
        return;
      }
      setStatus("Select the URL and copy manually.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create link.";
      setStatus(message);
    }
  }

  function openPage() {
    if (tools.length === 0) {
      setStatus("Add tools first.");
      return;
    }
    try {
      const { url, isLocal } = buildUrl();
      setLastUrl(url);
      setLocalNote(isLocal);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not open page.";
      setStatus(message);
    }
  }

  return (
    <section aria-labelledby="format-stack-page" className="flex min-w-0 flex-col gap-4 lg:gap-5">
      <div id="format-stack-page" className="sr-only">
        Your page
      </div>
      <YourPageHeader
        url={displayUrl}
        isPublic={isPubliclyAccessible}
        disabled={tools.length === 0}
        onCopy={() => void copyLink()}
        onPreview={openPage}
      />

      {needsReassignment && (
        <p className="text-[12.5px] font-medium text-[#9A5B2E]">
          A tool left your stack — edit or remove activities that lost their tools before sharing.
        </p>
      )}

      <ResultsPagePreview
        data={profileData}
        onEditProfile={() => setEditingProfile(true)}
        editProfileRef={editOpener}
        activitiesSlot={<ActivitiesInlinePanel tools={tools} activities={reconciled} />}
      />

      <p role="status" className="text-[12.5px] font-medium text-sf-body empty:hidden">
        {status}
      </p>
      {localNote && (
        <p className="text-[12px] leading-snug text-sf-muted">
          Local testing URL — set{" "}
          <code className="rounded bg-[#F3F1EB] px-1 py-0.5 text-[11px]">NEXT_PUBLIC_SITE_URL</code>{" "}
          for a public domain.
        </p>
      )}

      {editingProfile && (
        <EditProfileModal
          onClose={() => {
            setEditingProfile(false);
            setPendingImport(null);
          }}
          returnFocusTo={editOpener}
          linkedInConfigured={linkedInConfigured}
          pendingImport={pendingImport}
        />
      )}
    </section>
  );
}
