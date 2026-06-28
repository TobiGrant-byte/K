"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const awards = [
  {
    year: "2025",
    title: "Garver Peak Performer Award",
    org: "Garver, USA",
    desc: "Recognized firm-wide for exceptional performance and significant contributions to multi-state engineering teams, awarded to top talent in the first two years of their career.",
    img: "/images/garver-award-1.png",
  },
  {
    year: "2024",
    title: "Licensed Professional Engineer (PE)",
    org: "State Engineering Board",
    desc: "Obtained licensure as a Professional Engineer — a rigorous credential demonstrating mastery of civil engineering principles, safety standards, and professional responsibility.",
    img: "/images/grad-pensive.webp",
  },
  {
    year: "2024",
    title: "Doctor of Philosophy",
    org: "University of Alabama",
    desc: "Conferred PhD in Transportation Systems Engineering under the Department of Civil, Construction and Environmental Engineering, with research focused on traffic safety and inclusive mobility.",
    img: "/images/graduation-denny.webp",
  },
  {
    year: "2023",
    title: "LIFESAVERS Traffic Safety Scholar",
    org: "LIFESAVERS National Conference",
    desc: "Selected as a Traffic Safety Scholar at the prestigious LIFESAVERS 2023 National Conference on Highway Safety Priorities in Seattle, Washington — recognizing emerging researchers in road safety.",
    img: "/images/lifesavers-conf.webp",
  },
  {
    year: "2023",
    title: "African Students Association President",
    org: "University of Alabama",
    desc: "Elected President of the African Students Association at UA, leading initiatives that promoted African culture, supported international students, and strengthened community bonds.",
    img: "/images/asa-board.jpg",
  },
  {
    year: "2019",
    title: "Commonwealth Shared Scholarship",
    org: "UK Commonwealth Commission",
    desc: "Received full funding for MSc in Civil Engineering at Nottingham Trent University, UK — awarded to exceptional students from Commonwealth nations who demonstrate academic excellence and leadership potential.",
    img: "/images/msc-graduation.jpg",
  },
];

export default function Awards() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="awards" ref={ref} style={{ background: "var(--off-white)", position: "relative", overflow: "hidden" }} className="section-pad">
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 40, height: 1, background: "var(--navy-800)", opacity: 0.3 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.65 }}>Recognition & Milestones</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(32px,5vw,58px)", color: "var(--navy-800)", lineHeight: 1.1 }}>
            A Career Defined by{" "}<em style={{ fontWeight: 600 }}>Excellence</em>
          </h2>
        </motion.div>

        {/* Awards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {awards.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{ background: "#fff", overflow: "hidden", boxShadow: "0 2px 20px rgba(10,22,40,0.06)", cursor: "default", transition: "box-shadow 0.3s" }}
              className="award-card">
              {/* Image */}
              <div className="img-zoom" style={{ position: "relative", height: 200, overflow: "hidden" }}>
                <Image src={a.img} alt={a.title} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="33vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,13,26,0.65) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "3px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>{a.year}</span>
                </div>
              </div>
              {/* Content */}
              <div style={{ padding: "24px 24px 28px" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "var(--navy-500)", opacity: 0.55, marginBottom: 8 }}>{a.org}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: "var(--navy-800)", marginBottom: 10, lineHeight: 1.25 }}>{a.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text-muted)" }}>{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        .award-card:hover{box-shadow:0 12px 40px rgba(10,22,40,0.12)!important}
        @media(max-width:1024px){#awards .container>div:last-child{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:640px){#awards .container>div:last-child{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}
