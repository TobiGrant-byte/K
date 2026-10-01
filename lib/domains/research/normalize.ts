import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import {
  RESEARCH_FALLBACK,
  RESEARCH_SCHOLAR_FALLBACK,
} from "@/lib/domains/research/defaults";
import type {
  ResearchActionContent,
  ResearchActionItem,
  ResearchArea,
  ResearchContent,
  ResearchContentInput,
  ResearchDevelopmentContent,
  ResearchScholarContent,
  ResearchScholarStat,
} from "@/lib/domains/research/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = true): boolean {
  return typeof value === "boolean" ? value : fallback;
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

function normalizeArea(value: unknown, index: number): ResearchArea | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const description = asString(raw.description).trim();
  if (!title || !description) return null;
  const id = asString(raw.id).trim() || `area-${index + 1}`;
  return { id, title, description };
}

export function normalizeResearchAreas(value: unknown): ResearchArea[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeArea(item, index))
    .filter((item): item is ResearchArea => Boolean(item));
}

function normalizeActionItem(
  value: unknown,
  index: number,
): ResearchActionItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const description = asString(raw.description).trim();
  if (!title || !description) return null;
  return {
    id: asString(raw.id).trim() || `action-${index + 1}`,
    label: asString(raw.label).trim(),
    title,
    description,
    href: asString(raw.href).trim(),
    image: normalizeImageRef(raw.image),
    fallbackSrc: "",
  };
}

export function normalizeResearchActionItems(
  value: unknown,
): ResearchActionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeActionItem(item, index))
    .filter((item): item is ResearchActionItem => Boolean(item));
}

export function normalizeResearchDevelopment(
  input?: Partial<ResearchDevelopmentContent> | null,
): ResearchDevelopmentContent {
  return {
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    image: normalizeImageRef(input?.image),
    imageEyebrow: asString(input?.imageEyebrow).trim(),
    imageCaption: asString(input?.imageCaption).trim(),
    areas: normalizeResearchAreas(input?.areas),
  };
}

export function normalizeResearchAction(
  input?: Partial<ResearchActionContent> | null,
): ResearchActionContent {
  return {
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    subtitle: asString(input?.subtitle).trim(),
    items: normalizeResearchActionItems(input?.items),
  };
}

function normalizeScholarStat(
  value: unknown,
  index: number,
): ResearchScholarStat | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const label = asString(raw.label).trim();
  if (!label) return null;
  return {
    id: asString(raw.id).trim() || `stat-${index + 1}`,
    value: asNumber(raw.value, 0),
    label,
    showPlus: asBoolean(raw.showPlus, true),
  };
}

export function normalizeResearchScholarStats(
  value: unknown,
): ResearchScholarStat[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeScholarStat(item, index))
    .filter((item): item is ResearchScholarStat => Boolean(item));
}

export function normalizeResearchScholarBullets(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item).trim())
    .filter((item) => Boolean(item));
}

/**
 * Missing/legacy docs get RESEARCH_SCHOLAR_FALLBACK so the public card stays intact.
 */
export function normalizeResearchScholar(
  input?: Partial<ResearchScholarContent> | Record<string, unknown> | null,
): ResearchScholarContent {
  if (!input || typeof input !== "object") {
    return { ...RESEARCH_SCHOLAR_FALLBACK, stats: [...RESEARCH_SCHOLAR_FALLBACK.stats], bullets: [...RESEARCH_SCHOLAR_FALLBACK.bullets] };
  }
  const raw = input as Record<string, unknown>;
  const stats = normalizeResearchScholarStats(raw.stats);
  const bullets = normalizeResearchScholarBullets(raw.bullets);
  return {
    profileUrl:
      asString(raw.profileUrl).trim() || RESEARCH_SCHOLAR_FALLBACK.profileUrl,
    eyebrow: asString(raw.eyebrow).trim() || RESEARCH_SCHOLAR_FALLBACK.eyebrow,
    title: asString(raw.title).trim() || RESEARCH_SCHOLAR_FALLBACK.title,
    titleAccent:
      asString(raw.titleAccent).trim() ||
      RESEARCH_SCHOLAR_FALLBACK.titleAccent,
    body: asString(raw.body).trim() || RESEARCH_SCHOLAR_FALLBACK.body,
    stats: stats.length ? stats : [...RESEARCH_SCHOLAR_FALLBACK.stats],
    bullets: bullets.length
      ? bullets
      : [...RESEARCH_SCHOLAR_FALLBACK.bullets],
    ctaLabel:
      asString(raw.ctaLabel).trim() || RESEARCH_SCHOLAR_FALLBACK.ctaLabel,
  };
}

