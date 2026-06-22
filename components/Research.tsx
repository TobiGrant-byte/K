"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const areas = [
  { n: "01", title: "Advanced Crash Analytics & Predictive Safety", desc: "Investigating the complex interplay of human behavior, roadway geometry, and environmental factors that lead to crashes. Expertise lies in developing predictive safety models, identifying systemic improvements, and implementing state and federal data-driven countermeasures designed to drastically reduce traffic fatalities." },
  { n: "02", title: "Connected Infrastructure & Intelligent Transportation Systems", desc: "Harnessing the power of real-world connected vehicle (CV) data, cloud-based telematics, and AI-driven spatial simulations to optimize corridor performance, assess autonomous vehicle readiness, and build future-proof, resilient municipal highway networks." },
  { n: "03", title: " Inclusive Infrastructure Design", desc: "Championing human-centric transit solutions that serve all populations. Expertise includes adapting spatial data workflows to identify and rectify infrastructure disparities in underserved communities, enhance pedestrian networks, and improve mobility in both domestic and international contexts." },
];

export default function Research() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="research" ref={ref} style={{ background: "var(--navy-800)", position: "relative", overflow: "hidden" }} className="section-pad">
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)", pointerEvents: "none" }} />

      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 72 }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <span className="eyebrow">Research & Expertise</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,5vw,62px)", color: "#fff", lineHeight: 1.1, maxWidth: 700 }}>
            Saving Lives Through{" "}<em style={{ fontWeight: 600, fontStyle: "italic" }}>Rigorous Science</em>
          </motion.h2>
        </div>

        {/* Grid: images + areas */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 64, alignItems: "start" }}>
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -36 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="img-zoom" style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
              <Image src="/images/chess 1.jpg" alt="Dr. Okafor presenting road safety research" fill style={{ objectFit: "cover" }} sizes="40vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.7) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Research</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#fff", fontStyle: "italic" }}>Playing chess</div>
              </div>
            </div>
            <div className="img-zoom" style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
              <Image src="/images/lecture-hall.jpg" alt="Dr. Okafor lecturing" fill style={{ objectFit: "cover" }} sizes="40vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.7) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}>Education</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#fff", fontStyle: "italic" }}>Socio-Cultural & Transportation</div>
              </div>
            </div>
          </motion.div>

          {/* Research areas */}
          <div>
            {areas.map((a, i) => (
              <motion.div key={a.n} initial={{ opacity: 0, x: 32 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.65, delay: i * 0.14 + 0.2 }}
                style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", cursor: "default" }}
                className="research-item">
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, color: "rgba(255,255,255,0.12)", flexShrink: 0, lineHeight: 1 }}>{a.n}</span>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#fff", marginBottom: 10, fontWeight: 500 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.55)" }}>{a.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Lifesavers conf image */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.65 }}
              className="img-zoom" style={{ position: "relative", aspectRatio: "16/7", overflow: "hidden", marginTop: 24 }}>
              <Image src="/images/lifesavers-conf.webp" alt="LIFESAVERS 2023 National Conference, Seattle" fill style={{ objectFit: "cover" }} sizes="55vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,13,26,0.85) 0%, rgba(5,13,26,0.2) 100%)" }} />
              <div style={{ position: "absolute", top: "50%", left: 24, transform: "translateY(-50%)" }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>Conference</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#fff", fontWeight: 400 }}>LIFESAVERS 2023</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Traffic Safety Scholars · Seattle, WA</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <style>{`
        .research-item::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:rgba(255,255,255,0.3);transition:width 0.4s}
        .research-item:hover::after{width:100%}
        @media(max-width:768px){#research .container>div:last-child{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}
