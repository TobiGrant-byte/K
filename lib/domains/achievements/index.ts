export type {
  AchievementExtraLink,
  AchievementMilestoneItem,
  AchievementTimelineItem,
  AchievementsContent,
  AchievementsContentInput,
  AchievementsJourneyContent,
  AchievementsMilestonesContent,
} from "@/lib/domains/achievements/types";
export {
  ACHIEVEMENTS_CARD_IMAGE_ASPECT,
  ACHIEVEMENTS_PORTRAIT_IMAGE_ASPECT,
  ACHIEVEMENTS_SQUARE_IMAGE_ASPECT,
} from "@/lib/domains/achievements/types";
export { ACHIEVEMENTS_SEED } from "@/lib/domains/achievements/defaults";
export {
  normalizeAchievementsContent,
  normalizeAchievementMilestoneItems,
  normalizeAchievementTimelineItems,
  normalizeAchievementsMilestones,
  normalizeAchievementsJourney,
  toAchievementsWritePayload,
  achievementsSeedPayload,
  ACHIEVEMENTS_PUBLIC_EMPTY,
} from "@/lib/domains/achievements/normalize";
export { achievementsKeys } from "@/lib/domains/achievements/keys";
export {
  ensureAchievementsContentSeeded,
  fetchAchievementsContent,
  saveAchievementsContent,
  ACHIEVEMENTS_DOC_PATH,
} from "@/lib/firebase/achievements";
export {
  useAchievementsContent,
  useSaveAchievementsMutation,
} from "@/lib/domains/achievements/hooks";
