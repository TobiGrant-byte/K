"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  computeImageCoverLayout,
  imageDisplayStyle,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";

type Props = {
  src: string;
  alt: string;
  config?: Partial<ImageDisplayConfig> | null;
  sizes?: string;
  priority?: boolean;
  /** Extra classes on the foreground image. */
  imageClassName?: string;
};

/**
 * Renders an image inside a sized parent using real cover × zoom layout so
 * zoom-out reveals cropped source pixels (not a useless CSS shrink).
 * Any open space from zoom-out is solid white.
 * Parent must be `position: relative` with a defined size.
 */
export default function ConfiguredFrameImage({
  src,
  alt,
  config,
  sizes = "100vw",
  priority = false,
  imageClassName = "",
}: Props) {
  const display = normalizeImageDisplayConfig(config);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!frameEl) return;
    const update = () => {
      const rect = frameEl.getBoundingClientRect();
      setFrame({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frameEl);
    return () => ro.disconnect();
  }, [frameEl]);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  const layout = computeImageCoverLayout(
    frame.w,
    frame.h,
    natural.w,
    natural.h,
    display,
  );

  const fallbackStyle = imageDisplayStyle(display);

  return (
    <div
      ref={setFrameEl}
      className="img-zoom-motion absolute inset-0 overflow-hidden bg-white"
    >
      {layout ? (
        <div
          className="absolute overflow-hidden"
          style={{
            width: layout.width,
            height: layout.height,
            left: layout.left,
            top: layout.top,
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={`object-cover ${imageClassName}`.trim()}
          />
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover ${imageClassName}`.trim()}
          style={fallbackStyle}
        />
      )}
    </div>
  );
}
