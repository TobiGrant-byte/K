"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Shared destructive-action confirmation for Admin CMS.
 */
export default function AdminConfirmDialog({
  open,
  eyebrow = "Confirm",
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 px-4 backdrop-blur-sm"
      onClick={() => (busy ? undefined : onCancel())}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="w-full max-w-md rounded-2xl border border-white/10 bg-navy-800 p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-red-400">
          {eyebrow}
        </div>
        <h2
          id="admin-confirm-title"
          className="font-display text-2xl font-light text-white"
        >
          {title}
        </h2>
        {description ? (
          <div className="mt-3 text-[14px] leading-relaxed text-white/50">
            {description}
          </div>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-lg border border-white/12 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="rounded-lg border border-red-500/40 bg-red-500/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-red-300 hover:bg-red-500/25 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
