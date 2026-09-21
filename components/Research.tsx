"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import ManagedImage from "@/components/media/ManagedImage";
import {
  researchAreaNumber,
  type ResearchActionItem,
  type ResearchContent,
} from "@/lib/domains/research";
import type { MediaAsset } from "@/lib/media";
import type { ImageDisplayConfig } from "@/lib/domains/media/display";
import { isImageKitMediaUrl } from "@/lib/domains/media";

const GOOGLE_SCHOLAR =
  "https://scholar.google.com/citations?user=iAfft0gAAAAJ&hl=en";

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

function CountUp({
  to,
  suffix = " +",
  active,
  duration = 4500,
}: {
  to: number;
  suffix?: string;
  active: boolean;
  duration?: number;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, to, duration]);

  const display = active ? value : 0;

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

function ScholarStats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });

  const stats = [
    { to: 160, label: "Citations" },
    { to: 5, label: "h-index" },
    { to: 10, label: "Articles" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="font-display text-[28px] font-medium leading-none text-accent-light tabular-nums">
            <CountUp to={stat.to} active={inView} />
          </div>
          <div className="mt-1.5 font-title text-[8px] uppercase tracking-[2px] text-white/40">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionMediaFrame({
  item,
  media,
}: {
  item: ResearchActionItem;
  media: MediaPick;
}) {
  const alt = media?.altText || media?.title || item.title;
  const config: ImageDisplayConfig | undefined = item.image?.imageConfig;
  const hasImage =
    Boolean(media?.imageUrl) &&
    Boolean(item.image) &&
    isImageKitMediaUrl(media!.imageUrl);

  if (hasImage && media) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden">
        <ManagedImage
          media={media}
          config={config}
          alt={alt}
          imageClassName="transition-transform duration-[700ms] ease-out hover:scale-[1.05] group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.35)_0%,transparent_45%)]" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-navy-900/50" />
  );
}

type Props = {
  research: ResearchContent;
  developmentMedia?: MediaPick;
  actionMediaById?: Record<string, MediaPick>;
};

export default function Research({
  research,
  developmentMedia = null,
  actionMediaById = {},
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { development, action } = research;
  const media =
    developmentMedia?.imageUrl &&
    development.image &&
    isImageKitMediaUrl(developmentMedia.imageUrl)
      ? developmentMedia
      : null;
  const config: ImageDisplayConfig | undefined =
    development.image?.imageConfig;

  return (
    <section
      id="research"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-800"
    >
      <div className="accent-wash" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px] max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="eyebrow">Research & Development</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,62px)] font-light leading-[1.1] text-white">
            {development.title}{" "}
            {development.titleAccent ? (
              <em className="font-semibold italic text-accent-light">
                {development.titleAccent}
              </em>
            ) : null}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-[2fr_3fr]">
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-navy-900/50">
              {media ? (
                <ManagedImage
                  media={media}
                  config={config}
                  alt={media.altText || media.title || "Research"}
                  sizes="40vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.7)_0%,transparent_55%)]" />
              <div className="absolute bottom-4 left-4">
                <div className="eyebrow mb-1">{development.imageEyebrow}</div>
                <div className="font-display text-[15px] italic text-white">
                  {development.imageCaption}
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            {development.areas.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 32 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.14 + 0.2 }}
                className="relative flex cursor-default gap-5 border-b border-white/[0.07] py-7 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-accent/50 after:transition-[width] after:duration-[400ms] hover:after:w-full"
              >
                <span className="shrink-0 font-display text-[36px] font-light leading-none text-white/[0.12]">
                  {researchAreaNumber(i)}
                </span>
                <div>
                  <h3 className="mb-2.5 font-display text-2xl font-medium text-white">
                    {a.title}
                  </h3>
                  <p className="text-sm leading-[1.85] text-white/55">
                    {a.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="relative mt-24 overflow-hidden rounded-2xl border border-accent/25 bg-[linear-gradient(120deg,rgba(74,143,232,0.14)_0%,rgba(10,22,40,0.95)_42%,rgba(5,13,26,0.98)_100%)]"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-10 p-8 md:grid-cols-[1.4fr_1fr] md:gap-14 md:p-12 lg:p-14">
            <div>
              <div className="mb-4 flex items-center gap-3.5">
                <div className="section-rule" />
                <span className="eyebrow">Academic Publications</span>
              </div>
              <h3 className="mb-4 font-display text-[clamp(28px,3.5vw,42px)] font-light leading-[1.15] text-white">
                Published research on{" "}
                <em className="font-semibold text-accent-light">
                  Google Scholar
                </em>
              </h3>
              <p className="max-w-[520px] text-[15px] leading-[1.85] text-white/55">
                Google Scholar hosts Dr. Okafor&apos;s verified academic
                profile — peer-reviewed articles, conference papers, and his
                doctoral dissertation. His listed research areas are road
                traffic safety, connected vehicles, and sustainable
                transportation, with work spanning crash-severity modeling,
                pedestrian injury pathways, large-truck safety, and
                connected-vehicle hard-braking data for proactive safety
                improvement.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-6 border-t border-white/10 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <ScholarStats />

              <ul className="flex flex-col gap-3">
                {[
                  "Road traffic safety · connected vehicles · sustainable transport",
                  "Dissertation on connected-vehicle data for proactive road safety",
                  "Collaborations with Alabama Transportation Institute researchers",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[13px] leading-[1.6] text-white/65"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href={GOOGLE_SCHOLAR}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex w-fit items-center gap-3 rounded-lg border border-accent/45 bg-accent/15 px-6 py-4 font-title text-[10px] uppercase tracking-[2.5px] text-accent-light no-underline transition-colors hover:border-accent/70 hover:bg-accent/25"
              >
                View full Google Scholar profile
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.45 }}
          className="mt-24"
        >
          <div className="mb-10 max-w-[640px]">
            <div className="mb-4 flex items-center gap-3.5">
              <div className="section-rule" />
              <span className="eyebrow">Research in Action</span>
            </div>
            <h3 className="font-display text-[clamp(26px,3.5vw,40px)] font-light leading-[1.15] text-white">
              {action.title}{" "}
              {action.titleAccent ? (
                <em className="font-semibold text-accent-light">
                  {action.titleAccent}
                </em>
              ) : null}
            </h3>
            <p className="mt-3 font-display text-base italic leading-[1.7] text-white/45">
              {action.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {action.items.map((item, i) => {
              const itemMedia =
                (item.image?.galleryImageId &&
                  actionMediaById[item.image.galleryImageId]) ||
                null;
              const body = (
                <>
                  <ActionMediaFrame item={item} media={itemMedia} />
                  <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
                    <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-accent-light/70">
                      {item.label}
                    </div>
                    <h4 className="mb-2.5 font-display text-[22px] font-medium leading-[1.25] text-white">
                      {item.title}
                    </h4>
                    <p className="mb-5 flex-1 text-[13px] leading-[1.75] text-white/50">
                      {item.description}
                    </p>
                    {item.href ? (
                      <span className="inline-flex items-center gap-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/40 transition-colors group-hover:text-accent-light">
                        View on LinkedIn
                        <span aria-hidden>→</span>
                      </span>
                    ) : null}
                  </div>
                </>
              );

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] no-underline text-inherit transition-colors duration-300 hover:border-accent/40"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                      {body}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
