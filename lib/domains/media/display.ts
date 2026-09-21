/**
 * Page-specific image presentation — separate from Media Library asset identity.
 *
 * Media Library answers "which image?".
 * ImageDisplayConfig answers "how should it appear in this section?".
 *
 * Stored later on CMS content docs (e.g. About), never on gallery/{id}.
 */

export type ImageDisplayConfig = {
  /** Horizontal focal point: 0 = left, 0.5 = center, 1 = right. */
  positionX: number;
  /** Vertical focal point: 0 = top, 0.5 = center, 1 = bottom. */
  positionY: number;
  /** CSS scale factor; 1 = natural cover fit. Slightly below 1 zooms out. */
  zoom: number;
};

/**
 * Reference a Media Library asset from a CMS section without duplicating the file.
 * Resolve `galleryImageId` via the existing media domain (hooks / Firestore).
 */
export type MediaImageRef = {
  galleryImageId: string;
  imageConfig: ImageDisplayConfig;
};

export const DEFAULT_IMAGE_DISPLAY_CONFIG: ImageDisplayConfig = {
  positionX: 0.5,
  positionY: 0.5,
  zoom: 1,
};

/** Slight zoom-out allowed across CMS image editors. */
export const IMAGE_DISPLAY_MIN_ZOOM = 0.9;
/** Upper bound for stored configs (editors may use a lower max). */
export const IMAGE_DISPLAY_MAX_ZOOM = 8;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

function clampZoom(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(
    IMAGE_DISPLAY_MAX_ZOOM,
    Math.max(IMAGE_DISPLAY_MIN_ZOOM, value),
  );
}

/** Merge partial config with defaults and clamp to valid ranges. */
export function normalizeImageDisplayConfig(
  input?: Partial<ImageDisplayConfig> | null,
): ImageDisplayConfig {
  return {
    positionX: clamp01(
      input?.positionX ?? DEFAULT_IMAGE_DISPLAY_CONFIG.positionX,
    ),
    positionY: clamp01(
      input?.positionY ?? DEFAULT_IMAGE_DISPLAY_CONFIG.positionY,
    ),
    zoom: clampZoom(input?.zoom ?? DEFAULT_IMAGE_DISPLAY_CONFIG.zoom),
  };
}

export function createMediaImageRef(
  galleryImageId: string,
  imageConfig?: Partial<ImageDisplayConfig> | null,
): MediaImageRef {
  return {
    galleryImageId,
    imageConfig: normalizeImageDisplayConfig(imageConfig),
  };
}

/** CSS `object-position` / `transform-origin` percentage string from normalized coords. */
export function imageDisplayPositionCss(config: ImageDisplayConfig): string {
  const normalized = normalizeImageDisplayConfig(config);
  const x = normalized.positionX * 100;
  const y = normalized.positionY * 100;
  return `${x}% ${y}%`;
}

/**
 * Inline styles for next/image (or img) with object-fit: cover.
 * Matches the Gallery pattern: object-position + optional scale.
 */
export function imageDisplayStyle(
  config?: Partial<ImageDisplayConfig> | null,
): {
  objectPosition: string;
  transformOrigin: string;
  transform?: string;
} {
  const normalized = normalizeImageDisplayConfig(config);
  const origin = imageDisplayPositionCss(normalized);
  return {
    objectPosition: origin,
    transformOrigin: origin,
    ...(normalized.zoom !== 1
      ? { transform: `scale(${normalized.zoom})` }
      : {}),
  };
}
