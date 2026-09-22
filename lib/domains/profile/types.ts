import type { ImageDisplayConfig, MediaImageRef } from "@/lib/domains/media/display";

/** About portrait frame — matches public About / Home teaser (`aspect-[360/480]`). */
export const ABOUT_IMAGE_ASPECT = 360 / 480;

/**
 * Hobbies card images — public cards use fixed `h-72` / `sm:h-[260px]`
 * over roughly a third of a 1100px row (~350px). Ratio ≈ 350∶260.
 */
export const HOBBIES_IMAGE_ASPECT = 350 / 260;

export type ProfileHomeContent = {
  /** Rotating professional roles. Multi-line roles use `\n`. */
  roles: string[];
  quote: string;
};

export type ProfileAboutContent = {
  /** Heading text before the accent phrase. */
  title: string;
  /** Italicized phrase rendered after the title. */
  titleAccent: string;
  /** Short intro — shared by Home teaser and About. */
  excerpt: string;
  /** Long-form About body; paragraphs separated by blank lines. */
  body: string;
  /** Media Library ref + page-specific crop. Null → static headshot fallback. */
  image: MediaImageRef | null;
};

export type ProfileHobbyItem = {
  id: string;
  title: string;
  description: string;
  /** Decorative badge character shown on the card image. */
  icon: string;
  /** Media Library selection — required for the public card image. */
  image: MediaImageRef | null;
  /**
   * Presentation for the card frame. When `image` is set, kept in sync with
   * `image.imageConfig` on write.
   */
  imageConfig: ImageDisplayConfig;
};

export type ProfileHobbiesContent = {
  quote: string;
  items: ProfileHobbyItem[];
};

export type ProfileContent = {
  home: ProfileHomeContent;
  about: ProfileAboutContent;
  hobbies: ProfileHobbiesContent;
  updatedAt: string;
};

export type ProfileContentInput = {
  home: ProfileHomeContent;
  about: ProfileAboutContent;
  hobbies: ProfileHobbiesContent;
};
