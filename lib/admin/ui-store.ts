import { create } from "zustand";

export type AdminSection =
  | "overview"
  | "blog-posts"
  | "gallery"
  | "about"
  | "research-dev"
  | "publications"
  | "scholarship"
  | "achievements"
  | "philanthropy";

type AdminUiState = {
  section: AdminSection;
  sidebarOpen: boolean;
  /** When set, Posts section shows comments for this post. */
  commentsPostId: string | null;
  setSection: (section: AdminSection) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openPostComments: (postId: string) => void;
  clearPostComments: () => void;
};

/** Client/UI state only — not server data. */
export const useAdminUiStore = create<AdminUiState>((set) => ({
  section: "overview",
  sidebarOpen: false,
  commentsPostId: null,
  setSection: (section) =>
    set({ section, sidebarOpen: false, commentsPostId: null }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openPostComments: (postId) =>
    set({
      section: "blog-posts",
      commentsPostId: postId,
      sidebarOpen: false,
    }),
  clearPostComments: () => set({ commentsPostId: null }),
}));
