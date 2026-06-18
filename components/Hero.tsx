"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const words = ["Engineer.", "Researcher.", "Leader.", "Scholar."];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY   = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const scale   = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section ref={ref} style={{ position: "relative", height: "100vh", minHeight: 700, overflow: "hidden", display: "flex", alignItems: "flex-end" }}>

      {/* Video / fallback */}
      <motion.div style={{ position: "absolute", inset: 0, zIndex: 0, scale }}>
        <video autoPlay muted loop playsInline poster="/images/graduation-denny.webp"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}>
        <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <Image src="/images/graduation-denny.webp" alt="" fill priority style={{ objectFit: "cover", objectPosition: "top", zIndex: -1 }} sizes="100vw" />
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(5,13,26,0.92) 0%, rgba(5,13,26,0.65) 50%, rgba(5,13,26,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,1) 0%, rgba(5,13,26,0.3) 40%, transparent 70%)" }} />
      </motion.div>

      {/* Animated dots grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0.07, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Content */}
      <motion.div style={{ position: "relative", zIndex: 10, width: "100%", y: textY, opacity }}>
        <div className="container" style={{ paddingBottom: "96px" }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{ width: 36, height: 1, background: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Transportation Systems Engineering
            </span>
          </motion.div>

          {/* Name */}
          <div style={{ overflow: "hidden", marginBottom: 6 }}>
            <motion.h1 initial={{ y: 120 }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(52px,8.5vw,116px)", lineHeight: 0.95, color: "#fff", margin: 0 }}>
              Dr. Sunday
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden", marginBottom: 36 }}>
            <motion.h1 initial={{ y: 120 }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontStyle: "italic", fontSize: "clamp(52px,8.5vw,116px)", lineHeight: 0.95, color: "rgba(255,255,255,0.92)", margin: 0 }}>
              Okafor
            </motion.h1>
          </div>

          {/* Rotating word */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>PhD, PE ·</span>
            <div style={{ overflow: "hidden", height: 30 }}>
              {words.map((w, i) => (
                <motion.span key={w}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: [30, 0, 0, -30], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 3, delay: i * 3 + 1.2, repeat: Infinity, repeatDelay: (words.length - 1) * 3 }}
                  style={{ display: "block", fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.85)", position: i === 0 ? "relative" : "absolute" }}>
                  {w}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
              style={{ padding: "15px 36px", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", fontWeight: 600, background: "#fff", color: "var(--navy-800)", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}>
              Discover My Work
            </motion.button>
            <motion.button whileHover={{ scale: 1.03, background: "rgba(255,255,255,0.1)" }} whileTap={{ scale: 0.98 }}
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              style={{ padding: "15px 36px", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", cursor: "pointer", transition: "all 0.3s" }}>
              Contact Me
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
        style={{ position: "absolute", bottom: 36, right: 48, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "3px", color: "rgba(255,255,255,0.4)", writingMode: "vertical-rl" }}>SCROLL</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 1, height: 52, background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }} />
      </motion.div>
    </section>
  );
}
