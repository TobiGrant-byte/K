"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import type { PhilanthropyContent } from "@/lib/domains/philanthropy";
import { isImageKitMediaUrl } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

type Props = {
  philanthropy: PhilanthropyContent;
  mediaById?: Record<string, MediaPick>;
};

export default function Philanthropy({
  philanthropy,
  mediaById = {},
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="philanthropy"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-800"
    >
      <div className="accent-wash" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="eyebrow">{philanthropy.eyebrow}</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            {philanthropy.title}{" "}
            {philanthropy.titleAccent ? (
              <em className="font-semibold text-accent-light">
                {philanthropy.titleAccent}
              </em>
            ) : null}
          </h2>
          {philanthropy.subtitle ? (
            <p className="mt-5 font-display text-lg italic leading-[1.7] text-white/50">
              {philanthropy.subtitle}
            </p>
          ) : null}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {philanthropy.items.map((p, i) => {
            const media =
              (p.image?.galleryImageId &&
                mediaById[p.image.galleryImageId]) ||
              null;
            const hasImage =
              Boolean(media?.imageUrl) &&
              Boolean(p.image) &&
              isImageKitMediaUrl(media!.imageUrl);
            const alt = media?.altText || media?.title || p.title;

            const inner = (
              <>
                <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-navy-900/50">
                  {hasImage && media ? (
                    <ManagedImage
                      media={media}
                      config={p.imageConfig}
                      alt={alt}
                      imageClassName="transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.75)_0%,transparent_50%)]" />
                </div>
                <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
                  <h3 className="mb-3 font-display text-[22px] font-medium leading-[1.25] text-white">
                    {p.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8] text-white/55">
                    {p.description}
                  </p>
                  {p.cta ? (
                    <span className="mt-5 inline-flex items-center gap-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 transition-colors group-hover:text-white/80">
                      {p.cta}
                      <span aria-hidden>→</span>
                    </span>
                  ) : null}
                </div>
              </>
            );

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.12 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
              >
                {p.href ? (
                  <a
                    href={p.href}
                    {...(p.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="group flex h-full flex-col no-underline text-inherit"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="group flex h-full flex-col">{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
