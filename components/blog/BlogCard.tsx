"use client";

import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import {
  DEFAULT_BLOG_AUTHOR,
  formatPostDate,
  htmlToPlainText,
  type BlogPost,
} from "@/lib/blog";

export default function BlogCard({ post }: { post: BlogPost }) {
  const img = post.coverImage;
  const excerptText = htmlToPlainText(post.excerpt);

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
        <span className="mt-4 inline-flex items-center gap-1.5 font-title text-[9px] uppercase tracking-[2px] text-text-muted transition-colors group-hover:text-accent">
          Read post
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
