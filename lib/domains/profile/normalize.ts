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

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) return [...PROFILE_FALLBACK.home.roles];
  const roles = value
    .map((role) => (typeof role === "string" ? role.trimEnd() : ""))
    .filter((role) => role.trim().length > 0);
  return roles.length ? roles : [...PROFILE_FALLBACK.home.roles];
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
    quote: asString(input?.quote, PROFILE_FALLBACK.home.quote).trim() ||
      PROFILE_FALLBACK.home.quote,
  };
}

export function normalizeProfileAbout(
  input?: Partial<ProfileAboutContent> | null,
): ProfileAboutContent {
  const title =
    asString(input?.title, PROFILE_FALLBACK.about.title).trim() ||
    PROFILE_FALLBACK.about.title;
  const titleAccent = asString(
    input?.titleAccent,
    PROFILE_FALLBACK.about.titleAccent,
  ).trim();
  const excerpt =
    asString(input?.excerpt, PROFILE_FALLBACK.about.excerpt).trim() ||
    PROFILE_FALLBACK.about.excerpt;
  const body =
    asString(input?.body, PROFILE_FALLBACK.about.body).trim() ||
    PROFILE_FALLBACK.about.body;

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
  const fallback = PROFILE_FALLBACK.hobbies.items[index];
  const title = asString(raw.title, fallback?.title ?? "").trim();
  const description = asString(
    raw.description,
    fallback?.description ?? "",
  ).trim();
  if (!title || !description) return null;

  const image = normalizeImageRef(raw.image);
  const imageConfig = normalizeImageConfig(
    raw.imageConfig ?? image?.imageConfig,
    fallback?.imageConfig,
  );

  return {
    id:
      asString(raw.id, "").trim() ||
      fallback?.id ||
      `hobby-${index + 1}`,
    title,
    description,
    icon:
      asString(raw.icon, fallback?.icon ?? "").trim() ||
      fallback?.icon ||
      "◎",
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
  if (!Array.isArray(value)) {
    return PROFILE_FALLBACK.hobbies.items.map((item) => ({ ...item }));
  }
  const items = value
    .map((item, index) => normalizeHobbyItem(item, index))
    .filter((item): item is ProfileHobbyItem => Boolean(item));
  return items.length
    ? items
    : PROFILE_FALLBACK.hobbies.items.map((item) => ({ ...item }));
}

export function normalizeProfileHobbies(
  input?: Partial<ProfileHobbiesContent> | null,
): ProfileHobbiesContent {
  const fb = PROFILE_FALLBACK.hobbies;
  return {
    eyebrow: asString(input?.eyebrow, fb.eyebrow).trim() || fb.eyebrow,
    title: asString(input?.title, fb.title).trim() || fb.title,
    titleAccent: asString(input?.titleAccent, fb.titleAccent).trim(),
    subtitle: asString(input?.subtitle, fb.subtitle).trim() || fb.subtitle,
    quote: asString(input?.quote, fb.quote).trim() || fb.quote,
    items: normalizeProfileHobbyItems(input?.items),
  };
}

/** Merge unknown Firestore data with static fallbacks. */
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
