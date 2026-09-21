"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const timeline = [
  {
    year: "2024",
    title: "Garver — Project Engineer",
    org: "Garver, USA",
    detail:
      "Delivering transportation infrastructure projects across the United States, applying research-backed expertise to real-world road safety and mobility challenges.",
  },
  {
    year: "2024",
    title: "PhD in Civil Engineering — Transportation Systems",
    org: "The University of Alabama",
    detail:
      "Dissertation research on integrating connected vehicle data for proactive road safety improvement at the Alabama Transportation Institute — one of the nation's premier transportation research centers.",
  },
  {
    year: "2026",
    title: "Licensed Professional Engineer (PE)",
    org: "Texas Board of Professional Engineers and Land Surveyors",
    detail:
      "Obtained PE licensure, the gold standard credential for practicing engineers in the United States, demonstrating mastery of civil engineering and public safety responsibility.",
  },
  {
    year: "2023",
    title: "LIFESAVERS Traffic Safety Scholar",
    org: "LIFESAVERS National Conference — Seattle, WA",
    detail:
      "Selected as a scholar at the leading national conference on highway safety priorities, recognizing emerging researchers making an impact in road safety science.",
  },
  {
    year: "2022",
    title: "President, African Students Association",
    org: "The University of Alabama",
    detail:
      "Led the ASA executive board, organizing events that celebrated African culture, supported incoming international students, and built community across the campus.",
  },
  {
    year: "2021",
    title: "Graduate Research Assistant",
    org: "Alabama Transportation Institute, The University of Alabama",
    detail:
      "Conducted funded research across the Center for Transportation Operations, Planning and Safety; the Transportation Policy Research Center; and the Alabama Mobility and Power Center.",
  },
  {
    year: "2019",
    title: "MSc Civil Engineering — Commonwealth Scholar",
    org: "Nottingham Trent University, UK",
    detail:
      "Fully funded by the prestigious Commonwealth Shared Scholarship, awarded to exceptional students from Commonwealth nations demonstrating academic excellence and leadership potential.",
  },
];

export default function Credentials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="credentials"
      ref={ref}
      className="section-pad relative overflow-hidden bg-navy-900"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-[60%] bg-[radial-gradient(ellipse_at_10%_50%,rgba(255,255,255,0.02)_0%,transparent_65%)]" />

      <div className="container">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-20">
          {/* Timeline */}
          <div className="order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-14"
            >
              <div className="mb-4 flex items-center gap-3.5">
                <div className="section-rule" />
                <span className="eyebrow">Career Journey</span>
              </div>
              <h2 className="font-display text-[clamp(28px,4vw,48px)] font-light leading-[1.1] text-white">
                Built on{" "}
                <em className="font-semibold text-accent-light">Hard Work</em> &
                Global Experience
              </h2>
            </motion.div>

            <div className="relative">
              {/* Line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 1.4, delay: 0.3 }}
                className="absolute bottom-0 left-1.5 top-0 w-px origin-top bg-[linear-gradient(to_bottom,var(--color-accent),rgba(74,143,232,0.05))]"
              />

              <div className="flex flex-col gap-0">
                {timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
                    className="group relative flex cursor-default gap-5 py-5 pl-7"
                  >
                    {/* Dot */}
                    <div className="absolute left-0 top-7 z-[1] h-[13px] w-[13px] rounded-full border border-accent/50 bg-navy-900 transition-colors duration-300 group-hover:bg-accent/40" />
                    <div>
                      <div className="mb-1.5 font-title text-[9px] uppercase tracking-[3px] text-accent-light/70">
                        {item.year}
                      </div>
                      <h4 className="mb-1 font-display text-[19px] font-medium text-white">
                        {item.title}
                      </h4>
                      <div className="mb-2 font-title text-[9px] uppercase tracking-[1px] text-white/40">
                        {item.org}
                      </div>
                      <p className="text-[13px] leading-[1.8] text-white/45">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 flex flex-col gap-4 md:sticky md:top-24 md:order-2"
          >
            <div className="img-zoom relative aspect-[3/4] max-h-[420px] overflow-hidden rounded-xl">
              <Image
                src={"/images/grad-pensive.webp"}
                alt="Dr. Okafor doctoral regalia"
                fill
                className="object-cover object-[center_18%]"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.7)_0%,transparent_50%)]" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-display text-[17px] italic leading-[1.5] text-white/85">
                  &ldquo;The goal is not just to earn degrees — it is to use
                  knowledge to build safer roads and better lives.&rdquo;
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="img-zoom relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={"/images/msc-graduation.jpg"}
                  alt="MSc graduation UK"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
              <div className="img-zoom relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={"/images/garver-award-1.png"}
                  alt="Garver Award"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
