"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

const allPhotos: {
  src: string;
  caption: string;
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
}[] = [
  { src: "/images/credentials.png",       caption: "Engineering Credentials" },
  { src: "/images/grad-pensive.webp",       caption: "Graduation · University of Alabama", objectPosition: "center 28%", transformOrigin: "center 28%" },
  { src: "/images/graduation-denny.webp",   caption: "Denny Chimes · Tuscaloosa, Alabama", objectPosition: "center 38%", zoom: 1.25, transformOrigin: "center 38%" },
  { src: "/images/garver-award-1.png",       caption: "Garver Award Ceremony", objectPosition: "center 30%" },
  { src: "/images/lifesavers-conf.webp",     caption: "LIFESAVERS 2023 · Seattle, WA", objectPosition: "center 28%" },
  // { src: "/images/chess.jpg",               caption: "Playing Chess" },
  { src: "/images/traffic-safety-scholars.jpg", caption: "Traffic Safety Scholars · LIFESAVERS 2023" },
  { src: "/images/graduation-mentor.webp",  caption: "Doctoral Hooding Ceremony" },
  { src: "/images/msc-graduation.jpg",      caption: "MSc Graduation · Nottingham Trent, UK", objectPosition: "top center", zoom: 1.18, transformOrigin: "top center" },
  { src: "/images/africa-ball.jpg",         caption: "Africa Ball · University of Alabama", objectPosition: "center 35%", zoom: 1.15, transformOrigin: "center 35%" },
  { src: "/images/headshot.jpg",            caption: "Professional Portrait", objectPosition: "center 20%", transformOrigin: "center 20%" },
  { src: "/images/grad-lean.webp",          caption: "Graduation — University of Alabama", objectPosition: "center 20%", transformOrigin: "center 20%" },
  { src: "/images/lecture-hall.jpg",        caption: "Socio-Cultural Adaptation Talk" },
  { src: "/images/speaking.webp",           caption: "Cultural Event MC", zoom: 1.32, transformOrigin: "center center" },
  { src: "/images/garver-award-2.webp",     caption: "Garver Recognition" },
  { src: "/images/grad-close.webp",         caption: "Graduation Portrait", objectPosition: "center 15%", transformOrigin: "center 15%" },
  { src: "/images/seated.webp",             caption: "University of Alabama Campus", objectPosition: "center 40%", transformOrigin: "center 40%" },
];

const strip = [...allPhotos, ...allPhotos];

function MediaThumb({
  src,
  caption,
  width,
  objectPosition,
  zoom,
  transformOrigin,
}: {
  src: string;
  caption: string;
  width: number;
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
      sizes={`${width}px`}
    />
  );
}

export default function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" ref={ref} className="section-pad relative overflow-hidden bg-navy-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,#fff_0%,transparent_55%)] opacity-[0.03]" />

      {/* Header */}
      <div className="container mb-14">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div className="mb-4 flex items-center gap-3.5">
            <div className="h-px w-10 bg-white/35" />
            <span className="eyebrow">Gallery</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            A Life in{" "}<em className="font-semibold">Motion</em>
          </h2>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
        className="scroll-strip mb-4">
        <div className="scroll-track">
          {strip.map((p, i) => (
            <div key={i} onClick={() => setLightbox(i % allPhotos.length)}
              className="img-zoom relative h-[248px] w-[360px] shrink-0 cursor-zoom-in overflow-hidden">
              <MediaThumb
                src={p.src}
                caption={p.caption}
                width={360}
                objectPosition={p.objectPosition}
                zoom={p.zoom}
                transformOrigin={p.transformOrigin}
              />
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-end bg-[rgba(5,13,26,0.65)] p-3.5">
                <p className="font-display text-sm italic leading-[1.3] text-white">{p.caption}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 2 — scrolls right (reverse) */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.35 }}
        className="scroll-strip">
        <div className="scroll-track [animation-direction:reverse] [animation-duration:35s]">
          {[...strip].reverse().map((p, i) => (
            <div key={i} onClick={() => setLightbox((strip.length - 1 - i) % allPhotos.length)}
              className="img-zoom relative h-[228px] w-80 shrink-0 cursor-zoom-in overflow-hidden">
              <MediaThumb
                src={p.src}
                caption={p.caption}
                width={320}
                objectPosition={p.objectPosition}
                zoom={p.zoom}
                transformOrigin={p.transformOrigin}
              />
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                className="absolute inset-0 flex items-end bg-[rgba(5,13,26,0.65)] p-3.5">
                <p className="font-display text-sm italic leading-[1.3] text-white">{p.caption}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(5,13,26,0.97)] p-6"
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.3 }}
              className="relative aspect-[3/2] w-full max-w-[900px]" onClick={e => e.stopPropagation()}>
              <Image src={allPhotos[lightbox].src} alt={allPhotos[lightbox].caption} fill className="object-contain" sizes="90vw" />
              <div className="absolute -bottom-8 left-0 right-0 text-center">
                <p className="font-display text-sm italic text-white/50">{allPhotos[lightbox].caption}</p>
              </div>
              <button onClick={() => setLightbox(null)}
                className="absolute -top-10 right-0 flex h-8 w-8 cursor-pointer items-center justify-center border border-white/30 bg-transparent text-sm text-white/70">
                ✕
              </button>
              {lightbox > 0 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                  className="absolute -left-12 top-1/2 h-9 w-9 -translate-y-1/2 cursor-pointer border border-white/20 bg-transparent text-lg text-white">‹</button>
              )}
              {lightbox < allPhotos.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                  className="absolute -right-12 top-1/2 h-9 w-9 -translate-y-1/2 cursor-pointer border border-white/20 bg-transparent text-lg text-white">›</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
