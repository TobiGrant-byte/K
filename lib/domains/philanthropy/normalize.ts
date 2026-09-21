import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PHILANTHROPY_FALLBACK } from "@/lib/domains/philanthropy/defaults";
import type {
  PhilanthropyContent,
  PhilanthropyContentInput,
  PhilanthropyPillarItem,
} from "@/lib/domains/philanthropy/types";

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

function normalizePillarItem(
  value: unknown,
  index: number,
): PhilanthropyPillarItem | null {
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

  return {
    id: asString(raw.id).trim() || `impact-${index + 1}`,
    title,
    description,
    href: asString(raw.href).trim(),
    cta: asString(raw.cta).trim(),
    image: image
      ? {
          galleryImageId: image.galleryImageId,
          imageConfig,
        }
      : null,
    imageConfig,
  };
}

export function normalizePhilanthropyPillarItems(
  value: unknown,
): PhilanthropyPillarItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizePillarItem(item, index))
    .filter((item): item is PhilanthropyPillarItem => Boolean(item));
}

/** Firebase fields only — never reinject seed pillars on the public site. */
export function normalizePhilanthropyContent(
  input?: Partial<PhilanthropyContent> | Record<string, unknown> | null,
  updatedAt = "",
): PhilanthropyContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    eyebrow: asString(raw.eyebrow).trim(),
    title: asString(raw.title).trim(),
    titleAccent: asString(raw.titleAccent).trim(),
    subtitle: asString(raw.subtitle).trim(),
    items: normalizePhilanthropyPillarItems(raw.items),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function toPhilanthropyWritePayload(
  input: PhilanthropyContentInput,
): PhilanthropyContentInput {
  const normalized = normalizePhilanthropyContent(input);
  return {
    eyebrow: normalized.eyebrow,
    title: normalized.title,
    titleAccent: normalized.titleAccent,
    subtitle: normalized.subtitle,
    items: normalized.items.map((item) => {
      const imageConfig = normalizeImageDisplayConfig(item.imageConfig);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        href: item.href,
        cta: item.cta,
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

export function philanthropySeedPayload(): PhilanthropyContentInput {
  return toPhilanthropyWritePayload({
    eyebrow: PHILANTHROPY_FALLBACK.eyebrow,
    title: PHILANTHROPY_FALLBACK.title,
    titleAccent: PHILANTHROPY_FALLBACK.titleAccent,
    subtitle: PHILANTHROPY_FALLBACK.subtitle,
    items: PHILANTHROPY_FALLBACK.items,
  });
}

export const PHILANTHROPY_PUBLIC_EMPTY: PhilanthropyContent = {
  eyebrow: "",
  title: "",
  titleAccent: "",
  subtitle: "",
  items: [],
  updatedAt: "",
};
