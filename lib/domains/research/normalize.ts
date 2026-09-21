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

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
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

/**
 * Supports nested `{ development, action }` and older flat R&D-only docs.
 * Does not reinject seed copy — Firebase fields only.
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
  };
}

/** Admin first-time seed payload from RESEARCH_FALLBACK. */
export function researchSeedPayload(): ResearchContentInput {
  return toResearchWritePayload({
    development: RESEARCH_FALLBACK.development,
    action: RESEARCH_FALLBACK.action,
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
  updatedAt: "",
};
