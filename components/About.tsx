"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import {
  ABOUT_IMAGE_FALLBACK_ALT,
  ABOUT_IMAGE_FALLBACK_SRC,
  profileBodyParagraphs,
  type ProfileAboutContent,
} from "@/lib/domains/profile";
import type { MediaAsset } from "@/lib/media";
import type { ImageDisplayConfig } from "@/lib/domains/media/display";

type Props = {
  about: ProfileAboutContent;
  /** Resolved Media Library asset when `about.image` is set. */
  aboutMedia?: Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;
};

export default function About({ about, aboutMedia = null }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const paragraphs = profileBodyParagraphs(about.body);
  const media = aboutMedia ?? {
    imageUrl: ABOUT_IMAGE_FALLBACK_SRC,
    altText: ABOUT_IMAGE_FALLBACK_ALT,
    title: ABOUT_IMAGE_FALLBACK_ALT,
  };
  const config: ImageDisplayConfig | undefined = about.image?.imageConfig;

  return (
    <section
      id="about"
      ref={ref}
      className="section-pad bg-off-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-2/5 h-full bg-gradient-to-l from-[rgba(10,22,40,0.04)] to-transparent pointer-events-none" />

      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center min-w-0"
          >
            <div className="relative w-full max-w-[min(360px,100%)] pb-7 pl-4 md:pb-14 md:pl-7">
              <div className="absolute top-2.5 left-5 w-[calc(100%-8px)] md:left-[38px] md:w-full md:max-w-[360px] aspect-[360/480] border border-accent/25 z-0" />
              <div className="img-zoom relative w-full aspect-[360/480] z-[1]">
                <ManagedImage
                  media={media}
                  config={config}
                  alt={media.altText || ABOUT_IMAGE_FALLBACK_ALT}
                  sizes="(max-width: 768px) 100vw, 360px"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="min-w-0 break-words"
            initial={{ opacity: 0, x: 48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className="section-rule" />
              <span className="font-title text-[10px] tracking-[4px] uppercase text-black">
                About
              </span>
            </div>
            <h2 className="font-display font-light text-[clamp(26px,7vw,36px)] md:text-[clamp(28px,4vw,52px)] text-black leading-[1.2] mb-6">
              {about.title}{" "}
              {about.titleAccent ? (
                <em className="font-semibold text-accent">{about.titleAccent}</em>
              ) : null}
            </h2>
            <div className="flex flex-col gap-4 mb-8">
              <p className="text-[15px] leading-[1.8] text-text-muted">
                {about.excerpt}
              </p>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`about-p-${index}`}
                  className="text-[15px] leading-[1.8] text-text-muted"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="h-px bg-gradient-to-r from-navy-800 to-transparent opacity-15 mb-7 origin-left"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
