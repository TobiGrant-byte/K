import {
  createMediaImageRef,
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { ACHIEVEMENTS_SEED } from "@/lib/domains/achievements/defaults";
import type {
  AchievementExtraLink,
  AchievementMilestoneItem,
  AchievementTimelineItem,
  AchievementsContent,
  AchievementsContentInput,
  AchievementsJourneyContent,
  AchievementsMilestonesContent,
} from "@/lib/domains/achievements/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Highest year wins (e.g. "2021–2024" → 2024). Newest first on the page. */
function yearSortKey(year: string): number {
  const matches = year.match(/\d{4}/g);
  if (!matches?.length) return 0;
  return Math.max(...matches.map((part) => Number(part)));
}

function sortByYearDesc<T extends { year: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => yearSortKey(b.year) - yearSortKey(a.year));
}

function normalizeImageRef(value: unknown): MediaImageRef | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const galleryImageId = asString(raw.galleryImageId).trim();
  if (!galleryImageId) return null;
  const configRaw =
    raw.imageConfig && typeof raw.imageConfig === "object"
      ? (raw.imageConfig as Record<string, unknown>)
      : {};
  return createMediaImageRef(galleryImageId, {
    positionX:
      typeof configRaw.positionX === "number" ? configRaw.positionX : undefined,
    positionY:
      typeof configRaw.positionY === "number" ? configRaw.positionY : undefined,
    zoom: typeof configRaw.zoom === "number" ? configRaw.zoom : undefined,
  });
}

function withImage(
  image: MediaImageRef | null,
  imageConfig: ReturnType<typeof normalizeImageDisplayConfig>,
): MediaImageRef | null {
  if (!image) return null;
  return { galleryImageId: image.galleryImageId, imageConfig };
}

function normalizeExtraLink(
  value: unknown,
  index: number,
): AchievementExtraLink | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const label = asString(raw.label).trim();
  const href = asString(raw.href).trim();
  if (!label || !href) return null;
  return {
    id: asString(raw.id).trim() || `extra-${index + 1}`,
    label,
    href,
  };
}

function normalizeMilestoneItem(
  value: unknown,
  index: number,
): AchievementMilestoneItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const description = asString(raw.description).trim();
  if (!title || !description) return null;

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageDisplayConfig(
    image?.imageConfig ??
      (raw.imageConfig && typeof raw.imageConfig === "object"
        ? (raw.imageConfig as Record<string, unknown>)
        : undefined),
  );
  const extraLinks = Array.isArray(raw.extraLinks)
    ? raw.extraLinks
        .map((item, i) => normalizeExtraLink(item, i))
        .filter((item): item is AchievementExtraLink => Boolean(item))
    : [];

  return {
    id: asString(raw.id).trim() || `achieve-${index + 1}`,
    year: asString(raw.year).trim(),
    title,
    org: asString(raw.org).trim(),
    description,
    href: asString(raw.href).trim(),
    image: withImage(image, imageConfig),
    imageConfig,
    extraLinks,
  };
}

export function normalizeAchievementMilestoneItems(
  value: unknown,
): AchievementMilestoneItem[] {
  if (!Array.isArray(value)) return [];
  return sortByYearDesc(
    value
      .map((item, index) => normalizeMilestoneItem(item, index))
      .filter((item): item is AchievementMilestoneItem => Boolean(item)),
  );
}

function normalizeTimelineItem(
  value: unknown,
  index: number,
): AchievementTimelineItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const detail = asString(raw.detail).trim();
  if (!title || !detail) return null;
  return {
    id: asString(raw.id).trim() || `journey-${index + 1}`,
    year: asString(raw.year).trim(),
    title,
    org: asString(raw.org).trim(),
    detail,
  };
}

export function normalizeAchievementTimelineItems(
  value: unknown,
): AchievementTimelineItem[] {
  if (!Array.isArray(value)) return [];
  return sortByYearDesc(
    value
      .map((item, index) => normalizeTimelineItem(item, index))
      .filter((item): item is AchievementTimelineItem => Boolean(item)),
  );
}

export function normalizeAchievementsMilestones(
  input?: Partial<AchievementsMilestonesContent> | null,
): AchievementsMilestonesContent {
  return {
    eyebrow: asString(input?.eyebrow).trim(),
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    items: normalizeAchievementMilestoneItems(input?.items),
  };
}

