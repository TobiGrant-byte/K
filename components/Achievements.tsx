"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import type {
  AchievementMilestoneItem,
  AchievementsMilestonesContent,
} from "@/lib/domains/achievements";
import { isImageKitMediaUrl } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

type Props = {
  milestones: AchievementsMilestonesContent;
  mediaById?: Record<string, MediaPick>;
};

function CardMedia({
  item,
  media,
}: {
  item: AchievementMilestoneItem;
  media: MediaPick;
}) {
  const contain = item.fit === "contain";
  const hasImage =
    Boolean(media?.imageUrl) &&
    Boolean(item.image) &&
    isImageKitMediaUrl(media!.imageUrl);
  const alt = media?.altText || media?.title || item.title;

  return (
    <div
      className={`img-zoom relative h-60 overflow-hidden ${
        contain ? "bg-[#f3f0f8] p-3 sm:p-4" : "bg-navy-900/10"
      }`}
    >
      <div
        className={`relative h-full w-full ${contain ? "" : "absolute inset-0"}`}
      >
        {hasImage && media ? (
          <ManagedImage
            media={media}
            config={item.imageConfig}
            alt={alt}
            objectFit={contain ? "contain" : "cover"}
            imageClassName={
              contain
                ? ""
                : "transition-transform duration-500 group-hover:scale-[1.03]"
            }
            sizes="33vw"
          />
        ) : null}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 ${
          contain
            ? "bg-[linear-gradient(to_top,rgba(5,13,26,0.5)_0%,transparent_42%)]"
            : "bg-[linear-gradient(to_top,rgba(5,13,26,0.65)_0%,transparent_55%)]"
        }`}
      />
      <div className="absolute bottom-3 left-4 right-4 z-[1] flex items-end justify-between gap-2">
        <span className="font-title text-[10px] uppercase tracking-[3px] text-white/70">
          {item.year}
        </span>
        {item.href ? (
          <span className="font-title text-[9px] uppercase tracking-[2px] text-white/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View post →
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function Achievements({
  milestones,
  mediaById = {},
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (!milestones.items.length && !milestones.title && !milestones.eyebrow) {
    return null;
  }

  return (
    <section
      id="achievements"
      ref={ref}
      className="section-pad relative overflow-hidden bg-off-white"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="font-title text-[10px] uppercase tracking-[4px] text-black">
              {milestones.eyebrow}
            </span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-black">
            {milestones.title}{" "}
            {milestones.titleAccent ? (
              <em className="font-semibold text-accent">
                {milestones.titleAccent}
              </em>
            ) : null}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.items.map((a, i) => {
            const media =
              (a.image?.galleryImageId &&
                mediaById[a.image.galleryImageId]) ||
              null;
            const body = (
              <>
                <CardMedia item={a} media={media} />
                <div className="px-6 pb-7 pt-6">
                  <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-accent">
                    {a.org}
                  </div>
                  <h3 className="mb-2.5 font-display text-xl font-semibold leading-[1.25] text-navy-800">
                    {a.title}
                  </h3>
                  <p className="text-[13px] leading-[1.75] text-text-muted">
                    {a.description}
                  </p>
                </div>
              </>
            );

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 36 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-lg bg-white shadow-[0_2px_20px_rgba(10,22,40,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(10,22,40,0.12)]"
              >
                {a.href ? (
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block no-underline text-inherit"
                    aria-label={`${a.title} — view LinkedIn post`}
                  >
                    {body}
                  </a>
                ) : (
                  <div className="cursor-default group">{body}</div>
                )}

                {a.extraLinks.length ? (
                  <div className="border-t border-navy-800/5 px-6 pb-5">
                    {a.extraLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 pt-3 font-title text-[9px] uppercase tracking-[2px] text-accent no-underline transition-colors hover:text-accent-soft"
                      >
                        {link.label}
                        <span aria-hidden>→</span>
                      </a>
                    ))}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
