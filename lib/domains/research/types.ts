import type { MediaImageRef } from "@/lib/domains/media/display";

/** Focus image frame — matches public Research layout `aspect-[4/3]`. */
export const RESEARCH_IMAGE_ASPECT = 4 / 3;

/** Research in Action cards — matches `aspect-[16/10]`. */
export const RESEARCH_ACTION_IMAGE_ASPECT = 16 / 10;

export type ResearchArea = {
  id: string;
  title: string;
  description: string;
};

export type ResearchDevelopmentContent = {
  title: string;
  titleAccent: string;
  image: MediaImageRef | null;
  imageEyebrow: string;
  imageCaption: string;
  areas: ResearchArea[];
};

export type ResearchActionItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  /** Empty = not a link (CTA hidden). When set, public CTA is always “View on LinkedIn”. */
  href: string;
  image: MediaImageRef | null;
  /** Reserved for legacy writes; public pages never use local fallbacks. */
  fallbackSrc: string;
};

export type ResearchActionContent = {
  title: string;
  titleAccent: string;
  subtitle: string;
  items: ResearchActionItem[];
};

/**
 * Shared Research page document (`content/research`).
 * development = R&D block; action = Research in Action block.
 * Google Scholar card stays hardcoded in `components/Research.tsx`.
 */
export type ResearchContent = {
  development: ResearchDevelopmentContent;
  action: ResearchActionContent;
  updatedAt: string;
};

export type ResearchContentInput = {
  development: ResearchDevelopmentContent;
  action: ResearchActionContent;
};