/**
 * Supports nested `{ development, action, scholar }` and older flat R&D-only docs.
 * Does not reinject seed copy for development/action — Firebase fields only.
 * Scholar falls back when missing so legacy docs keep the Google Scholar card.
 */
export function normalizeResearchContent(
  input?: Partial<ResearchContent> | Record<string, unknown> | null,
  updatedAt = "",
): ResearchContent {
  const raw = (input ?? {}) as Record<string, unknown>;

  if (raw.development && typeof raw.development === "object") {
    return {
      development: normalizeResearchDevelopment(
        raw.development as Partial<ResearchDevelopmentContent>,
      ),
      action: normalizeResearchAction(
        raw.action as Partial<ResearchActionContent> | null,
      ),
      scholar: normalizeResearchScholar(
        raw.scholar as Partial<ResearchScholarContent> | null,
      ),
      updatedAt: asString(raw.updatedAt, updatedAt),
    };
  }

  return {
    development: normalizeResearchDevelopment({
      title: asString(raw.title),
      titleAccent: asString(raw.titleAccent),
      image: normalizeImageRef(raw.image),
      imageEyebrow: asString(raw.imageEyebrow),
      imageCaption: asString(raw.imageCaption),
      areas: normalizeResearchAreas(raw.areas),
    }),
    action: normalizeResearchAction(null),
    scholar: normalizeResearchScholar(
      raw.scholar as Partial<ResearchScholarContent> | null,
    ),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

function writeImage(image: MediaImageRef | null): MediaImageRef | null {
  if (!image) return null;
  return {
    galleryImageId: image.galleryImageId,
    imageConfig: normalizeImageDisplayConfig(image.imageConfig),
  };
}

export function toResearchWritePayload(
  input: ResearchContentInput,
): ResearchContentInput {
  const normalized = normalizeResearchContent(input);
  return {
    development: {
      ...normalized.development,
      image: writeImage(normalized.development.image),
    },
    action: {
      ...normalized.action,
      items: normalized.action.items.map((item) => ({
        ...item,
        image: writeImage(item.image),
        fallbackSrc: "",
      })),
    },
    scholar: {
      ...normalized.scholar,
      stats: normalized.scholar.stats.map((stat) => ({ ...stat })),
      bullets: [...normalized.scholar.bullets],
    },
  };
}

/** Admin first-time seed payload from RESEARCH_FALLBACK. */
export function researchSeedPayload(): ResearchContentInput {
  return toResearchWritePayload({
    development: RESEARCH_FALLBACK.development,
    action: RESEARCH_FALLBACK.action,
    scholar: RESEARCH_FALLBACK.scholar,
  });
}

export function researchAreaNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export const RESEARCH_PUBLIC_EMPTY: ResearchContent = {
  development: {
    title: "",
    titleAccent: "",
    image: null,
    imageEyebrow: "",
    imageCaption: "",
    areas: [],
  },
  action: {
    title: "",
    titleAccent: "",
    subtitle: "",
    items: [],
  },
  scholar: {
    ...RESEARCH_SCHOLAR_FALLBACK,
    stats: [...RESEARCH_SCHOLAR_FALLBACK.stats],
    bullets: [...RESEARCH_SCHOLAR_FALLBACK.bullets],
  },
  updatedAt: "",
};
