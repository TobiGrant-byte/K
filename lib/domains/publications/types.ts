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
  /** Media Library selection (preferred). */
  image: MediaImageRef | null;
  /** Original /public or external URL when no Media Library image is selected. */
  fallbackSrc: string;
  /**
   * Presentation for the card frame. When `image` is set, kept in sync with
   * `image.imageConfig` on write.
   */
  imageConfig: ImageDisplayConfig;
};

/**
 * Featured “In The Press” block on `/publications`.
 * Scholarship Tips & Academic Publications are out of scope for this document.
 */
export type PublicationsContent = {
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PublicationPressItem[];
  updatedAt: string;
};

export type PublicationsContentInput = {
  title: string;
  titleAccent: string;
  subtitle: string;
  items: PublicationPressItem[];
};
