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

function tipNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function normalizeTipItem(
  value: unknown,
  index: number,
): PublicationTipItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const fallback = PUBLICATIONS_FALLBACK.tips.items[index];
  const title = asString(raw.title, fallback?.title ?? "").trim();
  const href = asString(raw.href, fallback?.href ?? "").trim();
  if (!title || !href) return null;
  return {
    id:
      asString(raw.id, "").trim() ||
      fallback?.id ||
      `tip-${index + 1}`,
    tag: asString(raw.tag, fallback?.tag ?? "").trim() || fallback?.tag || "Article",
    title,
    blurb: asString(raw.blurb, fallback?.blurb ?? "").trim(),
    href,
  };
}

export function normalizePublicationTipItems(value: unknown): PublicationTipItem[] {
  if (!Array.isArray(value)) {
    return PUBLICATIONS_FALLBACK.tips.items.map((item) => ({ ...item }));
  }
  const items = value
    .map((item, index) => normalizeTipItem(item, index))
    .filter((item): item is PublicationTipItem => Boolean(item));
  return items.length
    ? items
    : PUBLICATIONS_FALLBACK.tips.items.map((item) => ({ ...item }));
}

export function normalizePublicationsTips(
  input?: Partial<PublicationsTipsContent> | null,
): PublicationsTipsContent {
  const fb = PUBLICATIONS_FALLBACK.tips;
  return {
    eyebrow: asString(input?.eyebrow, fb.eyebrow).trim() || fb.eyebrow,
    title: asString(input?.title, fb.title).trim() || fb.title,
    titleAccent: asString(input?.titleAccent, fb.titleAccent).trim(),
    subtitle: asString(input?.subtitle, fb.subtitle).trim() || fb.subtitle,
    items: normalizePublicationTipItems(input?.items),
  };
}

export function normalizePublicationsContent(
  input?: Partial<PublicationsContent> | Record<string, unknown> | null,
  updatedAt = "",
): PublicationsContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  const fb = PUBLICATIONS_FALLBACK;
  const tipsRaw =
    raw.tips && typeof raw.tips === "object"
      ? (raw.tips as Partial<PublicationsTipsContent>)
      : null;
  return {
    title: asString(raw.title, fb.title).trim() || fb.title,
    titleAccent: asString(raw.titleAccent, fb.titleAccent).trim(),
    subtitle: asString(raw.subtitle, fb.subtitle).trim() || fb.subtitle,
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
