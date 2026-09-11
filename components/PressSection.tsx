"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";

interface PressItem {
  title: string;
  source: string;
  date: string;
  image: string;
  href: string;
  objectPosition?: string;
  zoom?: number;
  excerpt?: string;
}

const pressItems: PressItem[] = [
  {
    title: "Meet #BamaGrad Sunday Okafor",
    source: "The University of Alabama",
    date: "2024",
    image: "https://news.ua.edu/wp-content/uploads/2024/07/2407025_sunday_okafor_featured.jpg",
    href: "https://www.linkedin.com/posts/university-of-alabama_bamagrad-bamagrad-activity-7225199430163927040-RnXX",
    objectPosition: "65% 22%",
    zoom: 1.15,
    excerpt:
      "A first-generation student from Nigeria paving his path toward helping others — choosing The University of Alabama for the support and resources offered to international students, with a doctorate focused on safer roads for everyone.",
  },
  {
    title:
      "Brilliant Nigerian Man Bags First-Class Bachelor's, Master's and PhD at US & UK Universities",
    source: "Scholarship Region",
    date: "2025",
    image:
      "https://www.scholarshipregion.com/wp-content/uploads/2024/08/Brilliant-Nigerian-man-bags-first-class-bachelors-degree-Sunday-Okafor-also-earned-masters-and-PhD-at-US-UK-university-becomes-the-first-graduate-in-his-family.jpg",
    href: "https://www.scholarshipregion.com/brilliant-nigerian-man-bags-first-class-bachelors-degree-masters-and-phd-at-us-uk-university-becomes-the-first-graduate-in-his-family/",
    objectPosition: "center 48%",
  },
  {
    title: "ITE Young Leader to Follow 2024",
    source: "Institute of Transportation Engineers",
    date: "2024",
    image: "/images/lifesavers-conf.webp",
    href: "https://www.ite.org/professional-and-career-development/young-leaders-to-follow/young-leaders-to-follow-for-2024/",
    objectPosition: "center 28%",
  },
  {
    title:
      "The University of Alabama Praises Nigerian Student as He Bags Job after Doctorate in Civil Engineering",
    source: "Legit.ng",
    date: "2024",
    image: "https://cdn.legit.ng/images/1200x675/2401661588845c6b.jpeg?v=1",
    href: "https://www.legit.ng/people/1606304-university-alabama-praises-nigerian-student-bags-job-doctorate-civil-engineering/",
  },
  {
    title: "#NigeriansAreAmazing — Featured by Samuel Aboki",
    source: "LinkedIn",
    date: "2024",
    image: "/images/headshot.jpg",
    href: "https://www.linkedin.com/posts/iamsamuelaboki_nigeriansareamazing-ugcPost-7231205061375217664-88xN/?utm_source=share&utm_medium=member_ios",
    objectPosition: "center 15%",
  },
  {
    title: "The Long and Safe Road: International Graduate Helps Others",
    source: "The University of Alabama News",
    date: "2024",
    image: "https://news.ua.edu/wp-content/uploads/2024/07/2407025_sunday_okafor_featured.jpg",
    href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
    objectPosition: "65% 22%",
    zoom: 1.2,
  },
];

const articles = [
  {
    n: "01",
    tag: "Essay",
    title: "My Perspective on Winning the Commonwealth Shared Scholarship",
    blurb: "How a solution-based development impact essay and a coherent story can change an application.",
    href: "https://www.linkedin.com/pulse/my-perspective-winning-commonwealth-shared-sunday-okafor",
  },
  {
    n: "02",
    tag: "Mindset",
    title: "Scholarship Application: Motivations, Motives and Self-esteem",
    blurb: "Why motive and confidence matter as much as grades when the essays have to sound true.",
    href: "https://www.linkedin.com/pulse/scholarship-application-your-motivations-motives-sunday-okafor",
  },
  {
    n: "03",
    tag: "Strategy",
    title: "Leveraging Areas of Strength in Scholarship Applications",
    blurb: "You do not have to tick every box perfectly — lead with what already sets you apart.",
    href: "https://www.linkedin.com/pulse/leveraging-areas-your-strength-scholarship-sunday-okafor",
  },
  {
    n: "04",
    tag: "Webinar",
    title: "A Webinar on International Scholarship and Personal Development",
    blurb: "Guidance for international applicants on purpose, preparation, and personal growth.",
    href: "https://www.linkedin.com/pulse/webinar-discussion-international-scholarship-personal-sunday-okafor",
  },
];

