// components/PressSection.tsx
import Image from "next/image";

interface PressItem {
  title: string;
  source: string;
  date: string;
  image: string;
  href: string;
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
  },
  {
    title: "The Long and Safe Road: International Graduate Helps Others",
    source: "University of Alabama News",
    date: "2024",
    image:
      "https://news.ua.edu/wp-content/uploads/2024/07/2407025_sunday_okafor_featured.jpg",
    href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
  },
];

export default function PressSection() {
  return (
    <section className="relative py-24 px-6 sm:px-10 lg:px-20" style={{ backgroundColor: "#0a1628" }}>
      <div className="mx-auto max-w-3xl text-center mb-16">
        <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-white/50 font-medium">
          Press &amp; Recognition
        </span>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
          Featured{" "}
          <span className="italic font-light text-white/70">In The Press</span>
        </h2>
        <p className="mt-4 text-white/50 text-base sm:text-lg">
          A journey covered by leading platforms — celebrating excellence,
          scholarship, and impact.
        </p>
      </div>

      <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pressItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-colors duration-300"
            style={{ backgroundColor: "#0f2040" }}
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/90 via-[#0a1628]/10 to-transparent" />
            </div>

            <div className="p-5">
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
                {item.source} · {item.date}
              </span>
              <h3 className="mt-2 text-white text-base font-medium leading-snug group-hover:text-white/80 transition-colors duration-300">
                {item.title}
              </h3>
              <span className="mt-3 inline-flex items-center text-sm text-white/40 group-hover:text-white/70 transition-colors duration-300">
                Read Feature
                <svg
                  className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
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
    </section>
  );
}