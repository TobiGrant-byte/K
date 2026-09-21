import {
  createMediaImageRef,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";
import type { PhilanthropyContent } from "@/lib/domains/philanthropy/types";

function config(
  positionX: number,
  positionY: number,
  zoom = 1,
): ImageDisplayConfig {
  return { positionX, positionY, zoom };
}

function pillarImage(
  galleryImageId: string,
  positionX: number,
  positionY: number,
  zoom = 1,
) {
  return createMediaImageRef(galleryImageId, config(positionX, positionY, zoom));
}

/** Admin seed only — written once into Firebase via ensurePhilanthropyContentSeeded. */
export const PHILANTHROPY_FALLBACK: PhilanthropyContent = {
  eyebrow: "Impacts",
  title: "Giving Back to",
  titleAccent: "Society",
  subtitle:
    "A commitment to empowering people, strengthening communities, and advancing public safety.",
  items: [
    {
      id: "impact-scholars",
      title: "Mentoring Aspiring Scholars",
      description:
        "Through LinkedIn articles and conversations, Dr. Okafor shares practical scholarship guidance — helping first-generation and international students navigate competitive applications with clarity and confidence.",
      href: "/publications#scholarship-tips",
      cta: "Read scholarship tips",
      image: pillarImage("legacy-commonwealth-scholarship.png", 0.5, 0.3),
      imageConfig: config(0.5, 0.3),
    },
    {
      id: "impact-stillman",
      title: "Presentation at Stillman College",
      description:
        "Spoke to young scholars from the United States and India on mobility gaps, transport safety, and equity across developed and developing nations — arguing that roads are for people first, and that pedestrians, cyclists, and transit users deserve the same safety priority as motorists. Presented with The University of Alabama and Stillman College.",
      href: "https://www.linkedin.com/posts/sunday-okafor_earlier-today-i-had-the-privilege-of-delivering-ugcPost-7077728496348762112-8act",
      cta: "View LinkedIn post",
      image: pillarImage("legacy-lecture-hall.jpg", 0.5, 0.4),
      imageConfig: config(0.5, 0.4),
    },
    {
      id: "impact-asa",
      title: "Building Inclusive Community",
      description:
        "As former President of the African Students Association at The University of Alabama, he fostered belonging for international scholars — organizing cultural programs and support that made campus feel like home.",
      href: "https://www.linkedin.com/posts/sunday-okafor_i-am-delighted-to-announce-my-election-as-activity-6923901748248002560-AvzO",
      cta: "View LinkedIn post",
      image: pillarImage("legacy-asa-board.jpg", 0.5, 0.25),
      imageConfig: config(0.5, 0.25),
    },
    {
      id: "impact-safer-roads",
      title: "Safer Roads for Everyone",
      description:
        "His research and professional practice are rooted in public good: using data, engineering judgment, and collaboration so communities — not just corridors — move more safely.",
      href: "https://news.ua.edu/2024/07/the-long-and-safe-road-international-graduate-helps-others/",
      cta: "Read the UA feature",
      image: pillarImage("legacy-traffic-safety-scholars.jpg", 0.5, 0.35),
      imageConfig: config(0.5, 0.35),
    },
  ],
  updatedAt: "",
};
