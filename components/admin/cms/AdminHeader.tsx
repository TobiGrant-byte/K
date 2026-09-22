"use client";

import Link from "next/link";
import type { User } from "firebase/auth";
import {
  sectionBreadcrumb,
  sectionPublicLabel,
  sectionPublicPath,
  sectionTitle,
} from "@/lib/admin/nav";
import { useAdminUiStore } from "@/lib/admin/ui-store";

type Props = {
  user: User;
  onLogout: () => void;
};

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M18.4 5.6l-1.1 1.1M6.7 17.3l-1.1 1.1"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z"
      />
    </svg>
  );
}

export default function AdminHeader({ user, onLogout }: Props) {
  const section = useAdminUiStore((s) => s.section);
  const commentsPostId = useAdminUiStore((s) => s.commentsPostId);
  const theme = useAdminUiStore((s) => s.theme);
  const toggleSidebar = useAdminUiStore((s) => s.toggleSidebar);
  const toggleTheme = useAdminUiStore((s) => s.toggleTheme);
  const crumbs = commentsPostId
    ? ["Admin", "Blog", "Posts", "Comments"]
    : sectionBreadcrumb(section);
  const title = commentsPostId ? "Comments" : sectionTitle(section);
  const publicPath = commentsPostId ? "/blog" : sectionPublicPath(section);
  const publicLabel = commentsPostId
    ? "View blog"
    : sectionPublicLabel(section);
  const isLight = theme === "light";

  return (
    <header
      data-admin-header
      className="sticky top-0 z-30 border-b border-white/10 bg-navy-900/95 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/12 text-white lg:hidden"
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate font-title text-[9px] uppercase tracking-[2px] text-white/50">
            {crumbs.join(" / ")}
          </div>
          <h1 className="truncate font-display text-xl font-medium text-white sm:text-2xl">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/12 text-white/70 transition-colors hover:border-accent/40 hover:text-accent-light"
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Dark mode" : "Light mode"}
          >
            {isLight ? <MoonIcon /> : <SunIcon />}
          </button>
          {publicPath && publicLabel ? (
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-accent/35 bg-accent/10 px-2.5 font-title text-[9px] uppercase tracking-[2px] text-accent-light no-underline transition-colors hover:bg-accent/20 sm:px-3"
            >
              <span className="hidden sm:inline">{publicLabel}</span>
              <span className="sm:hidden">View</span>
              <span aria-hidden className="text-[10px] opacity-70">
                ↗
              </span>
            </Link>
          ) : null}
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md border border-white/12 px-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/70 no-underline transition-colors hover:border-white/25 hover:text-white sm:px-3"
          >
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Site</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center rounded-md border border-white/12 px-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/70 transition-colors hover:border-accent/40 hover:text-accent sm:px-3"
            title={user.email || user.displayName || "Log out"}
          >
            <span className="hidden sm:inline">Log out</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
