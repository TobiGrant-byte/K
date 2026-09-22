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

export type AdminTheme = "dark" | "light";

const ADMIN_THEME_KEY = "admin-theme";

const ADMIN_SECTIONS = new Set<AdminSection>([
  "overview",
  "blog-posts",
  "gallery",
  "about",
  "research-dev",
  "publications",
  "scholarship",
  "achievements",
  "philanthropy",
]);

export function isAdminSection(value: string): value is AdminSection {
  return ADMIN_SECTIONS.has(value as AdminSection);
}

function readStoredTheme(): AdminTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

type AdminUiState = {
  section: AdminSection;
  sidebarOpen: boolean;
  /** Admin CMS only — does not affect the public site. */
  theme: AdminTheme;
  /** When set, Posts section shows comments for this post. */
  commentsPostId: string | null;
  /** Skip one URL→store writeback after hydrating from the query string. */
  skipNextUrlSync: boolean;
  setSection: (section: AdminSection) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: AdminTheme) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
  openPostComments: (postId: string) => void;
  clearPostComments: () => void;
  /** Apply URL query on first load / external navigation. */
  hydrateFromUrl: (section: AdminSection, commentsPostId: string | null) => void;
  consumeSkipNextUrlSync: () => boolean;
};

/** Client/UI state only — not server data. */
export const useAdminUiStore = create<AdminUiState>((set, get) => ({
  section: "overview",
  sidebarOpen: false,
  theme: "dark",
  commentsPostId: null,
  skipNextUrlSync: false,
  setSection: (section) =>
    set({ section, sidebarOpen: false, commentsPostId: null }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => {
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(theme);
  },
  hydrateTheme: () => {
    const theme = readStoredTheme();
    if (theme !== get().theme) set({ theme });
  },
  openPostComments: (postId) =>
    set({
      section: "blog-posts",
      commentsPostId: postId,
      sidebarOpen: false,
    }),
  clearPostComments: () => set({ commentsPostId: null }),
  hydrateFromUrl: (section, commentsPostId) =>
    set({
      section,
      commentsPostId,
      sidebarOpen: false,
      skipNextUrlSync: true,
    }),
  consumeSkipNextUrlSync: () => {
    const skip = get().skipNextUrlSync;
    if (skip) set({ skipNextUrlSync: false });
    return skip;
  },
}));
