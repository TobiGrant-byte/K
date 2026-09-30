"use client";

import { useAdminUiStore } from "@/lib/admin/ui-store";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { useAdminComments, useAdminPosts } from "@/lib/domains/blog";
import { useMediaLibrary } from "@/lib/domains/media";

function formatCount(value: number): string {
  return value.toLocaleString();
}

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

  const summaryCards = [
    {
      label: "Published",
      value: postsQuery.isPending ? "…" : formatCount(published),
      hint: "Live on /blog",
      action: () => setSection("blog-posts"),
    },
    {
      label: "Drafts",
      value: postsQuery.isPending ? "…" : formatCount(drafts),
      hint: "Unpublished posts",
      action: () => setSection("blog-posts"),
    },
    {
      label: "Comments",
      value: commentsQuery.isPending ? "…" : formatCount(comments.length),
      hint: "Across all posts",
      action: () => setSection("blog-posts"),
    },
    {
      label: "Media",
      value: mediaQuery.isPending ? "…" : formatCount(media.length),
      hint: `${inGallery} in gallery`,
      action: () => setSection("gallery"),
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
    projects: "Engineering project areas",
    "research-dev": "R&D and Research in Action",
    publications: "Press and scholarship tips",
    gallery: "Upload and manage images",
    "blog-posts": "Blog articles and comments",
    achievements: "Milestones and Career Journey",
    philanthropy: "Community impacts",
    "manage-admins": "Invite and manage CMS administrators",
    settings: "Your username and password",
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Dashboard
        </div>
        <h2 className="mt-1 font-display text-3xl font-light text-white">
          Overview
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Content at a glance. Jump into a section to edit the public site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
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
            <p className="mt-2 text-xs text-white/40">{card.hint}</p>
            {card.action ? (
              <button
                type="button"
                onClick={card.action}
                className="mt-4 font-title text-[9px] uppercase tracking-[2px] text-accent hover:text-accent-light"
              >
                Open →
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-navy-800 p-5 sm:p-6">
        <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Content
        </div>
        <h3 className="mt-1 font-display text-2xl font-light text-white">
          Edit sections
        </h3>
        <p className="mt-1 text-sm text-white/45">
          Jump into a CMS section to update site content.
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
    </div>
  );
}
