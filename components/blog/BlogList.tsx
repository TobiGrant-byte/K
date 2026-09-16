"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import BlogCard from "@/components/blog/BlogCard";
import {
  postListsAreEqual,
  readCachedPostList,
  writeCachedPost,
  writeCachedPostList,
} from "@/lib/blog-cache";
import { BLOG_CATEGORIES, type BlogCategory, type BlogPost } from "@/lib/blog";
import { subscribeToPublishedPosts } from "@/lib/firebase/posts";

function subscribeNoop() {
  return () => {};
}

export default function BlogList() {
  const cached = useSyncExternalStore(
    subscribeNoop,
    readCachedPostList,
    () => null,
  );
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [category, setCategory] = useState<BlogCategory | "All">("All");
  const [error, setError] = useState("");

  const displayPosts = posts ?? cached ?? [];
  const showingCache = posts === null && Boolean(cached?.length);
  const loading = posts === null && !cached?.length;

  useEffect(() => {
    return subscribeToPublishedPosts(
      (nextPosts) => {
        setPosts((prev) => {
          const current = prev ?? readCachedPostList();
          if (current && postListsAreEqual(current, nextPosts)) {
            return prev ?? current;
          }
          return nextPosts;
        });
        writeCachedPostList(nextPosts);
        for (const post of nextPosts.slice(0, 12)) {
          writeCachedPost(post);
        }
        setError("");
      },
      (nextError) => {
        if (!readCachedPostList()?.length) {
          setError(`Could not load blog posts: ${nextError.message}`);
        }
      },
    );
  }, []);

  const filtered =
    category === "All"
      ? displayPosts
      : displayPosts.filter((p) => p.category === category);

  return (
    <section className="section-pad relative min-h-[calc(100vh-72px)] overflow-hidden bg-off-white">
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="font-title text-[10px] uppercase tracking-[4px] text-black">
              Blog
            </span>
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-navy-800">
            Posts on life,{" "}
            <em className="font-semibold text-accent">work &amp; society</em>
          </h1>
          <p className="mt-4 font-display text-lg italic leading-[1.7] text-text-secondary">
            Notes on family, career, and the world beyond the résumé — in Dr.
            Okafor&apos;s own words.
          </p>
        </motion.div>

        <div className="mb-10 flex flex-wrap gap-2">
          {(["All", ...BLOG_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 font-title text-[9px] uppercase tracking-[2px] transition-colors ${
                category === c
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-navy-800/10 bg-white text-text-muted hover:border-navy-800/25 hover:text-navy-800"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-display text-lg italic text-text-muted">
            Loading…
          </p>
        ) : error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <p className="font-display text-lg italic text-text-muted">
            No published posts in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={showingCache ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: showingCache ? 0 : i * 0.06,
                }}
                className="h-full"
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
