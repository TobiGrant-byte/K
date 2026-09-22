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
    quote: asString(input?.quote).trim(),
    items: normalizeProfileHobbyItems(input?.items),
  };
}

/** Client-side checks aligned with Firestore `validProfileContent`. */
export function validateProfileWritePayload(
  input: ProfileContentInput,
): string | null {
  const home = normalizeProfileHome(input.home);
  const about = normalizeProfileAbout(input.about);
  const hobbiesInput = input.hobbies;
  const rawItems = Array.isArray(hobbiesInput?.items) ? hobbiesInput.items : [];

  if (!home.roles.length) {
    return "Add at least one professional role (empty roles are ignored).";
  }
  if (home.roles.length > 20) {
    return "You can save at most 20 professional roles.";
  }
  if (!home.quote.trim()) {
    return "Home quote is required.";
  }
  if (home.quote.length > 500) {
    return "Home quote must be 500 characters or fewer.";
  }
  if (!about.title.trim()) {
    return "About title is required.";
  }
  if (about.title.length > 300) {
    return "About title must be 300 characters or fewer.";
  }
  if (about.titleAccent.length > 200) {
    return "About title accent must be 200 characters or fewer.";
  }
  if (!about.excerpt.trim()) {
    return "About excerpt is required.";
  }
  if (about.excerpt.length > 4000) {
    return "About excerpt must be 4000 characters or fewer.";
  }
  if (!about.body.trim()) {
    return "About body is required.";
  }
  if (about.body.length > 20000) {
    return "About body must be 20000 characters or fewer.";
  }

  const quote = asString(hobbiesInput?.quote).trim();
  if (quote.length > 800) {
    return "Hobbies quote must be 800 characters or fewer.";
  }
  if (!rawItems.length) {
    return "Add at least one hobbies card.";
  }
  if (rawItems.length > 12) {
    return "You can save at most 12 hobbies cards.";
  }
  for (const [index, item] of rawItems.entries()) {
    const title = asString(item?.title).trim();
    const description = asString(item?.description).trim();
    if (!title || !description) {
      return `Hobbies card ${index + 1} needs a title and description.`;
    }
  }
  return null;
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
    home: {
      roles: home.roles,
      quote: home.quote,
    },
    about: {
      title: about.title,
      titleAccent: about.titleAccent,
      excerpt: about.excerpt,
      body: about.body,
      image: about.image
        ? {
            galleryImageId: about.image.galleryImageId,
            imageConfig: normalizeImageDisplayConfig(about.image.imageConfig),
          }
        : null,
    },
    hobbies: {
      quote: hobbies.quote,
      items: hobbies.items.map((item) => {
        const imageConfig = normalizeImageDisplayConfig(item.imageConfig);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
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
