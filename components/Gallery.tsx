"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";

const allPhotos = [
  { src: "/images/credentials.png",       caption: "Licensed Engineer" },
  { src: "/images/grad-pensive.webp",       caption: "PhD Graduation · University of Alabama" },
  { src: "/images/graduation-denny.webp",   caption: "Denny Chimes · Tuscaloosa, Alabama" },
  { src: "/images/garver-award-1.png",       caption: "Garver Award Ceremony" },
  { src: "/images/lifesavers-conf.webp",     caption: "LIFESAVERS 2023 · Seattle, WA" },
  { src: "/images/chess.jpg",               caption: "Playing Chess" },
  { src: "/images/traffic-safety-scholars.jpg", caption: "Traffic Safety Scholars · LIFESAVERS 2023" },
  { src: "/images/graduation-mentor.webp",  caption: "Doctoral Hooding Ceremony" },
  { src: "/images/msc-graduation.jpg",      caption: "MSc Graduation · Nottingham Trent, UK" },
  { src: "/images/africa-ball.jpg",         caption: "Africa Ball · University of Alabama" },
  { src: "/images/headshot.jpg",            caption: "Professional Portrait" },
  { src: "/images/grad-lean.webp",          caption: "PhD — University of Alabama" },
  { src: "/images/lecture-hall.jpg",        caption: "Socio-Cultural Adaptation Talk" },
  { src: "/images/speaking.webp",           caption: "Cultural Event MC" },
  { src: "/images/garver-award-2.webp",     caption: "Garver Recognition" },
  { src: "/images/grad-close.webp",         caption: "Graduation Portrait" },
  { src: "/images/seated.webp",             caption: "University of Alabama Campus" },
];

const strip = [...allPhotos, ...allPhotos];

function MediaThumb({ src, caption, width }: { src: string; caption: string; width: number }) {
  return <Image src={src} alt={caption} fill style={{ objectFit: "cover" }} sizes={`${width}px`} />;
}

export default function Gallery() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" ref={ref} style={{ background: "var(--navy-800)", overflow: "hidden", position: "relative" }} className="section-pad">
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(circle at 30% 70%, #fff 0%, transparent 55%)", pointerEvents: "none" }} />

      {/* Header */}
      <div className="container" style={{ marginBottom: 56 }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.35)" }} />
            <span className="eyebrow">Gallery</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,5vw,58px)", color: "#fff", lineHeight: 1.1 }}>
            A Life in{" "}<em style={{ fontWeight: 600 }}>Motion</em>
          </h2>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
        className="scroll-strip" style={{ marginBottom: 16 }}>
        <div className="scroll-track">
          {strip.map((p, i) => (
            <div key={i} onClick={() => setLightbox(i % allPhotos.length)}
              className="img-zoom" style={{ position: "relative", width: 320, height: 220, flexShrink: 0, overflow: "hidden", cursor: "zoom-in" }}>
              <MediaThumb src={p.src} caption={p.caption} width={320} />
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                style={{ position: "absolute", inset: 0, background: "rgba(5,13,26,0.65)", display: "flex", alignItems: "flex-end", padding: 14 }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: "italic", color: "#fff", lineHeight: 1.3 }}>{p.caption}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 2 — scrolls right (reverse) */}
      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.35 }}
        className="scroll-strip">
        <div className="scroll-track" style={{ animationDirection: "reverse", animationDuration: "35s" }}>
          {[...strip].reverse().map((p, i) => (
            <div key={i} onClick={() => setLightbox((strip.length - 1 - i) % allPhotos.length)}
              className="img-zoom" style={{ position: "relative", width: 280, height: 200, flexShrink: 0, overflow: "hidden", cursor: "zoom-in" }}>
              <MediaThumb src={p.src} caption={p.caption} width={280} />
              <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                style={{ position: "absolute", inset: 0, background: "rgba(5,13,26,0.65)", display: "flex", alignItems: "flex-end", padding: 14 }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontStyle: "italic", color: "#fff", lineHeight: 1.3 }}>{p.caption}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,13,26,0.97)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ position: "relative", maxWidth: 900, width: "100%", aspectRatio: "3/2" }} onClick={e => e.stopPropagation()}>
              <Image src={allPhotos[lightbox].src} alt={allPhotos[lightbox].caption} fill style={{ objectFit: "contain" }} sizes="90vw" />
              <div style={{ position: "absolute", bottom: -32, left: 0, right: 0, textAlign: "center" }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{allPhotos[lightbox].caption}</p>
              </div>
              <button onClick={() => setLightbox(null)}
                style={{ position: "absolute", top: -40, right: 0, background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", cursor: "pointer", width: 32, height: 32, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✕
              </button>
              {lightbox > 0 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
                  style={{ position: "absolute", left: -48, top: "50%", transform: "translateY(-50%)", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", width: 36, height: 36, fontSize: 18 }}>‹</button>
              )}
              {lightbox < allPhotos.length - 1 && (
                <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
                  style={{ position: "absolute", right: -48, top: "50%", transform: "translateY(-50%)", background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", width: 36, height: 36, fontSize: 18 }}>›</button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}