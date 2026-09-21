import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { RESEARCH_FALLBACK } from "@/lib/domains/research/defaults";
import type {
  ResearchActionContent,
  ResearchActionItem,
  ResearchArea,
  ResearchContent,
  ResearchContentInput,
  ResearchDevelopmentContent,
} from "@/lib/domains/research/types";

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeImageRef(value: unknown): MediaImageRef | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const galleryImageId = asString(raw.galleryImageId, "").trim();
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
  const title = asString(raw.title, "").trim();
  const description = asString(raw.description, "").trim();
  if (!title || !description) return null;
  const id =
    asString(raw.id, "").trim() ||
    RESEARCH_FALLBACK.development.areas[index]?.id ||
    `area-${index + 1}`;
  return { id, title, description };
}

export function normalizeResearchAreas(value: unknown): ResearchArea[] {
  if (!Array.isArray(value)) {
    return RESEARCH_FALLBACK.development.areas.map((a) => ({ ...a }));
  }
  const areas = value
    .map((item, index) => normalizeArea(item, index))
    .filter((item): item is ResearchArea => Boolean(item));
  return areas.length
    ? areas
    : RESEARCH_FALLBACK.development.areas.map((a) => ({ ...a }));
}

function normalizeActionItem(
  value: unknown,
  index: number,
): ResearchActionItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const fallback = RESEARCH_FALLBACK.action.items[index];
  const title = asString(raw.title, fallback?.title ?? "").trim();
  const description = asString(
    raw.description,
    fallback?.description ?? "",
  ).trim();
  if (!title || !description) return null;
  return {
    id:
      asString(raw.id, "").trim() ||
      fallback?.id ||
      `action-${index + 1}`,
    label: asString(raw.label, fallback?.label ?? "").trim(),
    title,
    description,
    href: asString(raw.href, fallback?.href ?? "").trim(),
    image: normalizeImageRef(raw.image),
    fallbackSrc:
      asString(raw.fallbackSrc, fallback?.fallbackSrc ?? "").trim() ||
      fallback?.fallbackSrc ||
      "",
  };
}

export function normalizeResearchActionItems(
  value: unknown,
): ResearchActionItem[] {
  if (!Array.isArray(value)) {
    return RESEARCH_FALLBACK.action.items.map((item) => ({ ...item }));
  }
  const items = value
    .map((item, index) => normalizeActionItem(item, index))
    .filter((item): item is ResearchActionItem => Boolean(item));
  return items.length
    ? items
    : RESEARCH_FALLBACK.action.items.map((item) => ({ ...item }));
}

export function normalizeResearchDevelopment(
  input?: Partial<ResearchDevelopmentContent> | null,
): ResearchDevelopmentContent {
  const fb = RESEARCH_FALLBACK.development;
  return {
    title: asString(input?.title, fb.title).trim() || fb.title,
    titleAccent: asString(input?.titleAccent, fb.titleAccent).trim(),
    image: normalizeImageRef(input?.image),
    imageEyebrow:
      asString(input?.imageEyebrow, fb.imageEyebrow).trim() || fb.imageEyebrow,
    imageCaption:
      asString(input?.imageCaption, fb.imageCaption).trim() || fb.imageCaption,
    areas: normalizeResearchAreas(input?.areas),
  };
}

export function normalizeResearchAction(
  input?: Partial<ResearchActionContent> | null,
): ResearchActionContent {
  const fb = RESEARCH_FALLBACK.action;
  return {
    title: asString(input?.title, fb.title).trim() || fb.title,
    titleAccent: asString(input?.titleAccent, fb.titleAccent).trim(),
    subtitle: asString(input?.subtitle, fb.subtitle).trim() || fb.subtitle,
    items: normalizeResearchActionItems(input?.items),
  };
}

/**
 * Supports nested `{ development, action }` and older flat R&D-only docs.
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
      updatedAt: asString(raw.updatedAt, updatedAt),
    };
  }

  // Legacy flat shape from the first Research CMS pass.
  return {
    development: normalizeResearchDevelopment({
      title: asString(raw.title, RESEARCH_FALLBACK.development.title),
      titleAccent: asString(
        raw.titleAccent,
        RESEARCH_FALLBACK.development.titleAccent,
      ),
      image: normalizeImageRef(raw.image),
      imageEyebrow: asString(
        raw.imageEyebrow,
        RESEARCH_FALLBACK.development.imageEyebrow,
      ),
      imageCaption: asString(
        raw.imageCaption,
        RESEARCH_FALLBACK.development.imageCaption,
      ),
      areas: normalizeResearchAreas(raw.areas),
    }),
    action: normalizeResearchAction(null),
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
      })),
    },
  };
}

export function researchAreaNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}
