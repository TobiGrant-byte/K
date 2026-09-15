"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ShareButtons from "@/components/blog/ShareButtons";
import BlogImage from "@/components/blog/BlogImage";
import {
  DEFAULT_BLOG_AUTHOR,
  formatPostDate,
  truncateShareExcerpt,
  type BlogPost,
} from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

export default function BlogPostView() {
  const params = useParams();
  const slug = String(params.slug || "");
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    getPublishedPostBySlug(slug)
      .then((found) => {
        if (active) setPost(found);
      })
      .catch(() => {
        if (active) setPost(null);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (post === undefined) {
    return (
      <section className="section-pad bg-navy-800">
        <div className="container">
          <p className="font-display text-lg italic text-white/40">Loading…</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section-pad bg-navy-800">
        <div className="container max-w-xl text-center">
          <h1 className="font-display text-4xl font-light text-white">
            Post not found
          </h1>
          <p className="mt-3 font-display italic text-white/45">
            This post may have been removed or is not published yet.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-flex border border-white/25 px-6 py-3.5 font-title text-[10px] uppercase tracking-[2.5px] text-white no-underline hover:bg-white/5"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  const gallery = [
    ...(post.coverImage ? [post.coverImage] : []),
    ...post.images.filter((img) => img !== post.coverImage),
  ];

  return (
    <article className="relative overflow-hidden bg-navy-800">
      <div className="accent-wash" />

      {gallery[0] ? (
        <div className="relative w-full overflow-hidden">
          <div className="mx-auto w-full max-w-[1100px] px-0 sm:px-6">
            <BlogImage src={gallery[0]} alt="" className="sm:rounded-b-xl" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,22,40,0.85)_0%,transparent_55%)]" />
        </div>
      ) : null}

      <div className="container relative pb-20 pt-10 md:pb-28 md:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-[720px]"
        >
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 font-title text-[9px] uppercase tracking-[2px] text-white/40 no-underline hover:text-accent-light"
          >
            ← All posts
          </Link>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
              {post.category}
            </span>
            <span className="text-white/25">·</span>
            <span className="font-title text-[9px] uppercase tracking-[2px] text-white/50">
              {post.author || DEFAULT_BLOG_AUTHOR}
            </span>
            <span className="text-white/25">·</span>
            <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
              {formatPostDate(post.createdAt)}
            </span>
          </div>

          <h1 className="font-display text-[clamp(32px,5vw,52px)] font-light leading-[1.15] text-white">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 font-display text-xl italic leading-[1.7] text-white/50">
              {post.excerpt}
            </p>
          ) : null}

          <div className="mt-10 space-y-5 text-[15px] leading-[1.9] text-white/70">
            {post.body.split(/\n\n+/).map((para, i) => (
              <p key={i} className="m-0">
                {para}
              </p>
            ))}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.slice(1).map((src, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-white/10"
                >
                  <BlogImage src={src} alt="" />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-14 border-t border-white/10 pt-8">
            <div className="mb-4 font-title text-[9px] uppercase tracking-[2px] text-white/40">
              Share this post
            </div>
            <ShareButtons
              title={post.title}
              text={truncateShareExcerpt(post.excerpt) || undefined}
              url={`/blog/${post.slug}`}
              version={post.updatedAt || post.createdAt}
            />
            {/* <p className="mt-4 text-[12px] leading-relaxed text-white/35">
              LinkedIn, X, and Facebook open their share windows with this
              page&apos;s link — preview title, text, and image come from this
              post.
            </p> */}
          </div>
        </motion.div>
      </div>
    </article>
  );
}
