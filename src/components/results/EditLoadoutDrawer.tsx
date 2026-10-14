"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { CategoryGrid } from "@/components/builder/CategoryGrid";
import { LoadoutDock } from "@/components/builder/LoadoutDock";
import { focusRing, SecondaryButton } from "@/components/stackflex/Controls";
import { beginDraft, discardDraft, saveDraft, useDraft } from "@/lib/selection/store";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The full six-category editor in a panel from the left, editing a draft of the loadout.
 * Save commits the draft; Cancel, the close button or Escape discard it.
 */
export function EditLoadoutDrawer({
  onClose,
  returnFocusTo,
}: {
  onClose: () => void;
  /** Focused on close. Safari doesn't focus buttons on click, so the opener can't be read from activeElement. */
  returnFocusTo: RefObject<HTMLElement | null>;
}) {
  const draft = useDraft();
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // The draft lives exactly as long as this effect, so a re-run (StrictMode, remount) starts a fresh one.
    beginDraft();
    // Everything already on the page becomes inert; popovers opened later from inside stay usable.
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
      discardDraft();
      background.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, [returnFocusTo]);

  function cancel() {
    discardDraft();
    onClose();
  }

  function save() {
    saveDraft();
    onClose();
  }

  function onKeyDown(e: KeyboardEvent) {
    const dialog = dialogRef.current;
    // Keys inside a "See more" or model popover belong to that popover.
    if (!dialog || e.defaultPrevented || (e.target as HTMLElement).closest('[role="dialog"]') !== dialog) return;
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key !== "Tab") return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const empty = !draft || draft.items.length === 0;

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-40 flex" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className="absolute inset-0 animate-fade-in bg-sf-ink/40" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full animate-drawer-in flex-col bg-white text-sf-ink shadow-[16px_0_48px_-24px_rgba(11,11,12,0.55)] outline-none sm:w-[clamp(480px,40vw,640px)]"
      >
        <div className="flex h-[72px] shrink-0 items-center gap-2 border-b border-sf-line pl-5 pr-3 sm:pl-6">
          <h2 id={titleId} className="font-display text-[24px] font-medium tracking-[-0.035em]">
            Edit your stack
          </h2>
          <button
            type="button"
            onClick={cancel}
            aria-label="Close without saving"
            className={`ml-auto inline-flex size-11 items-center justify-center rounded-full text-sf-muted hover:bg-sf-chip hover:text-sf-ink ${focusRing}`}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 sm:px-4">
          {draft && (
            <div className="flex flex-col gap-3 pt-3">
              <LoadoutDock stack={draft} hydrated inOverlay />
              <CategoryGrid stack={draft} singleColumn />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-sf-line px-5 py-4 sm:px-6">
          <SecondaryButton size="sm" onClick={cancel}>
            Cancel
          </SecondaryButton>
          <button
            type="button"
            onClick={save}
            disabled={empty}
            title={empty ? "Add at least one tool" : undefined}
            className={`inline-flex h-11 items-center rounded-full bg-sf-ink px-[22px] text-[15px] font-semibold text-white hover:bg-sf-ink/85 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
