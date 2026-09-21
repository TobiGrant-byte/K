import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PUBLICATIONS_FALLBACK } from "@/lib/domains/publications/defaults";
import type {
  PublicationPressItem,
  PublicationTipItem,
  PublicationsContent,
  PublicationsContentInput,
  PublicationsTipsContent,
} from "@/lib/domains/publications/types";

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

function normalizePressItem(
  value: unknown,
  index: number,
): PublicationPressItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const href = asString(raw.href).trim();
  if (!title || !href) return null;

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageDisplayConfig(
    image?.imageConfig ??
      (raw.imageConfig && typeof raw.imageConfig === "object"
        ? (raw.imageConfig as Record<string, unknown>)
        : undefined),
  );

  return {
    id: asString(raw.id).trim() || `press-${index + 1}`,
    title,
    source: asString(raw.source).trim(),
    year: asString(raw.year).trim(),
    excerpt: asString(raw.excerpt).trim(),
    href,
    image: image
      ? {
          galleryImageId: image.galleryImageId,
          imageConfig,
        }
      : null,
    imageConfig,
  };
}

export function normalizePublicationPressItems(
  value: unknown,
): PublicationPressItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizePressItem(item, index))
    .filter((item): item is PublicationPressItem => Boolean(item));
}

function tipNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function normalizeTipItem(
  value: unknown,
  index: number,
): PublicationTipItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const href = asString(raw.href).trim();
  if (!title || !href) return null;
  return {
    id: asString(raw.id).trim() || `tip-${index + 1}`,
    tag: asString(raw.tag).trim() || "Article",
    title,
    blurb: asString(raw.blurb).trim(),
    href,
  };
}

export function normalizePublicationTipItems(value: unknown): PublicationTipItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeTipItem(item, index))
    .filter((item): item is PublicationTipItem => Boolean(item));
}

export function normalizePublicationsTips(
  input?: Partial<PublicationsTipsContent> | null,
): PublicationsTipsContent {
  return {
    eyebrow: asString(input?.eyebrow).trim(),
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    subtitle: asString(input?.subtitle).trim(),
    items: normalizePublicationTipItems(input?.items),
  };
}

/** Firebase fields only — never reinject seed press/tips on the public site. */
export function normalizePublicationsContent(
  input?: Partial<PublicationsContent> | Record<string, unknown> | null,
  updatedAt = "",
): PublicationsContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  const tipsRaw =
    raw.tips && typeof raw.tips === "object"
      ? (raw.tips as Partial<PublicationsTipsContent>)
      : null;
  return {
    title: asString(raw.title).trim(),
    titleAccent: asString(raw.titleAccent).trim(),
    subtitle: asString(raw.subtitle).trim(),
    items: normalizePublicationPressItems(raw.items),
    tips: normalizePublicationsTips(tipsRaw),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function tipDisplayNumber(index: number): string {
  return tipNumber(index);
}

export function toPublicationsWritePayload(
  input: PublicationsContentInput,
): PublicationsContentInput {
  const normalized = normalizePublicationsContent(input);
  return {
    title: normalized.title,
    titleAccent: normalized.titleAccent,
    subtitle: normalized.subtitle,
    items: normalized.items.map((item) => {
      const imageConfig = normalizeImageDisplayConfig(item.imageConfig);
      return {
        id: item.id,
        title: item.title,
        source: item.source,
        year: item.year,
        excerpt: item.excerpt,
        href: item.href,
        imageConfig,
        image: item.image
          ? {
              galleryImageId: item.image.galleryImageId,
              imageConfig,
            }
          : null,
      };
    }),
    tips: {
      ...normalized.tips,
      items: normalized.tips.items.map((item) => ({ ...item })),
    },
  };
}

export function publicationsSeedPayload(): PublicationsContentInput {
  return toPublicationsWritePayload({
    title: PUBLICATIONS_FALLBACK.title,
    titleAccent: PUBLICATIONS_FALLBACK.titleAccent,
    subtitle: PUBLICATIONS_FALLBACK.subtitle,
    items: PUBLICATIONS_FALLBACK.items,
    tips: PUBLICATIONS_FALLBACK.tips,
  });
}

export const PUBLICATIONS_PUBLIC_EMPTY: PublicationsContent = {
  title: "",
  titleAccent: "",
  subtitle: "",
  items: [],
  tips: {
    eyebrow: "",
    title: "",
    titleAccent: "",
    subtitle: "",
    items: [],
  },
  updatedAt: "",
};
