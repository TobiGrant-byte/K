"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

type Achievement = {
  year: string;
  title: string;
  org: string;
  desc: string;
  img: string;
  /** LinkedIn post URL — preferred for every achievement. */
  href?: string;
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
  extraLinks?: { label: string; href: string }[];
};

const achievements: Achievement[] = [
  {
    year: "2025",
    title: "Garver Peak Performer Award",
    org: "Garver, USA",
    desc: "Recognized with the Transportation Peak Performer Award at the Garver 2025 Summit in Houston — honoring exceptional performance and potential among professionals in their first two years of practice.",
    img: "/images/garver-award-1.png",
    objectPosition: "center 30%",
    href: "https://www.linkedin.com/posts/sunday-okafor_i-was-recognized-with-the-transportation-activity-7388638154087510016-vvWI",
  },
  {
    year: "2024",
    title: "Licensed Professional Engineer (PE)",
    org: "Texas Board of Professional Engineers and Land Surveyors",
    desc: "Obtained licensure as a Professional Engineer in Texas — a rigorous credential affirming readiness to practice and contribute to safer transportation systems for all road users.",
    img: "/images/credentials.png",
    objectPosition: "center 42%",
    zoom: 1.15,
    transformOrigin: "center 42%",
    href: "https://www.linkedin.com/posts/sunday-okafor_i-have-obtained-my-license-as-a-professional-activity-7465794480223318017-_w9Z",
  },
  {
    year: "2024",
    title: "Doctor of Philosophy",
    org: "The University of Alabama",
    desc: "Conferred PhD in Civil Engineering, specializing in Transportation Systems Engineering from the Department of Civil, Construction and Environmental Engineering with dissertation research on the integration of connected vehicle data for proactive road safety improvement.",
    img: "/images/graduation-denny.webp",
    objectPosition: "center 38%",
    zoom: 1.25,
    transformOrigin: "center 38%",
    href: "https://www.linkedin.com/posts/sunday-okafor_its-official-dr-sunday-chizoba-okafor-activity-7227998699619045376-s8NH",
    extraLinks: [
      {
        label: "UA graduation celebration",
        href: "https://www.linkedin.com/posts/sunday-okafor_rolltide-activity-7240202451956506624-bZ-Z",
      },
    ],
  },
  {
    year: "2023",
    title: "LIFESAVERS Traffic Safety Scholar",
    org: "LIFESAVERS National Conference — Seattle, WA",
    desc: "Selected as a Traffic Safety Scholar at the prestigious LIFESAVERS 2023 National Conference on Highway Safety Priorities in Seattle, Washington — recognizing emerging researchers in road safety.",
    img: "/images/lifesavers-conf.webp",
    objectPosition: "center 28%",
  },
  {
    year: "2021–2024",
    title: "Graduate Research Support",
    org: "Alabama Transportation Institute, The University of Alabama",
    desc: "Funded graduate research across transportation operations, policy, and mobility centers — advancing crash analytics, inclusive mobility, and data-driven safety practice.",
    img: "/images/lecture-hall.jpg",
    objectPosition: "center 35%",
  },
  {
    year: "2023",
    title: "African Students Association President",
    org: "The University of Alabama",
    desc: "Elected President of the African Students Association at UA, leading initiatives that promoted African culture, supported international students, and strengthened community bonds.",
    img: "/images/asa-board.jpg",
    objectPosition: "center 25%",
    href: "https://www.linkedin.com/posts/sunday-okafor_i-am-delighted-to-announce-my-election-as-activity-6923901748248002560-AvzO",
  },
  {
    year: "2022",
    title: "HSIS Excellence in Safety Data Award",
    org: "ITE International Annual Meeting — New Orleans, USA",
    desc: "Awarded the 2022 HSIS Excellence in Safety Data Award at the ITE International Annual Meeting and Exhibition in New Orleans — recognizing outstanding contributions in highway safety information systems and data-driven safety practice.",
    img: "/images/HSIS.jpg",
    objectPosition: "center 30%",
    href: "https://www.linkedin.com/posts/sunday-okafor_itenola2022-rolltide-activity-6960599624537575424-KIzi",
  },
  {
    year: "2019",
    title: "MSc Civil Engineering with Distinction",
    org: "Nottingham Trent University, UK",
    desc: "Awarded a Master of Science in Civil Engineering with Distinction and recognized as the most outstanding student in the cohort. Served as class academic representative and founded the NTU Chess Society — completing a demanding year of study with support from the Commonwealth Scholarship Commission, UK.",
    img: "/images/msc-graduation.jpg",
    objectPosition: "top center",
    zoom: 1.18,
    transformOrigin: "top center",
    href: "https://www.linkedin.com/posts/sunday-okafor_ntugraduation-mscbagged-csc-activity-6610700597085650944-WDHN",
  },
  {
    year: "2019",
    title: "Commonwealth Shared Scholarship",
    org: "UK Commonwealth Scholarship Commission",
    desc: "Received full funding for MSc study at Nottingham Trent University — awarded to exceptional students from Commonwealth nations who demonstrate academic excellence and leadership potential.",
    img: "/images/commonwealth-scholarship.png",
    objectPosition: "center center",
  },
];

function CardContent({ a }: { a: Achievement }) {
  return (
    <>
      <div className="img-zoom relative h-60 overflow-hidden">
        <Image
          src={a.img}
          alt={a.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            objectPosition: a.objectPosition,
            transform: a.zoom ? `scale(${a.zoom})` : undefined,
            transformOrigin: a.transformOrigin || "center center",
          }}
          sizes="33vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.65)_0%,transparent_55%)]" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <span className="font-title text-[10px] uppercase tracking-[3px] text-white/70">{a.year}</span>
          {a.href ? (
            <span className="font-title text-[9px] uppercase tracking-[2px] text-white/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              View post →
            </span>
          ) : null}
        </div>
      </div>
      <div className="px-6 pb-7 pt-6">
        <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-accent">{a.org}</div>
        <h3 className="mb-2.5 font-display text-xl font-semibold leading-[1.25] text-navy-800">{a.title}</h3>
        <p className="text-[13px] leading-[1.75] text-text-muted">{a.desc}</p>
      </div>
    </>
  );
}

export default function Achievements() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="achievements" ref={ref} className="section-pad relative overflow-hidden bg-off-white">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-[72px]"
        >
          <div className="mb-4 flex items-center gap-3.5">
            <div className="section-rule" />
            <span className="font-title text-[10px] uppercase tracking-[4px] text-black">
              Achievements & Milestones
            </span>
          </div>
          <h2 className="font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-black">
            A Career Defined by <em className="font-semibold text-accent">Excellence</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 36 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="overflow-hidden rounded-lg bg-white shadow-[0_2px_20px_rgba(10,22,40,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(10,22,40,0.12)]"
            >
              {a.href ? (
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block no-underline text-inherit"
                  aria-label={`${a.title} — view LinkedIn post`}
                >
                  <CardContent a={a} />
                </a>
              ) : (
                <div className="cursor-default">
                  <CardContent a={a} />
                </div>
              )}

              {a.extraLinks?.length ? (
                <div className="border-t border-navy-800/5 px-6 pb-5">
                  {a.extraLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-3 font-title text-[9px] uppercase tracking-[2px] text-accent no-underline transition-colors hover:text-accent-soft"
                    >
                      {link.label}
                      <span aria-hidden>→</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
