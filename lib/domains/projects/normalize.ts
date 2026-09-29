import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PROJECTS_FALLBACK } from "@/lib/domains/projects/defaults";
import type {
  ProjectCategory,
  ProjectItem,
  ProjectsContent,
  ProjectsContentInput,
} from "@/lib/domains/projects/types";
import { PROJECT_CATEGORIES } from "@/lib/domains/projects/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as string[]).includes(value);
}

function normalizeCategory(value: unknown): ProjectCategory {
  const raw = asString(value).trim();
  if (isProjectCategory(raw)) return raw;
  return "Others";
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

function normalizeProjectItem(value: unknown, index: number): ProjectItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights
        .map((item) => asString(item).trim())
        .filter((item) => item.length > 0)
        .slice(0, 12)
    : [];

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageDisplayConfig(
    image?.imageConfig ??
      (raw.imageConfig && typeof raw.imageConfig === "object"
        ? (raw.imageConfig as Record<string, unknown>)
        : undefined),
  );

  return {
    id: asString(raw.id).trim() || `project-${index + 1}`,
    title: asString(raw.title).trim(),
    category: normalizeCategory(raw.category),
    summary: asString(raw.summary ?? raw.description).trim(),
    highlights,
    href: asString(raw.href).trim(),
    image: image
      ? {
          galleryImageId: image.galleryImageId,
          imageConfig,
        }
      : null,
    imageConfig,
  };
}

/** Accept current `items` or legacy `areas` payloads. */
export function normalizeProjectItems(value: unknown): ProjectItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeProjectItem(item, index))
    .filter((item): item is ProjectItem => Boolean(item));
}

export function normalizeProjectsContent(
  input?: Partial<ProjectsContent> | Record<string, unknown> | null,
  updatedAt = "",
): ProjectsContent {
  const raw = (input ?? {}) as Record<string, unknown>;
  const list = raw.items ?? raw.areas;
  return {
    eyebrow: asString(raw.eyebrow).trim(),
    title: asString(raw.title).trim(),
    titleAccent: asString(raw.titleAccent).trim(),
    subtitle: asString(raw.subtitle).trim(),
    items: normalizeProjectItems(list),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function toProjectsWritePayload(
  input: ProjectsContentInput,
): ProjectsContentInput {
  const normalized = normalizeProjectsContent(input);
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
        category: item.category,
        summary: item.summary,
        highlights: item.highlights
          .map((point) => point.trim())
          .filter((point) => point.length > 0)
          .slice(0, 12),
        href: item.href.trim(),
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

export function projectsSeedPayload(): ProjectsContentInput {
  return toProjectsWritePayload({
    eyebrow: PROJECTS_FALLBACK.eyebrow,
    title: PROJECTS_FALLBACK.title,
    titleAccent: PROJECTS_FALLBACK.titleAccent,
    subtitle: PROJECTS_FALLBACK.subtitle,
    items: PROJECTS_FALLBACK.items,
  });
}

export const PROJECTS_PUBLIC_EMPTY: ProjectsContent = {
  eyebrow: "",
  title: "",
  titleAccent: "",
  subtitle: "",
  items: [],
  updatedAt: "",
};
