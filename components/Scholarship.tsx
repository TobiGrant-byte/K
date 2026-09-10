"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const scholarships = [
  {
    year: "2019",
    title: "Commonwealth Shared Scholarship",
    org: "UK Commonwealth Commission",
    desc: "Fully funded MSc in Civil Engineering at Nottingham Trent University, UK — awarded to exceptional students from Commonwealth nations who demonstrate academic excellence and leadership potential.",
    img: "/images/msc-graduation.jpg",
    objectPosition: "top center",
  },
  {
    year: "2023",
    title: "LIFESAVERS Traffic Safety Scholar",
    org: "LIFESAVERS National Conference — Seattle, WA",
    desc: "Selected as a Traffic Safety Scholar at the leading national conference on highway safety priorities, recognizing emerging researchers making an impact in road safety science.",
    img: "/images/lifesavers-conf.webp",
    objectPosition: "center 28%",
  },
  {
    year: "2021–2024",
    title: "Graduate Research Support",
    org: "Alabama Transportation Institute, University of Alabama",
    desc: "Funded graduate research across transportation operations, policy, and mobility centers — advancing crash analytics, inclusive mobility, and data-driven safety practice.",
    img: "/images/graduation-denny.webp",
    objectPosition: "center 38%",
  },
];

export default function Scholarship() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="scholarship" ref={ref} className="section-pad relative overflow-hidden bg-navy-800">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px] max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="h-px w-10 bg-white/35" />
            <span className="eyebrow">Scholarship</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            Opportunities That{" "}<em className="font-semibold">Opened Doors</em>
          </h2>
          <p className="mt-4 font-display text-lg italic leading-[1.7] text-white/50">
            From Commonwealth support to national safety scholarships — pathways that shaped a career in engineering and service.
          </p>
        </motion.div>

        <div className="flex flex-col gap-7">
          {scholarships.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.12 }}
              className="grid grid-cols-1 items-stretch gap-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] md:grid-cols-[minmax(0,280px)_1fr]"
            >
              <div className="img-zoom relative min-h-[200px] md:min-h-[220px]">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover"
                  style={{ objectPosition: s.objectPosition }}
                  sizes="280px"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:py-7 md:pl-0 md:pr-7">
                <div className="mb-2.5 font-title text-[10px] uppercase tracking-[3px] text-white/45">
                  {s.year} · {s.org}
                </div>
                <h3 className="mb-3 font-display text-[28px] font-medium leading-[1.2] text-white">
                  {s.title}
                </h3>
                <p className="max-w-[560px] text-[15px] leading-[1.85] text-white/55">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
