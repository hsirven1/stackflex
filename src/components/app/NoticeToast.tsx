"use client";

import { createPortal } from "react-dom";
import { dismissNotice, useNotice } from "@/lib/selection/store";

/** Polite, unobtrusive status line for selection feedback (limit reached, duplicates, adds, undo). */
export function NoticeToast() {
  const notice = useNotice();
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      data-keep-live
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 lg:bottom-6"
    >
      {notice && (
        <p
          key={notice.id}
          className="flex items-center gap-3 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_30px_-10px_rgba(18,20,23,0.5)]"
        >
          {notice.text}
          {notice.action && (
            <button
              type="button"
              onClick={() => {
                notice.action?.run();
                dismissNotice();
              }}
              className="pointer-events-auto -my-1 rounded-md border border-white/30 px-2 py-1 text-xs font-semibold hover:bg-white/10"
            >
              {notice.action.label}
            </button>
          )}
        </p>
      )}
    </div>,
    document.body,
  );
}
