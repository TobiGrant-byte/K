import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PROFILE_FALLBACK } from "@/lib/domains/profile/defaults";
import type {
  ProfileAboutContent,
  ProfileContent,
  ProfileContentInput,
  ProfileHobbiesContent,
  ProfileHobbyItem,
  ProfileHomeContent,
} from "@/lib/domains/profile/types";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Public/home: Firebase only — never reinject seed roles. */
function normalizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((role) => (typeof role === "string" ? role.trimEnd() : ""))
    .filter((role) => role.trim().length > 0);
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

function normalizeImageConfig(
  value: unknown,
  fallback?: ImageDisplayConfig,
): ImageDisplayConfig {
  if (value && typeof value === "object") {
    const raw = value as Record<string, unknown>;
    return normalizeImageDisplayConfig({
      positionX: typeof raw.positionX === "number" ? raw.positionX : undefined,
      positionY: typeof raw.positionY === "number" ? raw.positionY : undefined,
      zoom: typeof raw.zoom === "number" ? raw.zoom : undefined,
    });
  }
  return normalizeImageDisplayConfig(fallback);
}

export function normalizeProfileHome(
  input?: Partial<ProfileHomeContent> | null,
): ProfileHomeContent {
  return {
    roles: normalizeRoles(input?.roles),
    quote: asString(input?.quote).trim(),
  };
}

/**
 * About is the only section that may fall back to seed copy / local portrait
 * when Firebase fields are empty.
 */
export function normalizeProfileAbout(
  input?: Partial<ProfileAboutContent> | null,
): ProfileAboutContent {
  const fb = PROFILE_FALLBACK.about;
  const title = asString(input?.title, fb.title).trim() || fb.title;
  const titleAccent = asString(input?.titleAccent, fb.titleAccent).trim();
  const excerpt = asString(input?.excerpt, fb.excerpt).trim() || fb.excerpt;
  const body = asString(input?.body, fb.body).trim() || fb.body;

  return {
    title,
    titleAccent,
    excerpt,
    body,
    image: normalizeImageRef(input?.image),
  };
}

function normalizeHobbyItem(
  value: unknown,
  index: number,
): ProfileHobbyItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const title = asString(raw.title).trim();
  const description = asString(raw.description).trim();
  if (!title || !description) return null;

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageConfig(
    raw.imageConfig ?? image?.imageConfig,
  );

  return {
    id: asString(raw.id).trim() || `hobby-${index + 1}`,
    title,
    description,
    icon: asString(raw.icon).trim() || "◎",
    image: image
      ? {
          galleryImageId: image.galleryImageId,
          imageConfig,
        }
      : null,
    imageConfig,
  };
}

export function normalizeProfileHobbyItems(value: unknown): ProfileHobbyItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => normalizeHobbyItem(item, index))
    .filter((item): item is ProfileHobbyItem => Boolean(item));
}

export function normalizeProfileHobbies(
  input?: Partial<ProfileHobbiesContent> | null,
): ProfileHobbiesContent {
  return {
    eyebrow: asString(input?.eyebrow).trim(),
    title: asString(input?.title).trim(),
    titleAccent: asString(input?.titleAccent).trim(),
    subtitle: asString(input?.subtitle).trim(),
    quote: asString(input?.quote).trim(),
    items: normalizeProfileHobbyItems(input?.items),
  };
}

/** Normalize Firestore profile data — About may use seed text; home/hobbies do not. */
export function normalizeProfileContent(
  input?: Partial<ProfileContent> | Record<string, unknown> | null,
  updatedAt = "",
): ProfileContent {
  const raw = (input ?? {}) as Partial<ProfileContent>;
  return {
    home: normalizeProfileHome(raw.home),
    about: normalizeProfileAbout(raw.about),
    hobbies: normalizeProfileHobbies(raw.hobbies),
    updatedAt: asString(raw.updatedAt, updatedAt),
  };
}

export function profileBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function roleLines(role: string): string[] {
  return role.split("\n").map((line) => line.trim()).filter(Boolean);
}

/** Prepare a validated payload for Firestore writes. */
export function toProfileWritePayload(
  input: ProfileContentInput,
): ProfileContentInput {
  const home = normalizeProfileHome(input.home);
  const about = normalizeProfileAbout(input.about);
  const hobbies = normalizeProfileHobbies(input.hobbies);
  return {
    home,
    about: {
      ...about,
      image: about.image
        ? {
            galleryImageId: about.image.galleryImageId,
            imageConfig: normalizeImageDisplayConfig(about.image.imageConfig),
          }
        : null,
    },
    hobbies: {
      ...hobbies,
      items: hobbies.items.map((item) => {
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
    },
  };
}
