/** Shared Media Library types and validation (Admin + Public). */

import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";

export const GALLERY_CATEGORIES = [
  "Graduation",
  "Recognition",
  "Moments",
  "Others",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Featured-moments strip frame — matches Gallery strip thumbs (~240×160). */
export const FEATURED_STRIP_IMAGE_ASPECT = 240 / 160;

export type MediaAsset = {
  id: string;
  imageUrl: string;
  title: string;
  category: GalleryCategory;
  altText: string;
  showInGallery: boolean;
  /** Focal crop for the public Gallery “Featured moments” strip only. */
  stripConfig: ImageDisplayConfig;
  /** ImageKit file id when available — for future asset management only. */
  imageKitFileId: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaMetadataInput = {
  title: string;
  category: GalleryCategory;
  altText: string;
  showInGallery: boolean;
  stripConfig?: Partial<ImageDisplayConfig> | null;
};

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
/** Max images selectable in one Media Library upload. */
export const MEDIA_MAX_UPLOAD_COUNT = 20;
export const MEDIA_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function isGalleryCategory(value: string): value is GalleryCategory {
  return (GALLERY_CATEGORIES as readonly string[]).includes(value);
}

export function validateMediaFile(file: File): string | null {
  if (!file || file.size <= 0) return "Choose a valid image file.";
  if (file.size > MEDIA_MAX_BYTES) {
    return "Image must be 10 MB or smaller.";
  }
  if (!(MEDIA_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return "Supported formats: JPEG, PNG, WebP, or GIF.";
  }
  return null;
}

/** Validate a multi-select upload; returns an error message or null. */
export function validateMediaFiles(files: File[]): string | null {
  if (!files.length) return "Choose at least one image.";
  if (files.length > MEDIA_MAX_UPLOAD_COUNT) {
    return `You can upload at most ${MEDIA_MAX_UPLOAD_COUNT} images at once.`;
  }
  for (const file of files) {
    const err = validateMediaFile(file);
    if (err) return `${file.name}: ${err}`;
  }
  return null;
}

export function normalizeMediaMetadata(input: Partial<MediaMetadataInput>): {
  title: string;
  category: GalleryCategory;
  altText: string;
  showInGallery: boolean;
  stripConfig: ImageDisplayConfig;
} {
  // Image description and alt stay identical; empty means pass nothing publicly.
  const description = (input.title ?? input.altText ?? "").trim();
  const category =
    input.category && isGalleryCategory(input.category)
      ? input.category
      : "Moments";
  return {
    title: description,
    category,
    altText: description,
    showInGallery: Boolean(input.showInGallery),
    stripConfig: normalizeImageDisplayConfig(
      input.stripConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG,
    ),
  };
}
