"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

type GalleryCategory = "All" | "Graduation" | "Recognition" | "Moments";

type Photo = {
  src: string;
  caption: string;
  category: Exclude<GalleryCategory, "All">;
  /** Approximate intrinsic size for masonry layout (does not crop). */
  width: number;
  height: number;
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
};

const allPhotos: Photo[] = [
  {
    src: "/images/grad-pensive.webp",
    caption: "Graduation · The University of Alabama",
    category: "Graduation",
    width: 1200,
    height: 1500,
    objectPosition: "center 28%",
    transformOrigin: "center 28%",
  },
  {
    src: "/images/credentials.png",
    caption: "Engineering Credentials",
    category: "Recognition",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/graduation-denny.webp",
    caption: "Denny Chimes · Tuscaloosa, Alabama",
    category: "Graduation",
    width: 1000,
    height: 1400,
    objectPosition: "center 38%",
    zoom: 1.25,
    transformOrigin: "center 38%",
  },
  {
    src: "/images/garver-award-1.png",
    caption: "Garver Award Ceremony",
    category: "Recognition",
    width: 1400,
    height: 900,
    objectPosition: "center 30%",
  },
  {
    src: "/images/lifesavers-conf.webp",
    caption: "LIFESAVERS 2023 · Seattle, WA",
    category: "Recognition",
    width: 1400,
    height: 900,
    objectPosition: "center 28%",
  },
  {
    src: "/images/traffic-safety-scholars.jpg",
    caption: "Traffic Safety Scholars · LIFESAVERS 2023",
    category: "Recognition",
    width: 1400,
    height: 1000,
  },
  {
    src: "/images/graduation-mentor.webp",
    caption: "Graduation Dinner with Stephen Jones",
    category: "Graduation",
    width: 1400,
    height: 1000,
  },
  {
    src: "/images/msc-graduation.jpg",
    caption: "MSc Graduation · Nottingham Trent, UK",
    category: "Graduation",
    width: 1100,
    height: 1400,
    objectPosition: "top center",
    zoom: 1.18,
    transformOrigin: "top center",
  },
  {
    src: "/images/africa-ball.jpg",
    caption: "Africa Ball · The University of Alabama",
    category: "Moments",
    width: 1000,
    height: 1400,
    objectPosition: "center 35%",
    zoom: 1.15,
    transformOrigin: "center 35%",
  },
  {
    src: "/images/headshot.jpg",
    caption: "Professional Portrait",
    category: "Moments",
    width: 1000,
    height: 1250,
    objectPosition: "center 20%",
    transformOrigin: "center 20%",
  },
  {
    src: "/images/grad-lean.webp",
    caption: "Graduation — The University of Alabama",
    category: "Graduation",
    width: 1100,
    height: 1400,
    objectPosition: "center 20%",
    transformOrigin: "center 20%",
  },
  {
    src: "/images/lecture-hall.jpg",
    caption: "Presentation at Stillman College",
    category: "Moments",
    width: 1400,
    height: 900,
  },
  {
    src: "/images/speaking.webp",
    caption: "UA Africa Ball",
    category: "Moments",
    width: 1200,
    height: 900,
    zoom: 1.32,
    transformOrigin: "center center",
  },
  {
    src: "/images/garver-award-2.webp",
    caption: "ITE Student Leadership Submit",
    category: "Recognition",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/grad-close.webp",
    caption: "Graduation Portrait",
    category: "Graduation",
    width: 1000,
    height: 1300,
    objectPosition: "center 15%",
    transformOrigin: "center 15%",
  },
  {
    src: "/images/seated.webp",
    caption: "The University of Alabama Campus",
    category: "Moments",
    width: 1100,
    height: 1400,
    objectPosition: "center 40%",
    transformOrigin: "center 40%",
  },
];

const CATEGORIES: GalleryCategory[] = [
  "All",
  "Graduation",
  "Recognition",
  "Moments",
];

function StripThumb({
  src,
  caption,
  objectPosition,
  zoom,
  transformOrigin,
}: {
  src: string;
  caption: string;
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
}) {
  return (
    <Image
      src={src}
      alt={caption}
      fill
      className="object-cover"
      style={{
        objectPosition: objectPosition || "center",
        transform: zoom ? `scale(${zoom})` : undefined,
        transformOrigin: transformOrigin || "center center",
      }}
      sizes="240px"
    />
  );
}

