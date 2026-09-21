import type { ImageDisplayConfig, MediaImageRef } from "@/lib/domains/media/display";

/** Impact pillar frame — matches public layout `aspect-[4/3]`. */
export const PHILANTHROPY_IMAGE_ASPECT = 4 / 3;

export type PhilanthropyPillarItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  /** Media Library selection (ImageKit). Null → empty frame on the public page. */
  image: MediaImageRef | null;
  imageConfig: ImageDisplayConfig;
};

/**
 * Impacts page document (`content/philanthropy`).
 */
export type PhilanthropyContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PhilanthropyPillarItem[];
  updatedAt: string;
};

export type PhilanthropyContentInput = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PhilanthropyPillarItem[];
};
