import Image from "next/image";
import type { MediaAsset } from "@/lib/media";
import {
  imageDisplayStyle,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";

type MediaSource = Pick<MediaAsset, "imageUrl" | "altText"> &
  Partial<Pick<MediaAsset, "title">>;

type ManagedImageProps = {
  /** Media Library asset (or a minimal { imageUrl, altText } resolve). */
  media: MediaSource;
  /** Section-specific crop/position — does not mutate the Media Library record. */
  config?: Partial<ImageDisplayConfig> | null;
  /**
   * Optional frame around the image. Use for aspect ratio / height.
   * When set, wraps in `relative overflow-hidden` so fill works.
   * When omitted, the parent must already be `relative` with a defined size.
   */
  frameClassName?: string;
  /** Extra classes on the Next/Image element (defaults include object-cover). */
  imageClassName?: string;
  /** Override Media Library alt; empty string stays empty (decorative). */
  alt?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Renders a Media Library image with page-specific display configuration.
 *
 * Reuses the original ImageKit / public URL — no duplicate uploads or gallery docs.
 * Safe for Server Components (no client hooks).
 * Framing is always cover; crop with ImageDisplayConfig (position / zoom).
 */
export default function ManagedImage({
  media,
  config,
  frameClassName,
  imageClassName = "",
  alt,
  sizes = "100vw",
  priority = false,
}: ManagedImageProps) {
  const display = normalizeImageDisplayConfig(config);
  const style = imageDisplayStyle(display);
  const resolvedAlt =
    alt !== undefined
      ? alt
      : (media.altText || media.title || "").trim();

  const image = (
    <Image
      src={media.imageUrl}
      alt={resolvedAlt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${imageClassName}`.trim()}
      style={style}
    />
  );

  if (!frameClassName) {
    return image;
  }

  return (
    <div className={`relative overflow-hidden ${frameClassName}`.trim()}>
      {image}
    </div>
  );
}
