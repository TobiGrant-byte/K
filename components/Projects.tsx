"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type ProjectItem,
  type ProjectsContent,
} from "@/lib/domains/projects";
import { isImageKitMediaUrl } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

type Props = {
  projects: ProjectsContent;
  mediaById?: Record<string, MediaPick>;
};

function ProjectCard({
  item,
  media,
}: {
  item: ProjectItem;
  media: MediaPick;
}) {
  const hasImage =
    Boolean(media?.imageUrl) &&
    Boolean(item.image) &&
    isImageKitMediaUrl(media!.imageUrl);
  const alt = media?.altText || media?.title || item.title;

  const body = (
    <>
      <div className="relative">
        {hasImage && media ? (
          <div className="img-zoom relative aspect-[16/10] overflow-hidden bg-off-white">
            <ManagedImage
              media={media}
              config={item.imageConfig}
              alt={alt}
              imageClassName="transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[linear-gradient(145deg,rgba(74,143,232,0.12),rgba(247,248,250,1))]">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-accent/70">
              No image
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(10,22,40,0.35)_0%,transparent_45%)]" />
        <span className="absolute bottom-3 left-4 font-title text-[9px] uppercase tracking-[2px] text-white">
          {item.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        {item.title ? (
          <h3 className="mb-2 font-display text-[22px] font-medium leading-[1.25] text-navy-800 transition-colors group-hover:text-accent">
            {item.title}
          </h3>
        ) : null}
        {item.summary ? (
          <p className="text-[13px] leading-[1.75] text-text-secondary">
            {item.summary}
          </p>
        ) : null}
        {item.highlights.length ? (
          <ul className="mt-4 space-y-1.5 pl-5 text-[13px] leading-[1.65] text-text-muted">
            {item.highlights.map((point, idx) => (
              <li key={`${item.id}-h-${idx}`} className="list-disc">
                {point}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const cardClass =
    "group flex h-full flex-col overflow-hidden rounded-xl border border-navy-800/10 bg-white shadow-[0_8px_30px_rgba(10,22,40,0.04)] transition-colors duration-300 hover:border-accent/40";

  if (item.href) {
    return (
      <a
        href={item.href}
        {...(item.href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={`${cardClass} no-underline text-inherit`}
      >
        {body}
      </a>
    );
  }

  return <article className={cardClass}>{body}</article>;
}

export default function Projects({ projects, mediaById = {} }: Props) {
  const [category, setCategory] = useState<ProjectCategory | "All">("All");

  const filtered =
    category === "All"
      ? projects.items
      : projects.items.filter((item) => item.category === category);

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
              {projects.eyebrow || "Projects"}
            </span>
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-navy-800">
            {projects.title || "Projects"}{" "}
            {projects.titleAccent ? (
              <em className="font-semibold text-accent">
                {projects.titleAccent}
              </em>
            ) : null}
          </h1>
          {projects.subtitle ? (
            <p className="mt-4 font-display text-lg italic leading-[1.7] text-text-secondary">
              {projects.subtitle}
            </p>
          ) : null}
        </motion.div>

        <div className="mb-10 flex flex-wrap gap-2">
          {(["All", ...PROJECT_CATEGORIES] as const).map((c) => (
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

        {filtered.length === 0 ? (
          <p className="font-display text-lg italic text-text-muted">
            No projects in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => {
              const media =
                (item.image?.galleryImageId &&
                  mediaById[item.image.galleryImageId]) ||
                null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  className="h-full"
                >
                  <ProjectCard item={item} media={media} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
