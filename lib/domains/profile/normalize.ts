import {
  createMediaImageRef,
  normalizeImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
import { PROFILE_FALLBACK } from "@/lib/domains/profile/defaults";
import type {
  ProfileAboutContent,
  ProfileContent,
  ProfileContentInput,
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

/** Merge unknown Firestore data with static fallbacks. */
export function normalizeProfileContent(
  input?: Partial<ProfileContent> | Record<string, unknown> | null,
  updatedAt = "",
): ProfileContent {
  const raw = (input ?? {}) as Partial<ProfileContent>;
  return {
    home: normalizeProfileHome(raw.home),
    about: normalizeProfileAbout(raw.about),
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
  };
}
