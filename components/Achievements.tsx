"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const achievements = [
  {
    year: "2025",
    title: "Garver Peak Performer Award",
    org: "Garver, USA",
    desc: "Recognized firm-wide for exceptional performance and significant contributions to multi-state engineering teams, awarded to top talent in the first two years of their career.",
    img: "/images/garver-award-1.png",
    objectPosition: "center 30%",
  },
  {
    year: "2024",
    title: "Licensed Professional Engineer (PE)",
    org: "State Engineering Board",
    desc: "Obtained licensure as a Professional Engineer — a rigorous credential demonstrating mastery of civil engineering principles, safety standards, and professional responsibility.",
    img: "/images/grad-pensive.webp",
    objectPosition: "center 28%",
    transformOrigin: "center 28%",
  },
  {
    year: "2024",
    title: "Doctor of Philosophy",
    org: "University of Alabama",
    desc: "Conferred PhD in Transportation Systems Engineering under the Department of Civil, Construction and Environmental Engineering, with research focused on traffic safety and inclusive mobility.",
    img: "/images/graduation-denny.webp",
    objectPosition: "center 38%",
    zoom: 1.25,
    transformOrigin: "center 38%",
  },
  {
    year: "2023",
    title: "LIFESAVERS Traffic Safety Scholar",
    org: "LIFESAVERS National Conference",
    desc: "Selected as a Traffic Safety Scholar at the prestigious LIFESAVERS 2023 National Conference on Highway Safety Priorities in Seattle, Washington — recognizing emerging researchers in road safety.",
    img: "/images/lifesavers-conf.webp",
    objectPosition: "center 28%",
  },
  {
    year: "2023",
    title: "African Students Association President",
    org: "University of Alabama",
    desc: "Elected President of the African Students Association at UA, leading initiatives that promoted African culture, supported international students, and strengthened community bonds.",
    img: "/images/asa-board.jpg",
    objectPosition: "center 25%",
  },
  {
    year: "2019",
    title: "Commonwealth Shared Scholarship",
    org: "UK Commonwealth Commission",
    desc: "Received full funding for MSc in Civil Engineering at Nottingham Trent University, UK — awarded to exceptional students from Commonwealth nations who demonstrate academic excellence and leadership potential.",
    img: "/images/msc-graduation.jpg",
    objectPosition: "top center",
    zoom: 1.18,
    transformOrigin: "top center",
  },
];

export default function Achievements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="achievements" ref={ref} className="section-pad relative overflow-hidden bg-off-white">
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} className="mb-[72px]">
          <div className="mb-4 flex items-center gap-3.5">
            <div className="h-px w-10 bg-navy-800 opacity-30" />
            <span className="font-title text-[10px] uppercase tracking-[4px] text-navy-500 opacity-65">Achievements & Milestones</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-navy-800">
            A Career Defined by{" "}<em className="font-semibold">Excellence</em>
          </h2>
        </motion.div>

        {/* Achievements grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="cursor-default overflow-hidden rounded-lg bg-white shadow-[0_2px_20px_rgba(10,22,40,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(10,22,40,0.12)]">
              {/* Image */}
              <div className="img-zoom relative h-60 overflow-hidden">
                <Image
                  src={a.img}
                  alt={a.title}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: a.objectPosition,
                    transform: a.zoom ? `scale(${a.zoom})` : undefined,
                    transformOrigin: a.transformOrigin || "center center",
                  }}
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.65)_0%,transparent_55%)]" />
                <div className="absolute bottom-3 left-4">
                  <span className="font-title text-[10px] uppercase tracking-[3px] text-white/70">{a.year}</span>
                </div>
              </div>
              {/* Content */}
              <div className="px-6 pb-7 pt-6">
                <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-navy-500 opacity-55">{a.org}</div>
                <h3 className="mb-2.5 font-display text-xl font-semibold leading-[1.25] text-navy-800">{a.title}</h3>
                <p className="text-[13px] leading-[1.75] text-text-muted">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