export default function PressSection() {
  const articlesRef = useRef(null);
  const articlesInView = useInView(articlesRef, { once: true, margin: "-80px" });

  return (
    <section id="press" className="section-pad relative overflow-hidden bg-navy-800">
      <div className="accent-wash" />
      <div className="container">
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          <div className="mb-4 flex items-center justify-center gap-3.5">
            <div className="section-rule-light" />
            <span className="eyebrow">Publications</span>
            <div className="section-rule-light" />
          </div>
          <h2 className="m-0 font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            Featured <em className="font-semibold text-accent-light">In The Press</em>
          </h2>
          <p className="mt-4 font-display text-lg italic leading-[1.6] text-white/45">
            A journey covered by leading platforms — celebrating excellence, scholarship, and impact.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-7">
          {pressItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/14 bg-navy-700 no-underline transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/40 sm:w-[calc(50%-14px)] sm:max-w-none lg:w-[calc(33.333%-19px)]"
            >
              <div className="relative h-[228px] w-full shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="360px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  style={{
                    objectPosition: item.objectPosition || "center",
                    transform: item.zoom ? `scale(${item.zoom})` : undefined,
                    transformOrigin: item.objectPosition || "center center",
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,13,26,0.85)_0%,transparent_55%)]" />
              </div>

              <div className="flex flex-1 flex-col gap-3.5 px-7 pb-8 pt-7">
                <span className="font-title text-[10px] uppercase tracking-[2px] text-white/40">
                  {item.source} · {item.date}
                </span>
                <h3 className="m-0 font-display text-xl font-medium leading-[1.35] text-white">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="m-0 text-[13px] leading-[1.7] text-white/45">{item.excerpt}</p>
                ) : null}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] text-accent-light/70 transition-colors group-hover:text-accent-light">
                  Read Feature
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* LinkedIn articles — scholarship tips */}
        <div ref={articlesRef} className="relative mt-24 overflow-hidden rounded-2xl border border-accent/20 bg-white/[0.03] pt-12 pb-10 md:pt-16 md:pb-12">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-accent-light/10 blur-3xl" />

          <div className="relative px-6 md:px-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={articlesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="mb-12 max-w-[640px]"
            >
              <div className="mb-4 flex items-center gap-3.5">
                <div className="section-rule" />
                <span className="eyebrow">LinkedIn Articles</span>
              </div>
              <h3 className="font-display text-[clamp(26px,3.5vw,40px)] font-light leading-[1.15] text-white">
                Scholarship Tips &amp;{" "}
                <em className="font-semibold text-accent-light">Guidance</em>
              </h3>
              <p className="mt-3 font-display text-base italic leading-[1.7] text-white/45">
                Practical advice for competitive international scholarships — written to help others succeed.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {articles.map((article, i) => (
                <motion.a
                  key={article.href}
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 28 }}
                  animate={articlesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.12 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="group relative flex gap-5 overflow-hidden rounded-xl border border-white/10 bg-navy-800/60 px-5 py-6 no-underline transition-colors duration-300 hover:border-accent/40 hover:bg-navy-800/90 md:px-6"
                >
                  <span
                    className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-accent transition-transform duration-300 group-hover:scale-y-100"
                    aria-hidden
                  />
                  <span className="shrink-0 font-display text-[28px] font-light leading-none text-accent/35 transition-colors duration-300 group-hover:text-accent-light/70">
                    {article.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="mb-2 inline-block font-title text-[9px] uppercase tracking-[2px] text-accent-light/70">
                      {article.tag}
                    </span>
                    <span className="block font-display text-lg font-medium leading-[1.35] text-white/90 transition-colors group-hover:text-white md:text-xl">
                      {article.title}
                    </span>
                    <span className="mt-2 block text-[13px] leading-[1.7] text-white/45">
                      {article.blurb}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 font-title text-[9px] uppercase tracking-[2px] text-white/35 transition-all duration-300 group-hover:gap-3 group-hover:text-accent-light">
                      Read on LinkedIn
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
