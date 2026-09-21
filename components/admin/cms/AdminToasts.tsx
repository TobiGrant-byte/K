"use client";

import { useEffect } from "react";
import {
  useAdminToastStore,
  type AdminToast,
  type ToastTone,
} from "@/lib/admin/toast-store";

const AUTO_DISMISS_MS = 4500;

const toneClass: Record<ToastTone, string> = {
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  error: "border-red-500/40 bg-red-500/15 text-red-100",
  info: "border-sky-500/40 bg-sky-500/15 text-sky-100",
};

const toneLabel: Record<ToastTone, string> = {
  success: "Success",
  error: "Error",
  info: "Info",
};

function ToastItem({ toast }: { toast: AdminToast }) {
  const dismiss = useAdminToastStore((s) => s.dismiss);

  useEffect(() => {
    const t = window.setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${toneClass[toast.tone]}`}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 font-title text-[8px] uppercase tracking-[2px] opacity-70">
          {toneLabel[toast.tone]}
        </div>
        <p className="leading-relaxed">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Dismiss notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-current/20 text-xs opacity-70 transition-opacity hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

/** Fixed top-right toast stack for the whole Admin. */
export default function AdminToasts() {
  const toasts = useAdminToastStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[100] flex flex-col items-end gap-2 sm:top-5 sm:right-5"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
