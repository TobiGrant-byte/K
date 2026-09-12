"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const pillars = [
  {
    title: "Mentoring Aspiring Scholars",
    desc: "Through LinkedIn articles and conversations, Dr. Okafor shares practical scholarship guidance — helping first-generation and international students navigate competitive applications with clarity and confidence.",
    img: "/images/commonwealth-scholarship.png",
    objectPosition: "center 30%",
    href: "https://www.linkedin.com/pulse/my-perspective-winning-commonwealth-shared-sunday-okafor",
    cta: "Read scholarship tips",
  },
  {
    title: "Socio-Cultural Adaptation Talk",
    desc: "Spoke to young scholars from the United States and India on mobility gaps, transport safety, and equity across developed and developing nations — arguing that roads are for people first, and that pedestrians, cyclists, and transit users deserve the same safety priority as motorists. Presented with The University of Alabama and Stillman College.",
    img: "/images/lecture-hall.jpg",
    objectPosition: "center 40%",
    href: "https://www.linkedin.com/posts/sunday-okafor_earlier-today-i-had-the-privilege-of-delivering-ugcPost-7077728496348762112-8act",
    cta: "View LinkedIn post",
  },
  {
    title: "Building Inclusive Community",
    desc: "As former President of the African Students Association at The University of Alabama, he fostered belonging for international scholars — organizing cultural programs and support that made campus feel like home.",
    img: "/images/asa-board.jpg",
    objectPosition: "center 25%",
    href: "https://www.linkedin.com/posts/sunday-okafor_i-am-delighted-to-announce-my-election-as-activity-6923901748248002560-AvzO",
    cta: "View LinkedIn post",
  },
  {
    title: "Safer Roads for Everyone",
    desc: "His research and professional practice are rooted in public good: using data, engineering judgment, and collaboration so communities — not just corridors — move more safely.",
    img: "/images/traffic-safety-scholars.jpg",
    objectPosition: "center 35%",
    href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
    cta: "Read the UA feature",
  },
];

export default function Philanthropy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="philanthropy"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-800"
    >
      <div className="accent-wash" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 max-w-[720px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="eyebrow">Philanthropy</span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            Giving Back to{" "}
            <em className="font-semibold text-accent-light">Society</em>
          </h2>
          <p className="mt-5 font-display text-lg italic leading-[1.7] text-white/50">
            Beyond credentials and awards — a commitment to lift others:
            mentoring scholars, strengthening community, and advancing safer
            transportation for the public good.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pillars.map((p, i) => {
            const inner = (
              <>
                <div className="img-zoom relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.img}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    style={{ objectPosition: p.objectPosition }}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.75)_0%,transparent_50%)]" />
                </div>
                <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
                  <h3 className="mb-3 font-display text-[22px] font-medium leading-[1.25] text-white">
                    {p.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8] text-white/55">
                    {p.desc}
                  </p>
                  {p.cta ? (
                    <span className="mt-5 inline-flex items-center gap-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 transition-colors group-hover:text-white/80">
                      {p.cta}
                      <span aria-hidden>→</span>
                    </span>
                  ) : null}
                </div>
              </>
            );

            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 32 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.12 }}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
              >
                {p.href ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col no-underline text-inherit"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex h-full flex-col">{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 md:flex-row md:items-center"
        >
          <p className="max-w-xl font-display text-base italic leading-[1.7] text-white/45">
            Career awards and funded opportunities are collected in Achievements
            — this space is for impact beyond the résumé.
          </p>
          <Link
            href="/achievements"
            className="inline-flex shrink-0 border border-accent/40 px-6 py-3.5 font-title text-[10px] uppercase tracking-[2.5px] text-accent-light no-underline transition-colors hover:bg-accent/10"
          >
            View Achievements
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
