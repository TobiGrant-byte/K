import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";
import { siteMediaImageKitUrl } from "@/lib/domains/media/site-media-migration";
import type { PublicationsContent } from "@/lib/domains/publications/types";

function config(
  positionX: number,
  positionY: number,
  zoom = 1,
): ImageDisplayConfig {
  return { positionX, positionY, zoom };
}

/**
 * Canonical static fallback — existing PressSection “Featured In The Press” copy.
 * Scholarship Tips block stays hard-coded on the public page (separate CMS later).
 */
export const PUBLICATIONS_FALLBACK: PublicationsContent = {
  title: "Featured",
  titleAccent: "In The Press",
  subtitle:
    "A journey covered by leading platforms — celebrating excellence, scholarship, and impact.",
  items: [
    {
      id: "press-bamagrad",
      title: "Meet #BamaGrad Sunday Okafor",
      source: "The University of Alabama",
      year: "2024",
      excerpt:
        "A first-generation student from Nigeria paving his path toward helping others — choosing The University of Alabama for the support and resources offered to international students, with a doctorate focused on safer roads for everyone.",
      href: "https://www.linkedin.com/posts/university-of-alabama_bamagrad-bamagrad-activity-7225199430163927040-RnXX",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("headshot.jpg"),
      imageConfig: config(0.65, 0.22, 1.15),
    },
    {
      id: "press-scholarship-region",
      title:
        "Brilliant Nigerian Man Bags First-Class Bachelor's, Master's and PhD at US & UK Universities",
      source: "Scholarship Region",
      year: "2025",
      excerpt: "",
      href: "https://www.scholarshipregion.com/brilliant-nigerian-man-bags-first-class-bachelors-degree-masters-and-phd-at-us-uk-university-becomes-the-first-graduate-in-his-family/",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("headshot.jpg"),
      imageConfig: config(0.5, 0.48),
    },
    {
      id: "press-ite-young-leader",
      title: "ITE Young Leader to Follow 2024",
      source: "Institute of Transportation Engineers",
      year: "2024",
      excerpt: "",
      href: "https://www.ite.org/professional-and-career-development/young-leaders-to-follow/young-leaders-to-follow-for-2024/",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("lifesavers-conf.webp"),
      imageConfig: config(0.5, 0.28),
    },
    {
      id: "press-legit",
      title:
        "The University of Alabama Praises Nigerian Student as He Bags Job after Doctorate in Civil Engineering",
      source: "Legit.ng",
      year: "2024",
      excerpt: "",
      href: "https://www.legit.ng/people/1606304-university-alabama-praises-nigerian-student-bags-job-doctorate-civil-engineering/",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("headshot.jpg"),
      imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
    },
    {
      id: "press-nigerians-amazing",
      title: "#NigeriansAreAmazing — Featured by Samuel Aboki",
      source: "LinkedIn",
      year: "2024",
      excerpt: "",
      href: "https://www.linkedin.com/posts/iamsamuelaboki_nigeriansareamazing-ugcPost-7231205061375217664-88xN/?utm_source=share&utm_medium=member_ios",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("headshot.jpg"),
      imageConfig: config(0.5, 0.15),
    },
    {
      id: "press-long-safe-road",
      title: "The Long and Safe Road: International Graduate Helps Others",
      source: "The University of Alabama News",
      year: "2024",
      excerpt: "",
      href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
      image: null,
      fallbackSrc: siteMediaImageKitUrl("headshot.jpg"),
      imageConfig: config(0.65, 0.22, 1.2),
    },
  ],
  updatedAt: "",
};
