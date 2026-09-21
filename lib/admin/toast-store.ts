import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type AdminToast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: AdminToast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const MAX_TOASTS = 4;

/** Ephemeral UI notifications — not server state. */
export const useAdminToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "info") => {
    const text = message.trim();
    if (!text) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message: text, tone }].slice(-MAX_TOASTS),
    }));
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clear: () => set({ toasts: [] }),
}));

export const adminToast = {
  success: (message: string) => useAdminToastStore.getState().push(message, "success"),
  error: (message: string) => useAdminToastStore.getState().push(message, "error"),
  info: (message: string) => useAdminToastStore.getState().push(message, "info"),
};
