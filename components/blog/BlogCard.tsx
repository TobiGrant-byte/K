"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BlogImage from "@/components/blog/BlogImage";
import {
  DEFAULT_BLOG_AUTHOR,
  formatPostDate,
  htmlToPlainText,
  type BlogPost,
} from "@/lib/blog";
import { subscribeToPostEngagementCounts } from "@/lib/firebase/engagement";

export default function BlogCard({ post }: { post: BlogPost }) {
  const img = post.coverImage;
  const excerptText = htmlToPlainText(post.excerpt);
  const [loves, setLoves] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    return subscribeToPostEngagementCounts(post.id, (counts) => {
      setLoves(counts.loves);
      setComments(counts.comments);
    });
  }, [post.id]);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-navy-800/10 bg-white no-underline shadow-[0_8px_30px_rgba(10,22,40,0.04)] transition-colors duration-300 hover:border-accent/40"
    >
      <div className="relative">
        {img ? (
          <BlogImage src={img} alt="" className="bg-off-white" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,rgba(74,143,232,0.12),rgba(247,248,250,1))]">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-accent/70">
              No image
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,22,40,0.35)_0%,transparent_45%)]" />
        <span className="absolute bottom-3 left-4 font-title text-[9px] uppercase tracking-[2px] text-white">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <span className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-text-muted">
          {formatPostDate(post.createdAt)}
        </span>
        <span className="mb-2 text-[12px] text-text-muted">
          By {post.author || DEFAULT_BLOG_AUTHOR}
        </span>
        <h3 className="mb-2 font-display text-[22px] font-medium leading-[1.25] text-navy-800 transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        {excerptText ? (
          <p className="line-clamp-3 flex-1 text-[13px] leading-[1.75] text-text-secondary">
            {excerptText}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-text-muted">
            <span
              className="inline-flex h-4 items-center gap-1 leading-none"
              title={`${loves} love${loves === 1 ? "" : "s"}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="block h-3.5 w-3.5 shrink-0 text-rose-500"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 21s-6.7-4.35-9.33-7.4C.5 10.9 1.1 7.2 3.9 5.55 6.2 4.2 8.85 5 12 7.6c3.15-2.6 5.8-3.4 8.1-2.05 2.8 1.65 3.4 5.35 1.23 7.05C18.7 16.65 12 21 12 21Z" />
              </svg>
              <span className="font-title text-[10px] leading-none tabular-nums tracking-wide">
                {loves}
              </span>
              <span className="sr-only">
                {loves} love{loves === 1 ? "" : "s"}
              </span>
            </span>
            <span
              className="inline-flex h-4 items-center gap-1 leading-none"
              title={`${comments} comment${comments === 1 ? "" : "s"}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="block h-3.5 w-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 6.25A2.75 2.75 0 0 1 7.25 3.5h9.5a2.75 2.75 0 0 1 2.75 2.75v6.5a2.75 2.75 0 0 1-2.75 2.75H10.2L6 19.5v-3.5A2.75 2.75 0 0 1 4.5 13.5v-7.25Z"
                />
              </svg>
              <span className="font-title text-[10px] leading-none tabular-nums tracking-wide">
                {comments}
              </span>
              <span className="sr-only">
                {comments} comment{comments === 1 ? "" : "s"}
              </span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 font-title text-[9px] uppercase leading-none tracking-[2px] text-text-muted transition-colors group-hover:text-accent">
            Read post
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
