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
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -48 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="about-photo"
            style={{ position: "relative", display: "flex", justifyContent: "center", minWidth: 0 }}>
            <div className="about-photo-inner" style={{ position: "relative", width: "100%", maxWidth: 360, paddingBottom: 56, paddingLeft: 28 }}>
              {/* Frame */}
              <div className="about-photo-frame" style={{ position: "absolute", top: 10, left: 38, width: "100%", maxWidth: 360, aspectRatio: "360 / 480", border: "1px solid rgba(10,22,40,0.15)", zIndex: 0 }} />
              {/* Main */}
              <div className="img-zoom about-photo-main" style={{ position: "relative", width: "100%", aspectRatio: "360 / 480", zIndex: 1 }}>
                <Image src="/images/headshot.jpg" alt="Dr. Sunday Okafor" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 360px" />
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="about-copy"
            initial={{ opacity: 0, x: 48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ minWidth: 0, overflowWrap: "break-word" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 1, background: "var(--navy-800)", opacity: 0.4, flexShrink: 0 }} />
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.7 }}>About</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(28px,4vw,52px)", color: "var(--navy-800)", lineHeight: 1.2, marginBottom: 24 }}>
                A Civil Engineer Dedicated to the Future of Safe,{" "}
              <em style={{ fontWeight: 600 }}>Smart Transportation Infrastructure.</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, lineHeight: 1.75, color: "var(--text-secondary)", fontWeight: 400 }}>
                Dr. Sunday Okafor is a licensed Professional Engineer operating at the critical nexus of traffic safety analytics, connected vehicle systems, and complex infrastructure delivery. His work is driven by a singular mission: to use data to make our roads safer, more efficient, and more equitable for everyone.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
                A distinguished scholar, Dr. Okafor earned his Master’s and Doctor of Philosophy (Ph.D.) in Civil Engineering from The University of Alabama, where his research as a Graduate Research Assistant at the Alabama Transportation Institute (ATI)—a premier national hub for transit innovation—focused on advanced crash analytics and predictive modeling. He was awarded his Master of Science (M.Sc.) in Civil Engineering from Nottingham Trent University, UK, as a prestigious Commonwealth Shared Scholar, a testament to his academic excellence and global potential. He holds a Bachelor of Science (B.Sc.) from FUNAAB, Nigeria.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-muted)" }}>
                Today, Dr. Okafor brings this academic rigor to the corporate sector as a Project Engineer at Garver, where he designs safer, more efficient roadway networks for communities across the United States. An active member of ASCE and ITE, he is also a dedicated community builder, having previously served as President of the African Students Association at the University of Alabama, fostering a vibrant and inclusive environment for international scholars.
              </p>
            </div>

            <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} transition={{ duration: 0.7, delay: 0.6 }}
              style={{ height: 1, background: "linear-gradient(to right, var(--navy-800), transparent)", opacity: 0.15, marginBottom: 28, transformOrigin: "left" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px 24px" }}>
              {facts.map(f => (
                <div key={f.label} style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.5, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--navy-800)" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .about-photo-inner {
            padding-left: 16px !important;
            padding-bottom: 28px !important;
            max-width: min(360px, 100%) !important;
          }
          .about-photo-frame {
            left: 20px !important;
            width: calc(100% - 8px) !important;
            max-width: none !important;
          }
          .about-copy h2 {
            font-size: clamp(26px, 7vw, 36px) !important;
          }
          .about-copy p {
            font-size: 15px !important;
          }
        }
      `}</style>
    </section>
  );
}
