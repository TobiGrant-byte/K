"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlogCard from "@/components/blog/BlogCard";
import {
  BLOG_CATEGORIES,
  getPublishedPosts,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blog";

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState<BlogCategory | "All">("All");

  const refresh = () => setPosts(getPublishedPosts());

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("okafor-blog-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("okafor-blog-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const filtered =
    category === "All" ? posts : posts.filter((p) => p.category === category);

  return (
    <section className="section-pad relative overflow-hidden bg-navy-800">
      <div className="accent-wash" />
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="eyebrow">Blog</span>
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            Reflections on life,{" "}
            <em className="font-semibold text-accent-light">work &amp; society</em>
          </h1>
          <p className="mt-4 font-display text-lg italic leading-[1.7] text-white/45">
            Notes on family, career, and the world beyond the résumé — in Dr. Okafor&apos;s own words.
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
                  ? "border-accent/50 bg-accent/15 text-accent-light"
                  : "border-white/12 bg-transparent text-white/50 hover:border-white/25 hover:text-white/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="font-display text-lg italic text-white/40">
            No published reflections in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
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
