"use client";

import type { ReactNode } from "react";

type Props = {
  open: boolean;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /**
   * Custom footer actions. When set, replaces the default Cancel / Confirm
   * buttons — pass whatever buttons you need.
   */
  actions?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  /** Required when `actions` is omitted. */
  onConfirm?: () => void;
  onCancel: () => void;
  /** Confirm button style when using the default actions. */
  confirmTone?: "danger" | "accent";
};

/**
 * Shared Admin CMS confirmation dialog for delete / remove / destructive actions.
 * Pass eyebrow, title, description, and either default confirm handlers or custom `actions`.
 */
export default function AdminConfirmDialog({
  open,
  eyebrow = "Confirm",
  title,
  description,
  actions,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
  confirmTone = "danger",
}: Props) {
  if (!open) return null;

  const confirmClass =
    confirmTone === "accent"
      ? "rounded-lg bg-accent px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-50"
      : "rounded-lg border border-red-500/40 bg-red-500/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-red-300 hover:bg-red-500/25 disabled:opacity-50";

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
          {actions ?? (
            <>
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
                disabled={busy || !onConfirm}
                onClick={() => onConfirm?.()}
                className={confirmClass}
              >
                {confirmLabel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
