"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const facts = [
  { label: "License", value: "Professional Engineer (PE)" }
];

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} style={{ background: "var(--off-white)", position: "relative", overflow: "hidden" }} className="section-pad">
      {/* BG accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: "linear-gradient(to left, rgba(10,22,40,0.04), transparent)", pointerEvents: "none" }} />

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -48 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 360, paddingBottom: 56, paddingLeft: 28 }}>
              {/* Frame */}
              <div style={{ position: "absolute", top: 10, left: 38, width: 360, height: 480, border: "1px solid rgba(10,22,40,0.15)", zIndex: 0 }} />
              {/* Main */}
              <div className="img-zoom" style={{ position: "relative", width: 360, height: 480, zIndex: 1 }}>
                <Image src="/images/headshot.jpg" alt="Dr. Sunday Okafor" fill style={{ objectFit: "cover" }} sizes="360px" />
              </div>
              {/* Secondary */}
              <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35 }}
                className="img-zoom" style={{ position: "absolute", bottom: 0, right: -20, width: 150, height: 185, border: "4px solid var(--off-white)", zIndex: 2, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                <Image src="/images/seated.webp" alt="Dr. Okafor" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="150px" />
              </motion.div>
              {/* Stats card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 }}
                style={{ position: "absolute", bottom: 0, left: 0, background: "var(--navy-800)", padding: "20px 22px", zIndex: 3, width: 170 }}>
                {[{ v: "PhD", l: "Civil Engineering, The University of Alabama" }, { v: "PE", l: "Licensed Engineer" }, { v: "MSc", l: "Nottingham Trent, University of Alabama(Civil Engineering)" }, { v: "BSc", l: "FUNAAB, Nigeria" }].map(s => (
                  <div key={s.l} style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 20, color: "#fff", lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", lineHeight: 1.4 }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: 48 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 1, background: "var(--navy-800)", opacity: 0.4 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.7 }}>About</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,4vw,52px)", color: "var(--navy-800)", lineHeight: 1.1, marginBottom: 24 }}>
              Engineer. Scholar.{" "}
              <em style={{ fontWeight: 600 }}>Champion of Safe Roads.</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 400 }}>
                Dr. Sunday Okafor is a Nigerian-born Civil Engineer whose work sits at the intersection of road safety, inclusive mobility, and connected vehicle technology.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
                He earned his Doctor of Philosophy in Transportation Systems Engineering from the University of Alabama, where he served as a Graduate Research Assistant at the Alabama Transportation Institute (ATI) — one of the nation&#39;s leading transportation research centers. His MSc in Civil Engineering from Nottingham Trent University, UK, was fully funded through the prestigious Commonwealth Shared Scholarship.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
                A licensed Professional Engineer (PE), Dr. Okafor currently works at Garver Engineering, bringing research-backed expertise to real-world transportation infrastructure projects. He is a member of both the American Society of Civil Engineers (ASCE) and the Institute of Transportation Engineers (ITE), and served as President of the African Students Association at the University of Alabama.
              </p>
            </div>

            <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.7, delay: 0.6 }}
              style={{ height: 1, background: "linear-gradient(to right, var(--navy-800), transparent)", opacity: 0.15, marginBottom: 28, transformOrigin: "left" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {facts.map(f => (
                <div key={f.label}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.5, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--navy-800)" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`@media(max-width:768px){#about .container>div{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
    </section>
  );
}
