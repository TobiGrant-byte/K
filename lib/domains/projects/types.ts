import type { ImageDisplayConfig, MediaImageRef } from "@/lib/domains/media/display";

/** Project categories — fixed set, same pattern as blog categories. */
export type ProjectCategory =
  | "Safety"
  | "Operations"
  | "Safety & Operations"
  | "ITS"
  | "Others";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Safety",
  "Operations",
  "Safety & Operations",
  "ITS",
  "Others",
];

export const PROJECTS_IMAGE_ASPECT = 4 / 3;

export type ProjectItem = {
  id: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  highlights: string[];
  /** Optional for future use; not shown as CTA unless set later. */
  href: string;
  image: MediaImageRef | null;
  imageConfig: ImageDisplayConfig;
};

export type ProjectsContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  items: ProjectItem[];
  updatedAt: string;
};

export type ProjectsContentInput = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  items: ProjectItem[];
};
