export type BlogCategory = "Family" | "Career" | "Society" | "Reflections";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: BlogCategory;
  coverImage?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  published: boolean;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  "Family",
  "Career",
  "Society",
  "Reflections",
];

/** Max images per post (cover counts toward this). */
export const MAX_BLOG_IMAGES = 3;

/** Canonical display/crop size — all blog frames use 16:10. */
export const BLOG_IMAGE_ASPECT = 16 / 10;
export const BLOG_IMAGE_WIDTH = 1200;
export const BLOG_IMAGE_HEIGHT = 750;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function createId(): string {
  return `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatPostDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Short blurb for social/share previews — title stays separate. */
export function truncateShareExcerpt(
  excerpt: string,
  maxLength = 110,
): string {
  const text = excerpt.replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > 40 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.trimEnd()}…`;
}

export const SITE_URL = "https://dr-okafor.com";

/**
 * Absolute JPEG URL for WhatsApp / X / Facebook.
 * - Forces a .jpg path (many scrapers require an image extension)
 * - Compresses so the file stays under WhatsApp's ~600KB limit
 */
export function toShareJpegUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("imagekit.io")) return url;

    parsed.pathname = parsed.pathname.replace(/\.(webp|png|jpe?g)$/i, ".jpg");
    if (!/\.jpg$/i.test(parsed.pathname)) {
      parsed.pathname = `${parsed.pathname.replace(/\/+$/, "")}.jpg`;
    }
    parsed.search = "";
    parsed.searchParams.set("tr", "f-jpg,w-1200,h-630,c-at_max,q-65");
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Cache-bust query for share links so WhatsApp/Facebook re-fetch previews. */
export function withShareCacheBust(pathOrUrl: string, version: string): string {
  const url = new URL(pathOrUrl, SITE_URL);
  url.searchParams.set("v", version.slice(0, 12) || "1");
  return url.toString();
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
