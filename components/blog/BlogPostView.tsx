"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import ShareButtons from "@/components/blog/ShareButtons";
import BlogBody from "@/components/blog/BlogBody";
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
      <section className="section-pad min-h-[calc(100vh-72px)] bg-off-white">
        <div className="container">
          <p className="font-display text-lg italic text-text-muted">
            Loading…
          </p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="section-pad min-h-[calc(100vh-72px)] bg-off-white">
        <div className="container max-w-xl text-center">
          <h1 className="font-display text-4xl font-light text-navy-800">
            Post not found
          </h1>
          <p className="mt-3 font-display italic text-text-secondary">
            This post may have been removed or is not published yet.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-flex border border-navy-800/20 px-6 py-3.5 font-title text-[10px] uppercase tracking-[2.5px] text-navy-800 no-underline hover:bg-navy-800/5"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  const cover = post.coverImage || post.images[0];
  const extraImages = post.images.filter((img) => img !== cover);

  return (
    <article className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-off-white">
      {cover ? (
        <div className="relative w-full overflow-hidden">
          <div className="mx-auto w-full max-w-[1100px] px-0 sm:px-6">
            <BlogImage
              src={cover}
              alt=""
              className="bg-white sm:rounded-b-xl"
            />
          </div>
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
            className="mb-8 inline-flex items-center gap-2 font-title text-[9px] uppercase tracking-[2px] text-text-muted no-underline hover:text-accent"
          >
            ← All posts
          </Link>

          <div className="mb-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-display text-[16px] leading-none sm:text-[17px]">
            <span className="font-normal text-text-muted">{post.category}</span>
            <span className="select-none text-navy-800/25" aria-hidden>
              ·
            </span>
            <span className="font-medium text-navy-800">
              {post.author || DEFAULT_BLOG_AUTHOR}
            </span>
            <span className="select-none text-navy-800/25" aria-hidden>
              ·
            </span>
            <time
              dateTime={post.createdAt}
              className="font-normal text-text-secondary"
            >
              {formatPostDate(post.createdAt)}
            </time>
          </div>

          <h1 className="font-display text-[clamp(32px,5vw,52px)] font-light leading-[1.15] text-navy-800">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="mt-5 font-display text-xl italic leading-[1.7] text-navy-800/85">
              {post.excerpt}
            </p>
          ) : null}

          {extraImages.length > 0 ? (
            <div
              className={`mt-10 grid gap-4 ${
                extraImages.length > 1 ? "sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {extraImages.map((src) => (
                <div
                  key={src}
                  className="overflow-hidden rounded-xl border border-navy-800/10 bg-white"
                >
                  <BlogImage src={src} alt="" className="bg-off-white" />
                </div>
              ))}
            </div>
          ) : null}

          <BlogBody body={post.body} />

          <div className="mt-14 border-t border-navy-800/10 pt-8">
            <div className="mb-4 font-title text-[9px] uppercase tracking-[2px] text-text-muted">
              Share this post
            </div>
            <ShareButtons
              title={post.title}
              text={truncateShareExcerpt(post.excerpt) || undefined}
              url={`/blog/${post.slug}`}
              version={post.updatedAt || post.createdAt}
              tone="light"
            />
          </div>
        </motion.div>
      </div>
    </article>
  );
}
