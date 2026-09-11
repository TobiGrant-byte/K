export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
};

/** Curated index for site search — pages and key topics only. */
export const searchIndex: SearchEntry[] = [
  {
    title: "Home",
    description: "Meet Dr. Sunday Okafor and get in touch.",
    href: "/",
    category: "Page",
    keywords: ["home", "hero", "contact", "okafor"],
  },
  {
    title: "About",
    description: "Background, education, and professional focus.",
    href: "/about",
    category: "Page",
    keywords: ["about", "biography", "garver", "alabama", "engineer"],
  },
  {
    title: "Research and Development",
    description: "Crash analytics, connected vehicles, and inclusive design.",
    href: "/research",
    category: "Page",
    keywords: ["research", "safety", "crash", "connected", "google scholar", "garver"],
  },
  {
    title: "Publications",
    description: "Press features and LinkedIn scholarship articles.",
    href: "/publications",
    category: "Page",
    keywords: ["publications", "press", "articles", "scholarship tips", "bamagrad"],
  },
  {
    title: "Gallery",
    description: "Moments from campus, conferences, and community.",
    href: "/gallery",
    category: "Page",
    keywords: ["gallery", "photos", "images"],
  },
  {
    title: "Philanthropy",
    description: "Giving back through mentorship, community, and public safety.",
    href: "/philanthropy",
    category: "Page",
    keywords: ["philanthropy", "mentorship", "giving back", "community", "society"],
  },
  {
    title: "Achievements",
    description: "PE license, PhD, awards, scholarships, and career milestones.",
    href: "/achievements",
    category: "Page",
    keywords: [
      "achievements",
      "phd",
      "pe",
      "license",
      "garver",
      "commonwealth",
      "lifesavers",
      "award",
    ],
  },
  {
    title: "Contact",
    description: "Reach out for collaboration, speaking, or mentorship.",
    href: "/#contact",
    category: "Section",
    keywords: ["contact", "email", "message", "collaborate"],
  },
  {
    title: "Google Scholar",
    description: "Peer-reviewed research and citations.",
    href: "https://scholar.google.com/citations?user=iAfft0gAAAAJ&hl=en",
    category: "External",
    keywords: ["google scholar", "citations", "papers", "publications research"],
  },
];

export function searchSite(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return searchIndex.filter((e) => e.category === "Page").slice(0, limit);

  const scored = searchIndex
    .map((entry) => {
      const hay = `${entry.title} ${entry.description} ${entry.keywords.join(" ")}`.toLowerCase();
      let score = 0;
      if (entry.title.toLowerCase().includes(q)) score += 8;
      if (entry.keywords.some((k) => k.includes(q) || q.includes(k))) score += 5;
      if (hay.includes(q)) score += 3;
      q.split(/\s+/).forEach((word) => {
        if (word.length > 2 && hay.includes(word)) score += 1;
      });
      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}
