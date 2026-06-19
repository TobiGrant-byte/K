"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const timeline = [
  { year: "2025", title: "Garver Engineering — Project Engineer", org: "Garver, USA", detail: "Delivering transportation infrastructure projects across the United States, applying research-backed expertise to real-world road safety and mobility challenges." },
  { year: "2024", title: "PhD in Transportation Systems Engineering", org: "University of Alabama", detail: "Dissertation research on traffic safety and inclusive mobility at the Alabama Transportation Institute — one of the nation's premier transportation research centers." },
  { year: "2024", title: "Licensed Professional Engineer (PE)", org: "State Engineering Board", detail: "Obtained PE licensure, the gold standard credential for practicing engineers in the United States, demonstrating mastery of civil engineering and public safety responsibility." },
  { year: "2023", title: "LIFESAVERS Traffic Safety Scholar", org: "LIFESAVERS National Conference — Seattle, WA", detail: "Selected as a scholar at the leading national conference on highway safety priorities, recognizing emerging researchers making an impact in road safety science." },
  { year: "2022", title: "President, African Students Association", org: "University of Alabama", detail: "Led the ASA executive board, organizing events that celebrated African culture, supported incoming international students, and built community across the campus." },
  { year: "2021", title: "Graduate Research Assistant", org: "Alabama Transportation Institute, UA", detail: "Conducted funded research across the Center for Transportation Operations, Planning and Safety; the Transportation Policy Research Center; and the Alabama Mobility and Power Center." },
  { year: "2019", title: "MSc Civil Engineering — Commonwealth Scholar", org: "Nottingham Trent University, UK", detail: "Fully funded by the prestigious Commonwealth Shared Scholarship, awarded to exceptional students from Commonwealth nations demonstrating academic excellence and leadership potential." },
];

export default function Credentials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} style={{ background: "var(--navy-900)", position: "relative", overflow: "hidden" }} className="section-pad">
      <div style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "radial-gradient(ellipse at 10% 50%, rgba(255,255,255,0.02) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          {/* Timeline */}
          <div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.35)" }} />
                <span className="eyebrow">Career Journey</span>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(28px,4vw,48px)", color: "#fff", lineHeight: 1.1 }}>
                Built on <em style={{ fontWeight: 600 }}>Hard Work</em> & Global Experience
              </h2>
            </motion.div>

            <div style={{ position: "relative" }}>
              {/* Line */}
              <motion.div initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : {}} transition={{ duration: 1.4, delay: 0.3 }}
                style={{ position: "absolute", left: 6, top: 0, bottom: 0, width: 1, background: "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.03))", transformOrigin: "top" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {timeline.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
                    style={{ display: "flex", gap: 20, padding: "20px 0", paddingLeft: 28, position: "relative", cursor: "default" }} className="timeline-item">
                    {/* Dot */}
                    <div style={{ position: "absolute", left: 0, top: 28, width: 13, height: 13, border: "1px solid rgba(255,255,255,0.35)", background: "var(--navy-900)", borderRadius: "50%", zIndex: 1, transition: "background 0.3s" }} className="timeline-dot" />
                    <div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "3px", color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase" }}>{item.year}</div>
                      <h4 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: "#fff", fontWeight: 500, marginBottom: 4 }}>{item.title}</h4>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", color: "rgba(255,255,255,0.4)", marginBottom: 8, textTransform: "uppercase" }}>{item.org}</div>
                      <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.45)" }}>{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 96 }}>
            <div className="img-zoom" style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", maxHeight: 420 }}>
              <Image src="/images/grad-pensive.webp" alt="Dr. Okafor doctoral regalia" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="40vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.7) 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                  &ldquo;The goal is not just to earn degrees — it is to use knowledge to build safer roads and better lives.&rdquo;
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="img-zoom" style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden" }}>
                <Image src="/images/msc-graduation.jpg" alt="MSc graduation UK" fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="20vw" />
              </div>
              <div className="img-zoom" style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden" }}>
                <Image src="/images/garver-award-1.png" alt="Garver Award" fill style={{ objectFit: "cover" }} sizes="20vw" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <style>{`
        .timeline-item:hover .timeline-dot{background:rgba(255,255,255,0.3)!important}
        @media(max-width:768px){#credentials .container>div>div:first-child{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}
