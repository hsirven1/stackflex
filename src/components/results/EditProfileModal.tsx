"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { focusRing, LinkedInIcon } from "@/components/stackflex/Controls";
import { StackProfileAvatar } from "@/components/share/StackProfileIdentity";
import { profileDisplayAvatar, profileInitials, saveProfile, useProfile } from "@/lib/profile/store";
import { NAME_MAX, TITLE_MAX, type ProfileIdentity } from "@/lib/profile/types";
import { GhostButton, UtilityButton } from "./ResultsUI";

/**
 * Modal to personalize the Stack Page identity.
 * LinkedIn import is shown only when the server reports credentials are configured.
 */
export function EditProfileModal({
  onClose,
  returnFocusTo,
  linkedInConfigured,
  pendingImport,
}: {
  onClose: () => void;
  returnFocusTo: RefObject<HTMLElement | null>;
  linkedInConfigured: boolean;
  pendingImport?: { name: string; picture: string | null } | null;
}) {
  const saved = useProfile();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<ProfileIdentity>(() => ({ ...saved }));
  const [importNote, setImportNote] = useState("");
  const appliedImport = useRef(false);

  useEffect(() => {
    if (!pendingImport || appliedImport.current) return;
    appliedImport.current = true;
    setDraft((d) => ({
      ...d,
      displayName: pendingImport.name || d.displayName,
      avatarPreview: pendingImport.picture || d.avatarPreview,
      // Never auto-set durable avatarReference from LinkedIn CDN (not stable for public links).
      identitySource: "linkedin",
    }));
    setImportNote(
      pendingImport.picture
        ? "Imported name and photo preview from LinkedIn. Photo is local-only until durable storage is configured — share links will use initials."
        : "Imported name from LinkedIn. Review and save when ready.",
    );
  }, [pendingImport]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const background = [...document.body.children].filter(
      (el) => el !== root && !el.hasAttribute("inert") && !(el as HTMLElement).dataset.keepLive,
    );
    background.forEach((el) => el.setAttribute("inert", ""));
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const opener = returnFocusTo.current;
    dialogRef.current?.focus();
    return () => {
      background.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  function cancel() {
    onClose();
  }

  function save(e?: FormEvent) {
    e?.preventDefault();
    saveProfile({
      ...draft,
      displayName: draft.displayName.trim(),
      professionalTitle: draft.professionalTitle.trim(),
      identitySource: draft.identitySource ?? "manual",
    });
    onClose();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  }

  const previewSrc = profileDisplayAvatar(draft);

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/35" onClick={cancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative z-10 flex max-h-[min(92svh,720px)] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[22px] bg-white shadow-[0_24px_64px_-28px_rgba(11,11,12,.55)] outline-none sm:rounded-[22px]"
      >
        <header className="flex flex-none items-start justify-between gap-3 border-b border-[#ECEAE4] px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-[20px] font-semibold tracking-[-0.03em]">
              Personalize your AI page
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-sf-muted">
              Add a few details so people know whose stack they&apos;re viewing.
            </p>
          </div>
          <button
            type="button"
            onClick={cancel}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sf-muted hover:bg-[#F3F1EB] hover:text-sf-ink ${focusRing}`}
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2.2} />
          </button>
        </header>

        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
            {linkedInConfigured ? (
              <div className="rounded-[14px] border border-[#E8E5DE] bg-[#FAF9F6] px-3.5 py-3">
                <p className="text-[13px] font-semibold text-sf-ink">Import from LinkedIn</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-sf-muted">
                  Use your LinkedIn name and profile photo to get started.
                </p>
                <a
                  href="/api/auth/linkedin?return=/"
                  className={`mt-2.5 inline-flex h-10 items-center gap-2 rounded-full bg-[#0A66C2] px-3.5 text-[13px] font-semibold text-white hover:bg-[#0A66C2]/90 ${focusRing}`}
                >
                  <LinkedInIcon size={14} />
                  Continue with LinkedIn
                </a>
                <div className="my-3 flex items-center gap-3 text-[11px] font-semibold tracking-[0.06em] text-sf-subtle uppercase">
                  <span className="h-px flex-1 bg-[#E3E0D8]" />
                  Or enter your details manually
                  <span className="h-px flex-1 bg-[#E3E0D8]" />
                </div>
              </div>
            ) : (
              <p className="text-[12.5px] leading-snug text-sf-muted">
                Enter your details manually. LinkedIn import activates when{" "}
                <code className="rounded bg-[#F3F1EB] px-1 py-0.5 text-[11px]">LINKEDIN_CLIENT_ID</code> and{" "}
                <code className="rounded bg-[#F3F1EB] px-1 py-0.5 text-[11px]">LINKEDIN_CLIENT_SECRET</code> are
                configured.
              </p>
            )}

            {importNote && <p className="text-[12.5px] leading-snug text-sf-body">{importNote}</p>}

            <div className="flex flex-col items-center gap-2">
              <StackProfileAvatar
                src={previewSrc}
                size="full"
                initials={draft.displayName.trim() ? profileInitials(draft.displayName) : ""}
              />
              <p className="text-[11px] text-sf-subtle">
                {draft.avatarReference
                  ? "Public photo included in share links"
                  : draft.avatarPreview
                    ? "Local preview only — not embedded in share links"
                    : "Initials or placeholder on public pages"}
              </p>
            </div>

            <label className="block">
              <span className="text-[12px] font-semibold text-sf-muted">Full name</span>
              <input
                type="text"
                value={draft.displayName}
                maxLength={NAME_MAX}
                placeholder="Your name"
                onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
                className={`mt-1.5 h-11 w-full rounded-full border border-[#DAD7CF] bg-white px-4 text-[14px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
              />
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold text-sf-muted">Professional title</span>
              <input
                type="text"
                value={draft.professionalTitle}
                maxLength={TITLE_MAX}
                placeholder="Product Manager, Designer, Consultant…"
                onChange={(e) => setDraft((d) => ({ ...d, professionalTitle: e.target.value }))}
                className={`mt-1.5 h-11 w-full rounded-full border border-[#DAD7CF] bg-white px-4 text-[14px] text-sf-ink placeholder:text-sf-faint ${focusRing}`}
              />
            </label>
          </div>

          <footer className="flex flex-none items-center justify-end gap-2 border-t border-[#ECEAE4] px-5 py-3.5">
            <GhostButton type="button" onClick={cancel}>
              Cancel
            </GhostButton>
            <UtilityButton type="submit">Save changes</UtilityButton>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
