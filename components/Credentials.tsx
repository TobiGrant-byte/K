"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import type { AchievementsJourneyContent } from "@/lib/domains/achievements";
import { isImageKitMediaUrl } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

type Props = {
  journey: AchievementsJourneyContent;
  mediaById?: Record<string, MediaPick>;
};

export default function Credentials({ journey, mediaById = {} }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (
    !journey.timeline.length &&
    !journey.title &&
    !journey.eyebrow &&
    !journey.portraitImage &&
    !journey.secondaryImageA &&
    !journey.secondaryImageB
  ) {
    return null;
  }

  const portrait =
    (journey.portraitImage?.galleryImageId &&
      mediaById[journey.portraitImage.galleryImageId]) ||
    null;
  const secondaryA =
    (journey.secondaryImageA?.galleryImageId &&
      mediaById[journey.secondaryImageA.galleryImageId]) ||
    null;
  const secondaryB =
    (journey.secondaryImageB?.galleryImageId &&
      mediaById[journey.secondaryImageB.galleryImageId]) ||
    null;

  return (
    <section
      id="credentials"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-900"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[60%] bg-[radial-gradient(ellipse_at_10%_50%,rgba(255,255,255,0.02)_0%,transparent_65%)]" />

      <div className="container">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-20">
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-14"
            >
              <div className="mb-4 flex items-center gap-3.5">
                <div className="section-rule" />
                <span className="eyebrow">{journey.eyebrow}</span>
              </div>
              <h2 className="font-display text-[clamp(28px,4vw,48px)] font-light leading-[1.1] text-white">
                {journey.title}{" "}
                {journey.titleAccent ? (
                  <em className="font-semibold text-accent-light">
                    {journey.titleAccent}
                  </em>
                ) : null}
                {journey.titleAfter ? ` ${journey.titleAfter}` : null}
              </h2>
            </motion.div>

            <div className="relative">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.3 }}
                className="absolute bottom-0 left-1.5 top-0 w-px origin-top bg-[linear-gradient(to_bottom,var(--color-accent),rgba(74,143,232,0.05))]"
              />

              <div className="flex flex-col gap-0">
                {journey.timeline.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
                    className="group relative flex cursor-default gap-5 py-5 pl-7"
                  >
                    <div className="absolute left-0 top-7 z-[1] h-[13px] w-[13px] rounded-full border border-accent/50 bg-navy-900 transition-colors duration-300 group-hover:bg-accent/40" />
                    <div>
                      <div className="mb-1.5 font-title text-[9px] uppercase tracking-[3px] text-accent-light/70">
                        {item.year}
                      </div>
                      <h4 className="mb-1 font-display text-[19px] font-medium text-white">
                        {item.title}
                      </h4>
                      <div className="mb-2 font-title text-[9px] uppercase tracking-[1px] text-white/40">
                        {item.org}
                      </div>
                      <p className="text-[13px] leading-[1.8] text-white/45">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 flex flex-col gap-4 md:sticky md:top-24 md:order-2"
          >
            <div className="img-zoom relative aspect-[3/4] max-h-[420px] overflow-hidden rounded-xl bg-navy-800/50">
              {portrait?.imageUrl &&
              journey.portraitImage &&
              isImageKitMediaUrl(portrait.imageUrl) ? (
                <ManagedImage
                  media={portrait}
                  config={journey.portraitImageConfig}
                  alt={
                    portrait.altText ||
                    portrait.title ||
                    "Career journey portrait"
                  }
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.7)_0%,transparent_50%)]" />
              {journey.quote ? (
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="font-display text-[17px] italic leading-[1.5] text-white/85">
                    &ldquo;{journey.quote}&rdquo;
                  </p>
                </div>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="img-zoom relative aspect-square overflow-hidden rounded-xl bg-navy-800/50">
                {secondaryA?.imageUrl &&
                journey.secondaryImageA &&
                isImageKitMediaUrl(secondaryA.imageUrl) ? (
                  <ManagedImage
                    media={secondaryA}
                    config={journey.secondaryImageAConfig}
                    alt={
                      secondaryA.altText ||
                      secondaryA.title ||
                      "Career journey"
                    }
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : null}
              </div>
              <div className="img-zoom relative aspect-square overflow-hidden rounded-xl bg-navy-800/50">
                {secondaryB?.imageUrl &&
                journey.secondaryImageB &&
                isImageKitMediaUrl(secondaryB.imageUrl) ? (
                  <ManagedImage
                    media={secondaryB}
                    config={journey.secondaryImageBConfig}
                    alt={
                      secondaryB.altText ||
                      secondaryB.title ||
                      "Career journey"
                    }
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
