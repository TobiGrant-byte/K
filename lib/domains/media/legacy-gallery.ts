import type { GalleryCategory } from "@/lib/media";

/**
 * Exact catalog from the previous static public Gallery.
 * Used to import into the Media Library without deleting /public files.
 * Presentation hints preserve the original masonry look when URLs match.
 */
export type LegacyGalleryItem = {
  /** Public path under /public — never deleted by import. */
  src: string;
  caption: string;
  category: GalleryCategory;
  width: number;
  height: number;
  media?: "image" | "video";
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
};

export const LEGACY_SITE_GALLERY: LegacyGalleryItem[] = [
  {
    src: "/images/grad-pensive.webp",
    caption: "Graduation · The University of Alabama",
    category: "Graduation",
    width: 1200,
    height: 1500,
    objectPosition: "center 28%",
    transformOrigin: "center 28%",
  },
  {
    src: "/images/credentials.png",
    caption: "Engineering Credentials",
    category: "Recognition",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/graduation-denny.webp",
    caption: "Denny Chimes · Tuscaloosa, Alabama",
    category: "Graduation",
    width: 1000,
    height: 1400,
    objectPosition: "center 38%",
    zoom: 1.25,
    transformOrigin: "center 38%",
  },
  {
    src: "/images/garver-award-1.png",
    caption: "Garver Award Ceremony",
    category: "Recognition",
    width: 1400,
    height: 900,
    objectPosition: "center 30%",
  },
  {
    src: "/images/lifesavers-conf.webp",
    caption: "LIFESAVERS 2023 · Seattle, WA",
    category: "Recognition",
    width: 1400,
    height: 900,
    objectPosition: "center 28%",
  },
  {
    src: "/images/traffic-safety-scholars.jpg",
    caption: "Traffic Safety Scholars · LIFESAVERS 2023",
    category: "Recognition",
    width: 1400,
    height: 1000,
  },
  {
    src: "/images/graduation-mentor.webp",
    caption: "Graduation Dinner with Stephen Jones",
    category: "Graduation",
    width: 1400,
    height: 1000,
  },
  {
    src: "/images/msc-graduation.jpg",
    caption: "MSc Graduation · Nottingham Trent, UK",
    category: "Graduation",
    width: 1100,
    height: 1400,
    objectPosition: "top center",
    zoom: 1.18,
    transformOrigin: "top center",
  },
  {
    src: "/images/africa-ball.jpg",
    caption: "Africa Ball · The University of Alabama",
    category: "Moments",
    width: 1000,
    height: 1400,
    objectPosition: "center 35%",
    zoom: 1.15,
    transformOrigin: "center 35%",
  },
  {
    src: "/images/headshot.jpg",
    caption: "Professional Portrait",
    category: "Moments",
    width: 1000,
    height: 1250,
    objectPosition: "center 20%",
    transformOrigin: "center 20%",
  },
  {
    src: "/images/grad-lean.webp",
    caption: "Graduation — The University of Alabama",
    category: "Graduation",
    width: 1100,
    height: 1400,
    objectPosition: "center 20%",
    transformOrigin: "center 20%",
  },
  {
    src: "/images/lecture-hall.jpg",
    caption: "Presentation at Stillman College",
    category: "Moments",
    width: 1400,
    height: 900,
  },
  {
    src: "/images/speaking.webp",
    caption: "UA Africa Ball",
    category: "Moments",
    width: 1200,
    height: 900,
    zoom: 1.32,
    transformOrigin: "center center",
  },
  {
    src: "/images/garver-award-2.webp",
    caption: "ITE Student Leadership Summit",
    category: "Recognition",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/grad-close.webp",
    caption: "Graduation Portrait",
    category: "Graduation",
    width: 1000,
    height: 1300,
    objectPosition: "center 15%",
    transformOrigin: "center 15%",
  },
  {
    src: "/images/seated.webp",
    caption: "The University of Alabama Campus",
    category: "Moments",
    width: 1100,
    height: 1400,
    objectPosition: "center 40%",
    transformOrigin: "center 40%",
  },
  {
    src: "/images/img3.jpeg",
    caption: "",
    category: "Moments",
    width: 6000,
    height: 4000,
    objectPosition: "center 20%",
  },
  {
    src: "/images/img4.jpeg",
    caption: "PhD Dissertation Final Defense",
    category: "Graduation",
    width: 6000,
    height: 4000,
    objectPosition: "center 35%",
  },
  {
    src: "/images/img8.jpeg",
    caption: "ITE Research Award",
    category: "Recognition",
    width: 1600,
    height: 1200,
    objectPosition: "center 35%",
  },
];

/**
 * Public-only video — stays as a /public file, not a Media Library image asset.
 * Shown on the public Gallery; excluded from Admin Media Library.
 */
export const PUBLIC_GALLERY_STATIC_VIDEO: LegacyGalleryItem = {
  src: "/images/img7.MP4",
  caption: "PhD Holding Ceremony",
  category: "Graduation",
  media: "video",
  width: 1920,
  height: 1080,
};

/**
 * Site images for Media Library only — not shown on public Gallery.
 * Used by “The Man Behind the PhD” (hobbies) and similar sections.
 */
export const LIBRARY_ONLY_SITE_MEDIA: LegacyGalleryItem[] = [
  {
    src: "/images/couple.png",
    caption: "Talking with His Wife",
    category: "Others",
    width: 1200,
    height: 1500,
    objectPosition: "center 22%",
  },
  {
    src: "/images/chess-img.jpg",
    caption: "Playing Chess",
    category: "Others",
    width: 1200,
    height: 900,
    objectPosition: "center center",
  },
  {
    src: "/images/soccer-image.jpg",
    caption: "Watching Football",
    category: "Others",
    width: 1200,
    height: 900,
    objectPosition: "center center",
  },
];

export function isVideoMediaUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function legacyGalleryId(src: string): string {
  const base = src.split("/").pop() ?? src;
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  return `legacy-${safe}`;
}

export function presentationForMediaUrl(imageUrl: string): {
  width: number;
  height: number;
  objectPosition?: string;
  zoom?: number;
  transformOrigin?: string;
  media?: "image" | "video";
} {
  if (
    imageUrl === PUBLIC_GALLERY_STATIC_VIDEO.src ||
    imageUrl.endsWith(PUBLIC_GALLERY_STATIC_VIDEO.src) ||
    imageUrl.toLowerCase().includes("img7.mp4")
  ) {
    return {
      width: PUBLIC_GALLERY_STATIC_VIDEO.width,
      height: PUBLIC_GALLERY_STATIC_VIDEO.height,
      media: "video",
    };
  }
  const match = LEGACY_SITE_GALLERY.find(
    (item) =>
      imageUrl === item.src ||
      imageUrl.endsWith(item.src) ||
      imageUrl.includes(item.src.replace(/^\//, "")),
  );
  if (match) {
    return {
      width: match.width,
      height: match.height,
      objectPosition: match.objectPosition,
      zoom: match.zoom,
      transformOrigin: match.transformOrigin,
      media: match.media,
    };
  }
  return {
    width: 1200,
    height: 900,
    media: isVideoMediaUrl(imageUrl) ? "video" : "image",
  };
}
