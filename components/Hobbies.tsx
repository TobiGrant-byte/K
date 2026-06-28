"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const hobbies = [
  {
    title: "Playing Chess",
    desc: "A game of strategy, patience, and precision — chess mirrors the way Dr. Okafor approaches every engineering challenge. Always thinking several moves ahead.",
    img: "/images/chess 1.jpg",
    icon: "♟",
  },
  {
    title: "Talking to His Wife",
    desc: "His favourite hobby, his greatest joy, and his most important conversation every day. Behind every great engineer is an even greater partnership.",
    img: "/images/couple.png",
    icon: "♡",
  },
];

export default function Hobbies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} style={{ background: "var(--navy-700)", position: "relative", overflow: "hidden" }} className="section-pad">
      {/* Soft radial glow */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "radial-gradient(ellipse at 50% 100%, #fff 0%, transparent 60%)", pointerEvents: "none" }} />

      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 72, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <span className="eyebrow">Beyond the Lab</span>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,5vw,58px)", color: "#fff", lineHeight: 1.1 }}>
            The Man Behind the <em style={{ fontWeight: 600 }}>PhD</em>
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.45)", marginTop: 14, maxWidth: 480, margin: "14px auto 0" }}>
            Excellence in engineering begins with a life well-lived outside of it.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {hobbies.map((h, i) => (
            <motion.div key={h.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.75, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", cursor: "default" }}
            >
              {/* Image */}
              <div className="img-zoom" style={{ position: "relative", height: 280, overflow: "hidden" }}>
                <Image src={h.img} alt={h.title} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="45vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.8) 0%, rgba(5,13,26,0.1) 60%)" }} />
                {/* Big icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: i * 0.18 + 0.4, type: "spring", stiffness: 200 }}
                  style={{ position: "absolute", top: 20, right: 20, width: 52, height: 52, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  {h.icon}
                </motion.div>
              </div>

              {/* Text */}
              <div style={{ padding: "28px 28px 32px" }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, color: "#fff", marginBottom: 12, lineHeight: 1.2 }}>
                  {h.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.5)" }}>
                  {h.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{ textAlign: "center", marginTop: 64 }}
        >
          <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)", margin: "0 auto 28px" }} />
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 20, color: "rgba(255,255,255,0.35)", maxWidth: 500, margin: "0 auto" }}>
            &quot;A great mind is nothing without a great heart — and a great partner to share life with.&quot;
          </p>
        </motion.div>
      </div>

      <style>{`@media(max-width:640px){#hobbies-section .container>div:nth-child(2){grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}
