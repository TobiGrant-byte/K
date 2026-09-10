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
    <section id="research" ref={ref} className="section-pad relative overflow-hidden bg-navy-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#fff_0%,transparent_60%)] opacity-[0.04]" />

      <div className="container">
        {/* Header */}
        <div className="mb-[72px] flex flex-col gap-0">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="mb-4 flex items-center gap-3.5">
            <div className="h-px w-10 shrink-0 bg-white/35" />
            <span className="eyebrow">Research & Development</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-[700px] font-display text-[clamp(32px,5vw,62px)] font-light leading-[1.1] text-white">
            Ideas That Shape How{" "}<em className="font-semibold italic">We Move</em>
          </motion.h2>
        </div>

        {/* Grid: images + areas */}
        <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-[2fr_3fr]">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -36 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-3">
            {/* Chess image commented out
            <div className="img-zoom relative aspect-[4/3] overflow-hidden">
              <Image src="/images/chess.jpg" alt="Dr. Okafor playing chess" fill className="object-cover" sizes="40vw" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.7)_0%,transparent_55%)]" />
              <div className="absolute bottom-4 left-4">
                <div className="eyebrow mb-1">Pleasure</div>
                <div className="font-display text-[15px] italic text-white">Playing chess</div>
              </div>
            </div>
            */}
            <div className="img-zoom relative aspect-[4/3] overflow-hidden">
              <Image src="/images/lecture-hall.jpg" alt="Dr. Okafor lecturing" fill className="object-cover" sizes="40vw" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.7)_0%,transparent_55%)]" />
              <div className="absolute bottom-4 left-4">
                <div className="eyebrow mb-1">Guiding Minds</div>
                <div className="font-display text-[15px] italic text-white">Where ideas find a voice</div>
              </div>
            </div>
          </motion.div>

          {/* Research areas */}
          <div>
            {areas.map((a, i) => (
              <motion.div key={a.n} initial={{ opacity: 0, x: 32 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.65, delay: i * 0.14 + 0.2 }}
                className="relative flex cursor-default gap-5 border-b border-white/[0.07] py-7 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/30 after:transition-[width] after:duration-[400ms] hover:after:w-full">
                <span className="shrink-0 font-display text-[36px] font-light leading-none text-white/[0.12]">{a.n}</span>
                <div>
                  <h3 className="mb-2.5 font-display text-2xl font-medium text-white">{a.title}</h3>
                  <p className="text-sm leading-[1.85] text-white/55">{a.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Lifesavers conf image */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.65 }}
              className="img-zoom relative mt-6 aspect-[16/10] overflow-hidden">
              <Image src="/images/lifesavers-conf.webp" alt="LIFESAVERS 2023 National Conference, Seattle" fill className="object-cover object-[center_22%]" sizes="55vw" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.9)_0%,rgba(5,13,26,0.35)_45%,rgba(5,13,26,0.15)_100%)]" />
              <div className="absolute bottom-3.5 left-4 right-4 md:bottom-7 md:left-6 md:right-6">
                <div className="eyebrow mb-2 text-[11px]">Conference</div>
                <div className="font-display text-[clamp(22px,2.4vw,28px)] font-medium leading-[1.15] text-white">LIFESAVERS 2023</div>
                <div className="mt-1.5 font-title text-[11px] tracking-[2px] text-white/[0.88]">Traffic Safety Scholars · Seattle, WA</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