export function normalizeAchievementsJourney(
  input?: Partial<AchievementsJourneyContent> | null,
): AchievementsJourneyContent {
  const portraitImage = normalizeImageRef(input?.portraitImage);
  const secondaryImageA = normalizeImageRef(input?.secondaryImageA);
  const secondaryImageB = normalizeImageRef(input?.secondaryImageB);
  const portraitImageConfig = normalizeImageDisplayConfig(
    portraitImage?.imageConfig ?? input?.portraitImageConfig,
  );
  const secondaryImageAConfig = normalizeImageDisplayConfig(
    secondaryImageA?.imageConfig ?? input?.secondaryImageAConfig,
  );
  const secondaryImageBConfig = normalizeImageDisplayConfig(
    secondaryImageB?.imageConfig ?? input?.secondaryImageBConfig,
  );

  return {
    eyebrow: asString(input?.eyebrow).trim(),
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    titleAfter: asString(input?.titleAfter).trim(),
    quote: asString(input?.quote).trim(),
    timeline: normalizeAchievementTimelineItems(input?.timeline),
    portraitImage: withImage(portraitImage, portraitImageConfig),
    portraitImageConfig,
    secondaryImageA: withImage(secondaryImageA, secondaryImageAConfig),
    secondaryImageAConfig,
    secondaryImageB: withImage(secondaryImageB, secondaryImageBConfig),
    secondaryImageBConfig,
  };
}

/** Firebase fields only — never reinject seed copy on the public site. */
export function normalizeAchievementsContent(
  input?: Partial<AchievementsContent> | Record<string, unknown> | null,
  updatedAt = "",
): AchievementsContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  const milestonesRaw =
    raw.milestones && typeof raw.milestones === "object"
      ? (raw.milestones as Partial<AchievementsMilestonesContent>)
      : null;
  const journeyRaw =
    raw.journey && typeof raw.journey === "object"
      ? (raw.journey as Partial<AchievementsJourneyContent>)
      : null;

  return {
    milestones: normalizeAchievementsMilestones(milestonesRaw),
    journey: normalizeAchievementsJourney(journeyRaw),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function toAchievementsWritePayload(
  input: AchievementsContentInput,
): AchievementsContentInput {
  const normalized = normalizeAchievementsContent(input);
  return {
    milestones: {
      ...normalized.milestones,
      items: normalized.milestones.items.map((item) => {
        const imageConfig = normalizeImageDisplayConfig(item.imageConfig);
        return {
          id: item.id,
          year: item.year,
          title: item.title,
          org: item.org,
          description: item.description,
          href: item.href,
          imageConfig,
          image: withImage(item.image, imageConfig),
          extraLinks: item.extraLinks.map((link) => ({ ...link })),
        };
      }),
    },
    journey: {
      ...normalized.journey,
      portraitImageConfig: normalizeImageDisplayConfig(
        normalized.journey.portraitImageConfig,
      ),
      secondaryImageAConfig: normalizeImageDisplayConfig(
        normalized.journey.secondaryImageAConfig,
      ),
      secondaryImageBConfig: normalizeImageDisplayConfig(
        normalized.journey.secondaryImageBConfig,
      ),
      portraitImage: withImage(
        normalized.journey.portraitImage,
        normalizeImageDisplayConfig(normalized.journey.portraitImageConfig),
      ),
      secondaryImageA: withImage(
        normalized.journey.secondaryImageA,
        normalizeImageDisplayConfig(normalized.journey.secondaryImageAConfig),
      ),
      secondaryImageB: withImage(
        normalized.journey.secondaryImageB,
        normalizeImageDisplayConfig(normalized.journey.secondaryImageBConfig),
      ),
      timeline: normalized.journey.timeline.map((item) => ({ ...item })),
    },
  };
}

export function achievementsSeedPayload(): AchievementsContentInput {
  return toAchievementsWritePayload({
    milestones: ACHIEVEMENTS_SEED.milestones,
    journey: ACHIEVEMENTS_SEED.journey,
  });
}

export const ACHIEVEMENTS_PUBLIC_EMPTY: AchievementsContent = {
  milestones: {
    eyebrow: "",
    title: "",
    titleAccent: "",
    items: [],
  },
  journey: {
    eyebrow: "",
    title: "",
    titleAccent: "",
    titleAfter: "",
    quote: "",
    timeline: [],
    portraitImage: null,
    portraitImageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
    secondaryImageA: null,
    secondaryImageAConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
    secondaryImageB: null,
    secondaryImageBConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
  },
  updatedAt: "",
};
