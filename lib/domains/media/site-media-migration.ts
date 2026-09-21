import type { GalleryCategory } from "@/lib/media";
import { imageKitUrlEndpoint } from "@/lib/imagekit/config";

/**
 * Site images to upload once into ImageKit (`/site-media/{fileName}`).
 * Home hero (`hero-picture.jpeg`) and the Gallery video stay on /public.
 */
export type SiteMediaMigrationItem = {
  /** Filename under public/images */
  fileName: string;
  caption: string;
  category: GalleryCategory;
  /** When true, appears on the public Gallery after migration. */
  showInGallery: boolean;
};

const endpoint = imageKitUrlEndpoint.replace(/\/+$/, "");

/** Stable ImageKit URL for a migrated site file. */
export function siteMediaImageKitUrl(fileName: string): string {
  return `${endpoint}/site-media/${encodeURIComponent(fileName)}`;
}

/** Firestore doc id for a migrated site file. */
export function siteMediaDocId(fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  return `site-${safe}`;
}

/**
 * Every public image except Home hero + video.
 * Captions/categories match the former gallery / library seed lists.
 */
export const SITE_MEDIA_MIGRATION: SiteMediaMigrationItem[] = [
  // Public Gallery set
  {
    fileName: "grad-pensive.webp",
    caption: "Graduation · The University of Alabama",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "credentials.png",
    caption: "Engineering Credentials",
    category: "Recognition",
    showInGallery: true,
  },
  {
    fileName: "graduation-denny.webp",
    caption: "Denny Chimes · Tuscaloosa, Alabama",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "garver-award-1.png",
    caption: "Garver Award Ceremony",
    category: "Recognition",
    showInGallery: true,
  },
  {
    fileName: "lifesavers-conf.webp",
    caption: "LIFESAVERS 2023 · Seattle, WA",
    category: "Recognition",
    showInGallery: true,
  },
  {
    fileName: "traffic-safety-scholars.jpg",
    caption: "Traffic Safety Scholars · LIFESAVERS 2023",
    category: "Recognition",
    showInGallery: true,
  },
  {
    fileName: "graduation-mentor.webp",
    caption: "Graduation Dinner with Stephen Jones",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "msc-graduation.jpg",
    caption: "MSc Graduation · Nottingham Trent, UK",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "africa-ball.jpg",
    caption: "Africa Ball · The University of Alabama",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "headshot.jpg",
    caption: "Professional Portrait",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "grad-lean.webp",
    caption: "Graduation — The University of Alabama",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "lecture-hall.jpg",
    caption: "Presentation at Stillman College",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "speaking.webp",
    caption: "UA Africa Ball",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "garver-award-2.webp",
    caption: "ITE Student Leadership Summit",
    category: "Recognition",
    showInGallery: true,
  },
  {
    fileName: "grad-close.webp",
    caption: "Graduation Portrait",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "seated.webp",
    caption: "The University of Alabama Campus",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "img3.jpeg",
    caption: "",
    category: "Moments",
    showInGallery: true,
  },
  {
    fileName: "img4.jpeg",
    caption: "PhD Dissertation Final Defense",
    category: "Graduation",
    showInGallery: true,
  },
  {
    fileName: "img8.jpeg",
    caption: "ITE Research Award",
    category: "Recognition",
    showInGallery: true,
  },
  // Away From Work + site / CMS fallbacks (library only unless noted)
  {
    fileName: "couple.png",
    caption: "Talking with His Wife",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "chess-img.jpg",
    caption: "Playing Chess",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "soccer-image.jpg",
    caption: "Watching Football",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "asa-board.jpg",
    caption: "ASA Board",
    category: "Recognition",
    showInGallery: false,
  },
  {
    fileName: "commonwealth-scholarship.png",
    caption: "Commonwealth Scholarship",
    category: "Recognition",
    showInGallery: false,
  },
  {
    fileName: "img6.jpg",
    caption: "Professional recognition",
    category: "Recognition",
    showInGallery: false,
  },
  {
    fileName: "HSIS.jpg",
    caption: "HSIS",
    category: "Recognition",
    showInGallery: false,
  },
  {
    fileName: "graver.jpg",
    caption: "Garver · SDITE/MOVITE Joint Meeting",
    category: "Moments",
    showInGallery: false,
  },
  {
    fileName: "graver2.jpg",
    caption: "TRB Annual Meeting",
    category: "Moments",
    showInGallery: false,
  },
  // Remaining public images (exclude hero-picture + video)
  {
    fileName: "chess.jpg",
    caption: "Chess",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "garver-award-3.png",
    caption: "Garver Award",
    category: "Recognition",
    showInGallery: false,
  },
  {
    fileName: "hero-laugh.jpg",
    caption: "Portrait",
    category: "Moments",
    showInGallery: false,
  },
  {
    fileName: "hero-stand.jpg",
    caption: "Portrait",
    category: "Moments",
    showInGallery: false,
  },
  {
    fileName: "hobby-chess.png",
    caption: "Chess",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "hobby-football.png",
    caption: "Football",
    category: "Others",
    showInGallery: false,
  },
  {
    fileName: "img2.jpeg",
    caption: "",
    category: "Moments",
    showInGallery: false,
  },
  {
    fileName: "interview.webp",
    caption: "Interview",
    category: "Moments",
    showInGallery: false,
  },
  {
    fileName: "lecture-2.jpg",
    caption: "Lecture",
    category: "Moments",
    showInGallery: false,
  },
];
