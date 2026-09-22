import type { ImageDisplayConfig, MediaImageRef } from "@/lib/domains/media/display";

/** Milestone card frame — public cards use `h-60`. */
export const ACHIEVEMENTS_CARD_IMAGE_ASPECT = 3 / 2;

/** Career Journey portrait — `aspect-[3/4]`. */
export const ACHIEVEMENTS_PORTRAIT_IMAGE_ASPECT = 3 / 4;

/** Career Journey square thumbs. */
export const ACHIEVEMENTS_SQUARE_IMAGE_ASPECT = 1;

export type AchievementExtraLink = {
  id: string;
  label: string;
  href: string;
};

export type AchievementMilestoneItem = {
  id: string;
  year: string;
  title: string;
  org: string;
  description: string;
  href: string;
  image: MediaImageRef | null;
  imageConfig: ImageDisplayConfig;
  extraLinks: AchievementExtraLink[];
};

export type AchievementTimelineItem = {
  id: string;
  year: string;
  title: string;
  org: string;
  detail: string;
};

export type AchievementsMilestonesContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  items: AchievementMilestoneItem[];
};

export type AchievementsJourneyContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  titleAfter: string;
  quote: string;
  timeline: AchievementTimelineItem[];
  portraitImage: MediaImageRef | null;
  portraitImageConfig: ImageDisplayConfig;
  secondaryImageA: MediaImageRef | null;
  secondaryImageAConfig: ImageDisplayConfig;
  secondaryImageB: MediaImageRef | null;
  secondaryImageBConfig: ImageDisplayConfig;
};

/**
 * Achievements page document (`content/achievements`).
 * milestones = cards; journey = Career Journey timeline + images.
 */
export type AchievementsContent = {
  milestones: AchievementsMilestonesContent;
  journey: AchievementsJourneyContent;
  updatedAt: string;
};

export type AchievementsContentInput = {
  milestones: AchievementsMilestonesContent;
  journey: AchievementsJourneyContent;
};
