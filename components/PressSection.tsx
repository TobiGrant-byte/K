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
      className="section-pad"
      style={{ background: "var(--navy-800)", position: "relative", overflow: "hidden" }}
    >
      <div className="container">
        {/* Header — explicitly centered */}
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
            marginBottom: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <span className="eyebrow">Press &amp; Recognition</span>
            <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.25)" }} />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontWeight: 300,
              fontSize: "clamp(32px,5vw,58px)",
              color: "#fff",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Featured{" "}
            <em style={{ fontWeight: 600 }}>In The Press</em>
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 18,
              color: "rgba(255,255,255,0.45)",
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            A journey covered by leading platforms — celebrating excellence,
            scholarship, and impact.
          </p>
        </div>

        {/* Cards — centered rows */}
        <div
          className="press-grid"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 28,
          }}
        >
          {pressItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="press-card"
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                maxWidth: 360,
                background: "var(--navy-700)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 16,
                overflow: "hidden",
                textDecoration: "none",
                transition: "border-color 0.3s, transform 0.3s",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 228,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="360px"
                  style={{
                    objectFit: "cover",
                    objectPosition: item.objectPosition || "center",
                    transform: item.zoom ? `scale(${item.zoom})` : undefined,
                    transformOrigin: item.objectPosition || "center center",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(5,13,26,0.85) 0%, transparent 55%)",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "28px 28px 32px",
                  gap: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {item.source} · {item.date}
                </span>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 20,
                    fontWeight: 500,
                    color: "#fff",
                    lineHeight: 1.35,
                    margin: 0,
                  }}
                >
                  {item.title}
                </h3>
                <span
                  style={{
                    marginTop: "auto",
                    paddingTop: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
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

      <style>{`
        .press-card:hover {
          border-color: rgba(255,255,255,0.35) !important;
          transform: translateY(-4px);
        }
        @media (min-width: 640px) {
          .press-card {
            width: calc(50% - 14px) !important;
            max-width: none !important;
          }
        }
        @media (min-width: 1024px) {
          .press-card {
            width: calc(33.333% - 19px) !important;
          }
        }
      `}</style>
    </section>
  );
}
