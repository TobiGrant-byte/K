"use client";

import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import type { BlogPost } from "@/lib/blog";
import { formatPostDate } from "@/lib/blog";

export default function BlogCard({ post }: { post: BlogPost }) {
  const img = post.coverImage || post.images[0];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] no-underline transition-colors duration-300 hover:border-accent/40"
    >
      <div className="relative">
        {img ? (
          <BlogImage src={img} alt="" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,rgba(74,143,232,0.15),rgba(5,13,26,0.9))]">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light/60">
              No image
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.45)_0%,transparent_45%)]" />
        <span className="absolute bottom-3 left-4 font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        <span className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
          {formatPostDate(post.createdAt)}
        </span>
        <h3 className="mb-2 font-display text-[22px] font-medium leading-[1.25] text-white transition-colors group-hover:text-accent-light">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-[13px] leading-[1.75] text-white/50">{post.excerpt}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/35 transition-colors group-hover:text-accent-light">
          Read reflection
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
