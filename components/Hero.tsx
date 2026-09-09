"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const words = [
  ["Transportation", "Engineer."],
  ["Researcher."],
  ["Leader."],
];

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
        <Image src="/images/graduation-denny.webp" alt="Dr. Sunday Okafor" fill priority
          style={{ objectFit: "cover", objectPosition: "center 30%" }} sizes="100vw" />
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(5,13,26,0.92) 0%, rgba(5,13,26,0.65) 50%, rgba(5,13,26,0.2) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,1) 0%, rgba(5,13,26,0.3) 40%, transparent 70%)" }} />
      </motion.div>

      {/* Animated dots grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0.07, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Content */}
      <motion.div style={{ position: "relative", zIndex: 10, width: "100%", y: textY, opacity }}>
        <div className="container" style={{ paddingBottom: "72px" }}>

          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 36, height: 1, background: "rgba(255,255,255,0.5)", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
            </span>
          </motion.div>

          {/* Name */}
          <div style={{ overflow: "hidden", marginBottom: 4 }}>
            <motion.h1 initial={{ y: 120 }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(52px,8.5vw,116px)", lineHeight: 0.95, color: "#fff", margin: 0 }}>
              Sunday Chizoba 
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden", marginBottom: 22 }}>
            <motion.h1 initial={{ y: 120 }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontStyle: "italic", fontSize: "clamp(52px,8.5vw,116px)", lineHeight: 0.95, color: "rgba(255,255,255,0.92)", margin: 0 }}>
              Okafor
            </motion.h1>
          </div>

          {/* Rotating word */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,2.4vw,28px)", fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1, whiteSpace: "nowrap" }}>PhD, PE ·</span>
            <div style={{ position: "relative", overflow: "hidden", height: 44, minWidth: 220 }}>
              {words.map((lines, i) => (
                <motion.span key={lines.join(" ")}
                  initial={{ y: 44, opacity: 0 }}
                  animate={{ y: [44, 0, 0, -44], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 3, delay: i * 3 + 1.2, repeat: Infinity, repeatDelay: (words.length - 1) * 3 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: 44,
                    fontFamily: "'Cinzel',serif",
                    fontSize: "clamp(14px,1.5vw,17px)",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    position: i === 0 ? "relative" : "absolute",
                    left: 0,
                    top: 0,
                  }}>
                  {lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </motion.span>
              ))}
            </div>
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
