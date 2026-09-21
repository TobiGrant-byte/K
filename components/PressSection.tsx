"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import {
  tipDisplayNumber,
  type PublicationsContent,
} from "@/lib/domains/publications";
import { isImageKitMediaUrl } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

type Props = {
  publications: PublicationsContent;
  pressMediaById?: Record<string, MediaPick>;
};

export default function PressSection({
  publications,
  pressMediaById = {},
}: Props) {
  const articlesRef = useRef(null);
  const articlesInView = useInView(articlesRef, { once: true, margin: "-80px" });
  const { tips } = publications;

  return (
    <section id="press" className="section-pad relative overflow-hidden bg-navy-800">
      <div className="accent-wash" />
      <div className="container">
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          <div className="mb-4 flex items-center justify-center gap-3.5">
            <div className="section-rule-light" />
            <span className="eyebrow">Publications</span>
            <div className="section-rule-light" />
          </div>
          <h2 className="m-0 font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            {publications.title}{" "}
            {publications.titleAccent ? (
              <em className="font-semibold text-accent-light">
                {publications.titleAccent}
              </em>
            ) : null}
          </h2>
          <p className="mt-4 font-display text-lg italic leading-[1.6] text-white/45">
            {publications.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-7">
          {publications.items.map((item) => {
            const media =
              (item.image?.galleryImageId &&
                pressMediaById[item.image.galleryImageId]) ||
              null;
            const hasImage =
              Boolean(media?.imageUrl) &&
              Boolean(item.image) &&
              isImageKitMediaUrl(media!.imageUrl);
            const alt = media?.altText || media?.title || item.title;

            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/14 bg-navy-700 no-underline transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 sm:w-[calc(50%-14px)] sm:max-w-none lg:w-[calc(33.333%-19px)]"
              >
                <div className="relative h-[228px] w-full shrink-0 overflow-hidden bg-navy-900/50">
                  {hasImage && media ? (
                    <ManagedImage
                      media={media}
                      config={item.imageConfig}
                      alt={alt}
                      imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      sizes="360px"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.85)_0%,transparent_55%)]" />
                </div>

                <div className="flex flex-1 flex-col gap-3.5 px-7 pb-8 pt-7">
                  <span className="font-title text-[10px] uppercase tracking-[2px] text-white/40">
                    {item.source}
                    {item.source && item.year ? " · " : null}
                    {item.year}
                  </span>
                  <h3 className="m-0 font-display text-xl font-medium leading-[1.35] text-white">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="m-0 text-[13px] leading-[1.7] text-white/45">
                      {item.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] text-accent-light/70 transition-colors group-hover:text-accent-light">
                    Read Feature
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        <div
          id="scholarship-tips"
          ref={articlesRef}
          className="relative mt-24 overflow-hidden rounded-2xl border border-accent/20 bg-white/[0.03] pt-12 pb-10 md:pt-16 md:pb-12"
        >
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-accent-light/10 blur-3xl" />

          <div className="relative px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={articlesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-12 max-w-[640px]"
            >
              <div className="mb-4 flex items-center gap-3.5">
                <div className="section-rule" />
                <span className="eyebrow">{tips.eyebrow}</span>
              </div>
              <h3 className="font-display text-[clamp(26px,3.5vw,40px)] font-light leading-[1.15] text-white">
                {tips.title}{" "}
                {tips.titleAccent ? (
                  <em className="font-semibold text-accent-light">
                    {tips.titleAccent}
                  </em>
                ) : null}
              </h3>
              {tips.subtitle ? (
                <p className="mt-3 font-display text-base italic leading-[1.7] text-white/45">
                  {tips.subtitle}
                </p>
              ) : null}
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tips.items.map((article, i) => (
                <motion.a
                  key={article.id}
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 28 }}
                  animate={articlesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.12 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex gap-5 overflow-hidden rounded-xl border border-white/10 bg-navy-800/60 px-5 py-6 no-underline transition-colors duration-300 hover:border-accent/40 hover:bg-navy-800/90 md:px-6"
                >
                  <span
                    className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
                    aria-hidden
                  />
                  <span className="shrink-0 font-display text-[28px] font-light leading-none text-accent/35 transition-colors duration-300 group-hover:text-accent-light/70">
                    {tipDisplayNumber(i)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {article.tag ? (
                      <span className="mb-2 inline-block font-title text-[9px] uppercase tracking-[2px] text-accent-light/70">
                        {article.tag}
                      </span>
                    ) : null}
                    <span className="block font-display text-lg font-medium leading-[1.35] text-white/90 transition-colors group-hover:text-white md:text-xl">
                      {article.title}
                    </span>
                    {article.blurb ? (
                      <span className="mt-2 block text-[13px] leading-[1.7] text-white/45">
                        {article.blurb}
                      </span>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-2 font-title text-[9px] uppercase tracking-[2px] text-white/35 transition-all duration-300 group-hover:gap-3 group-hover:text-accent-light">
                      Read on LinkedIn
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
