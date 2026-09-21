import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PUBLICATIONS_FALLBACK } from "@/lib/domains/publications/defaults";
import type {
  PublicationPressItem,
  PublicationsContent,
  PublicationsContentInput,
} from "@/lib/domains/publications/types";

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

function normalizePressItem(
  value: unknown,
  index: number,
): PublicationPressItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const fallback = PUBLICATIONS_FALLBACK.items[index];
  const title = asString(raw.title, fallback?.title ?? "").trim();
  const href = asString(raw.href, fallback?.href ?? "").trim();
  if (!title || !href) return null;

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageDisplayConfig(
    image?.imageConfig ??
      (raw.imageConfig && typeof raw.imageConfig === "object"
        ? (raw.imageConfig as Record<string, unknown>)
        : fallback?.imageConfig),
  );

  return {
    id:
      asString(raw.id, "").trim() ||
      fallback?.id ||
      `press-${index + 1}`,
    title,
    source: asString(raw.source, fallback?.source ?? "").trim(),
    year: asString(raw.year, fallback?.year ?? "").trim(),
    excerpt: asString(raw.excerpt, fallback?.excerpt ?? "").trim(),
    href,
    image: image
      ? {
          galleryImageId: image.galleryImageId,
          imageConfig,
        }
      : null,
    fallbackSrc:
      asString(raw.fallbackSrc, fallback?.fallbackSrc ?? "").trim() ||
      fallback?.fallbackSrc ||
      "",
    imageConfig,
  };
}

export function normalizePublicationPressItems(
  value: unknown,
): PublicationPressItem[] {
  if (!Array.isArray(value)) {
    return PUBLICATIONS_FALLBACK.items.map((item) => ({
      ...item,
      imageConfig: normalizeImageDisplayConfig(item.imageConfig),
    }));
  }
  const items = value
    .map((item, index) => normalizePressItem(item, index))
    .filter((item): item is PublicationPressItem => Boolean(item));
  return items.length
    ? items
    : PUBLICATIONS_FALLBACK.items.map((item) => ({
        ...item,
        imageConfig: normalizeImageDisplayConfig(item.imageConfig),
      }));
}

export function normalizePublicationsContent(
  input?: Partial<PublicationsContent> | Record<string, unknown> | null,
  updatedAt = "",
): PublicationsContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fb = PUBLICATIONS_FALLBACK;
  return {
    title: asString(raw.title, fb.title).trim() || fb.title,
    titleAccent: asString(raw.titleAccent, fb.titleAccent).trim(),
    subtitle: asString(raw.subtitle, fb.subtitle).trim() || fb.subtitle,
    items: normalizePublicationPressItems(raw.items),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
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
        ...item,
        imageConfig,
        image: item.image
          ? {
              galleryImageId: item.image.galleryImageId,
              imageConfig,
            }
          : null,
      };
    }),
  };
}
