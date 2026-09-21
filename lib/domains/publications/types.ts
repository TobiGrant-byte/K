import type { ImageDisplayConfig, MediaImageRef } from "@/lib/domains/media/display";

/**
 * Press card image frame — public cards use fixed `h-[228px]` and ~360px width
 * (`max-w-[360px]` / column widths). Ratio 360∶228.
 */
export const PUBLICATIONS_IMAGE_ASPECT = 360 / 228;

export type PublicationPressItem = {
  id: string;
  title: string;
  source: string;
  year: string;
  /** Optional supporting copy under the title. */
  excerpt: string;
  href: string;
  /** Media Library selection (ImageKit). Null → empty frame on the public page. */
  image: MediaImageRef | null;
  /**
   * Presentation for the card frame. When `image` is set, kept in sync with
   * `image.imageConfig` on write.
   */
  imageConfig: ImageDisplayConfig;
};

export type PublicationTipItem = {
  id: string;
  /** Small label above the title (e.g. Essay, Mindset). */
  tag: string;
  title: string;
  blurb: string;
  href: string;
};

export type PublicationsTipsContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PublicationTipItem[];
};

/**
 * Publications page document (`content/publications`).
 * Press = Featured In The Press; tips = Scholarship Tips & Guidance.
 */
export type PublicationsContent = {
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PublicationPressItem[];
  tips: PublicationsTipsContent;
  updatedAt: string;
};

export type PublicationsContentInput = {
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PublicationPressItem[];
  tips: PublicationsTipsContent;
};
