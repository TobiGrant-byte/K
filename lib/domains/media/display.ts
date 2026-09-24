/**
 * Page-specific image presentation — separate from Media Library asset identity
 * except `stripConfig` on gallery/{id}, which is only for the public Featured
 * moments strip.
 *
 * Media Library answers "which image?".
 * ImageDisplayConfig answers "how should it appear in this frame?".
 */

export type ImageDisplayConfig = {
  /** Horizontal focal point: 0 = left, 0.5 = center, 1 = right. */
  positionX: number;
  /** Vertical focal point: 0 = top, 0.5 = center, 1 = bottom. */
  positionY: number;
  /**
   * Cover scale relative to the frame.
   * 1 = exact cover (fills frame, may crop).
   * >1 = zoom in (tighter crop).
   * <1 = zoom out (reveal more of the source; may leave soft-filled edges).
   */
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

/** Slight zoom-out — reveals more of the photo inside the frame. */
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

/** CSS `object-position` percentage string from normalized coords. */
export function imageDisplayPositionCss(config: ImageDisplayConfig): string {
  const normalized = normalizeImageDisplayConfig(config);
  const x = normalized.positionX * 100;
  const y = normalized.positionY * 100;
  return `${x}% ${y}%`;
}

export type ImageCoverLayout = {
  width: number;
  height: number;
  left: number;
  top: number;
  /** True when the image box does not fully cover the frame (zoom-out). */
  hasLetterbox: boolean;
};

/**
 * Pixel layout for cover-based zoom inside a fixed frame.
 *
 * Unlike CSS `transform: scale()` on `object-fit: cover` (which only shrinks
 * an already-cropped paint and never reveals source pixels), this sizes the
 * image from true cover dimensions × zoom so zoom-out actually shows more.
 */
export function computeImageCoverLayout(
  frameW: number,
  frameH: number,
  imageW: number,
  imageH: number,
  config?: Partial<ImageDisplayConfig> | null,
): ImageCoverLayout | null {
  if (frameW <= 0 || frameH <= 0 || imageW <= 0 || imageH <= 0) return null;
  const normalized = normalizeImageDisplayConfig(config);
  const cover = Math.max(frameW / imageW, frameH / imageH);
  const scale = cover * normalized.zoom;
  const width = imageW * scale;
  const height = imageH * scale;
  const left = (frameW - width) * normalized.positionX;
  const top = (frameH - height) * normalized.positionY;
  const hasLetterbox = width < frameW - 0.5 || height < frameH - 0.5;
  return { width, height, left, top, hasLetterbox };
}

/**
 * Legacy inline styles — prefer `computeImageCoverLayout` / ConfiguredFrameImage.
 * Kept for simple cover+zoom-in fallbacks while natural size is loading.
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
  // Only apply CSS scale for zoom-in; zoom-out must use cover layout math.
  const zoomIn = Math.max(1, normalized.zoom);
  return {
    objectPosition: origin,
    transformOrigin: origin,
    ...(zoomIn !== 1 ? { transform: `scale(${zoomIn})` } : {}),
  };
}