export default function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [filter, setFilter] = useState<GalleryCategory>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const photos = useMemo(
    () =>
      filter === "All"
        ? allPhotos
        : allPhotos.filter((p) => p.category === filter),
    [filter],
  );

  const openAt = (index: number) => setLightbox(index);

  const go = useCallback(
    (dir: -1 | 1) => {
      setLightbox((i) => {
        if (i === null || photos.length === 0) return i;
        return (i + dir + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, go]);

  const strip = useMemo(() => [...allPhotos, ...allPhotos], []);

  return (
    <section
      id="gallery"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-800"
    >
      <div className="accent-wash" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
      />

      <div className="container relative mb-10 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="eyebrow">Gallery</span>
          </div>
          <h1 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            A Life in{" "}
            <em className="font-semibold text-accent-light">Motion</em>
          </h1>
          <p className="mt-5 font-display text-lg italic leading-relaxed text-white/50 md:text-xl">
            Graduation halls, award stages, and moments
          </p>
        </motion.div>
      </div>

      {/* Moving strip — same as before, just placed above the grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="mb-12 md:mb-16"
      >
        <div className="container mb-4 flex items-end justify-between gap-4">
          <p className="font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Featured moments
          </p>
          <p className="hidden font-display text-sm italic text-white/30 sm:block">
            Hover to pause · click any frame to open
          </p>
        </div>
        <div className="scroll-strip">
          <div className="scroll-track gap-3 [animation-duration:55s]">
            {strip.map((p, i) => (
              <button
                key={`strip-${i}`}
                type="button"
                onClick={() => {
                  const idx = allPhotos.findIndex((x) => x.src === p.src);
                  if (idx < 0) return;
                  setFilter("All");
                  setLightbox(idx);
                }}
                className="img-zoom relative h-[140px] w-[200px] shrink-0 cursor-zoom-in overflow-hidden border-0 bg-navy-900 p-0 sm:h-[160px] sm:w-[240px]"
              >
                <StripThumb
                  src={p.src}
                  caption={p.caption}
                  objectPosition={p.objectPosition}
                  zoom={p.zoom}
                  transformOrigin={p.transformOrigin}
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Filters + masonry gallery — bottom */}
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Gallery categories"
        >
          {CATEGORIES.map((c) => {
            const selected = filter === c;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setFilter(c);
                  setLightbox(null);
                }}
                className={`rounded-full border px-4 py-2 font-title text-[9px] uppercase tracking-[2px] transition-colors ${
                  selected
                    ? "border-accent/50 bg-accent/15 text-accent-light"
                    : "border-white/12 bg-transparent text-white/50 hover:border-white/25 hover:text-white/80"
                }`}
              >
                {c}
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="columns-1 gap-4 sm:columns-2 lg:columns-3"
          >
            {photos.map((p, i) => (
              <motion.button
                key={`${p.src}-${filter}`}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.35) }}
                onClick={() => openAt(i)}
                className="group mb-4 w-full break-inside-avoid cursor-zoom-in border-0 bg-transparent p-0 text-left"
              >
                <div className="overflow-hidden bg-navy-900/40">
                  <Image
                    src={p.src}
                    alt={p.caption}
                    width={p.width}
                    height={p.height}
                    className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={i < 3}
                  />
                </div>
                <div className="mt-2.5 px-0.5">
                  <span className="mb-1 block font-title text-[8px] uppercase tracking-[2px] text-accent-light">
                    {p.category}
                  </span>
                  <p className="font-display text-[15px] italic leading-snug text-white/75 transition-colors group-hover:text-white">
                    {p.caption}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {photos.length === 0 ? (
          <p className="font-display text-lg italic text-white/40">
            No photos in this category yet.
          </p>
        ) : null}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && photos[lightbox] ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,13,26,0.96)] p-4 sm:p-8"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={photos[lightbox].caption}
          >
            <motion.div
              key={photos[lightbox].src}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="relative flex max-h-[90vh] w-full max-w-5xl flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-title text-[8px] uppercase tracking-[2px] text-accent-light">
                    {photos[lightbox].category}
                  </span>
                  <p className="truncate font-display text-base italic text-white/70 sm:text-lg">
                    {photos[lightbox].caption}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-white/35">
                    {lightbox + 1} / {photos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLightbox(null)}
                    aria-label="Close"
                    className="flex h-9 w-9 items-center justify-center border border-white/25 text-sm text-white/70 transition-colors hover:border-accent/50 hover:text-accent-light"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-navy-900/50">
                <Image
                  src={photos[lightbox].src}
                  alt={photos[lightbox].caption}
                  width={photos[lightbox].width}
                  height={photos[lightbox].height}
                  className="max-h-[min(70vh,720px)] w-auto max-w-full object-contain"
                  sizes="90vw"
                  priority
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="rounded-lg border border-white/15 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                >
                  ← Prev
                </button>
                <p className="hidden font-title text-[8px] uppercase tracking-[2px] text-white/25 sm:block">
                  Arrow keys to browse · Esc to close
                </p>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="rounded-lg border border-white/15 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
