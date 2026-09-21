import type { MediaImageRef } from "@/lib/domains/media/display";

/** About portrait frame — matches public About / Home teaser (`aspect-[360/480]`). */
export const ABOUT_IMAGE_ASPECT = 360 / 480;

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

export type ProfileContent = {
  home: ProfileHomeContent;
  about: ProfileAboutContent;
  updatedAt: string;
};

export type ProfileContentInput = {
  home: ProfileHomeContent;
  about: ProfileAboutContent;
};
