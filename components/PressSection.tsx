import Image from "next/image";

interface PressItem {
  title: string;
  source: string;
  date: string;
  image: string;
  href: string;
  objectPosition?: string;
  zoom?: number;
}

const pressItems: PressItem[] = [
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
      "University of Alabama Praises Nigerian Student as He Bags Job after Doctorate in Civil Engineering",
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
    source: "University of Alabama News",
    date: "2024",
    image:
      "https://news.ua.edu/wp-content/uploads/2024/07/2407025_sunday_okafor_featured.jpg",
    href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
    objectPosition: "65% 22%",
    zoom: 1.2,
  },
];

export default function PressSection() {
  return (
    <section
      id="press"
      className="section-pad relative overflow-hidden bg-navy-800"
    >
      <div className="container">
        {/* Header — explicitly centered */}
        <div className="mx-auto mb-16 max-w-[640px] text-center">
          <div className="mb-4 flex items-center justify-center gap-3.5">
            <div className="h-px w-10 bg-white/25" />
            <span className="eyebrow">Publications</span>
            <div className="h-px w-10 bg-white/25" />
          </div>
          <h2 className="m-0 font-display text-[clamp(32px,5vw,58px)] font-light leading-[1.1] text-white">
            Featured{" "}
            <em className="font-semibold">In The Press</em>
          </h2>
          <p className="mt-4 font-display text-lg italic leading-[1.6] text-white/45">
            A journey covered by leading platforms — celebrating excellence,
            scholarship, and impact.
          </p>
        </div>

        {/* Cards — centered rows */}
        <div className="flex flex-wrap justify-center gap-7">
          {pressItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/14 bg-navy-700 no-underline transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/35 sm:w-[calc(50%-14px)] sm:max-w-none lg:w-[calc(33.333%-19px)]"
            >
              <div className="relative h-[228px] w-full shrink-0 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="360px"
                  className="object-cover"
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
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] text-white/45">
                  Read Feature
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
