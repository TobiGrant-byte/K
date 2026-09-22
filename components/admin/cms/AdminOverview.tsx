"use client";

import Link from "next/link";
import {
  ADMIN_NAV,
  ADMIN_PUBLIC_QUICK_LINKS,
} from "@/lib/admin/nav";
import { useAdminUiStore } from "@/lib/admin/ui-store";
import { useAdminComments, useAdminPosts } from "@/lib/domains/blog";
import { useMediaLibrary } from "@/lib/domains/media";

export default function AdminOverview() {
  const setSection = useAdminUiStore((s) => s.setSection);
  const postsQuery = useAdminPosts();
  const commentsQuery = useAdminComments();
  const mediaQuery = useMediaLibrary();

  const posts = postsQuery.data ?? [];
  const comments = commentsQuery.data ?? [];
  const media = mediaQuery.data ?? [];
  const published = posts.filter((p) => p.published).length;
  const drafts = posts.length - published;
  const inGallery = media.filter((m) => m.showInGallery).length;

  const cards = [
    {
      label: "Published posts",
      value: postsQuery.isPending ? "…" : String(published),
      action: () => setSection("blog-posts"),
      actionLabel: "Manage posts",
    },
    {
      label: "Draft posts",
      value: postsQuery.isPending ? "…" : String(drafts),
      action: () => setSection("blog-posts"),
      actionLabel: "View drafts",
    },
    {
      label: "Comments",
      value: commentsQuery.isPending ? "…" : String(comments.length),
      action: () => setSection("blog-posts"),
      actionLabel: "Open posts",
    },
    {
      label: "Media library",
      value: mediaQuery.isPending ? "…" : String(media.length),
      action: () => setSection("gallery"),
      actionLabel: "Manage media",
    },
    {
      label: "Shown in Gallery",
      value: mediaQuery.isPending ? "…" : String(inGallery),
      action: () => setSection("gallery"),
      actionLabel: "Open media",
    },
  ];

  const editSections = ADMIN_NAV.filter(
    (item) =>
      item.enabled &&
      item.id !== "overview" &&
      item.id !== "scholarship",
  );

  const hints: Partial<Record<(typeof editSections)[number]["id"], string>> = {
    about: "Home roles, quote, About, and hobbies",
    "research-dev": "R&D and Research in Action",
    publications: "Press and scholarship tips",
    gallery: "Upload and manage images",
    "blog-posts": "Blog articles and comments",
    achievements: "Milestones and Career Journey",
    philanthropy: "Community impacts",
  };

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-white/50">
        Welcome to the content management system. Use the menu to edit site
        pages, blog posts, and media.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-white/10 bg-navy-800 p-5"
          >
            <div className="font-title text-[9px] uppercase tracking-[2px] text-white/50">
              {card.label}
            </div>
            <div className="mt-3 font-display text-4xl font-light text-white">
              {card.value}
            </div>
            <button
              type="button"
              onClick={card.action}
              className="mt-4 font-title text-[9px] uppercase tracking-[2px] text-accent hover:text-accent-light"
            >
              {card.actionLabel} →
            </button>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-navy-800 p-5 sm:p-6">
        <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Site content
        </div>
        <h2 className="mt-1 font-display text-2xl font-light text-white">
          Edit pages
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Open a section to edit shared page content in the CMS.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {editSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-navy-900/50 px-4 py-4 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <div>
                <div className="font-display text-lg text-white group-hover:text-accent-light">
                  {item.label}
                </div>
                <div className="mt-0.5 font-title text-[8px] uppercase tracking-[1.5px] text-white/40">
                  {hints[item.id] ?? item.label}
                </div>
              </div>
              <span
                aria-hidden
                className="font-title text-[10px] text-white/30 transition-colors group-hover:text-accent-light"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-navy-800 p-5 sm:p-6">
        <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Public site
        </div>
        <h2 className="mt-1 font-display text-2xl font-light text-white">
          Preview pages
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Open the live site to check how your edits look.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_PUBLIC_QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-navy-900/50 px-4 py-4 no-underline transition-colors hover:border-accent/40 hover:bg-accent/5"
            >
              <div>
                <div className="font-display text-lg text-white group-hover:text-accent-light">
                  {link.label}
                </div>
                <div className="mt-0.5 font-title text-[8px] uppercase tracking-[1.5px] text-white/40">
                  {link.hint}
                </div>
              </div>
              <span
                aria-hidden
                className="font-title text-[10px] text-white/30 transition-colors group-hover:text-accent-light"
              >
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
