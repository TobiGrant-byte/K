"use client";

import { useCallback, useRef, useState } from "react";
import {
  imageDisplayStyle,
  IMAGE_DISPLAY_MIN_ZOOM,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";

type Props = {
  /** Image URL to edit. Empty / null shows an empty frame placeholder. */
  imageUrl?: string | null;
  alt?: string;
  /** Destination frame aspect ratio (width / height), e.g. About 360/480. */
  aspectRatio: number;
  value?: Partial<ImageDisplayConfig> | null;
  onChange: (next: ImageDisplayConfig) => void;
  className?: string;
  /** Max zoom factor (default 3). */
  maxZoom?: number;
  /** Hint shown inside the empty frame. */
  emptyLabel?: string;
};

/**
 * Destination-aware position/zoom editor.
 * Saves normalized ImageDisplayConfig only — never creates a cropped file.
 * With no imageUrl, renders an empty dashed frame (no zoom controls).
 */
export default function ImagePositionEditor({
  imageUrl,
  alt = "",
  aspectRatio,
  value,
  onChange,
  className = "",
  maxZoom = 3,
  emptyLabel = "No image",
}: Props) {
  const config = normalizeImageDisplayConfig(value);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const hasImage = Boolean(imageUrl);

  const emit = useCallback(
    (patch: Partial<ImageDisplayConfig>) => {
      onChange(normalizeImageDisplayConfig({ ...config, ...patch }));
    },
    [config, onChange],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!hasImage || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: config.positionX,
      originY: config.positionY,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    emit({
      positionX: drag.originX - dx,
      positionY: drag.originY - dy,
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // already released
    }
  };

  const style = imageDisplayStyle(config);

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div
        ref={frameRef}
        className={`relative w-full max-w-sm overflow-hidden rounded-lg border border-white/15 bg-navy-900 select-none ${
          hasImage
            ? dragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "border-dashed border-white/20"
        }`}
        style={{ aspectRatio }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="presentation"
        title={hasImage ? "Drag to reposition" : undefined}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl!}
              alt={alt}
              draggable={false}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              style={style}
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-accent/35" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center font-title text-[9px] uppercase tracking-[2px] text-white/35">
            {emptyLabel}
          </div>
        )}
      </div>

      {hasImage ? (
        <>
          <label className="block">
            <span className="mb-2 flex items-center justify-between font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Zoom
              <span className="normal-case tracking-normal text-white/35">
                {config.zoom.toFixed(2)}×
              </span>
            </span>
            <input
              type="range"
              min={IMAGE_DISPLAY_MIN_ZOOM}
              max={maxZoom}
              step={0.01}
              value={config.zoom}
              onChange={(e) => emit({ zoom: Number(e.target.value) })}
              className="w-full accent-accent"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onChange(
                  normalizeImageDisplayConfig({
                    positionX: 0.5,
                    positionY: 0.5,
                    zoom: 1,
                  }),
                )
              }
              className="rounded-md border border-white/12 px-3 py-2 font-title text-[8px] uppercase tracking-[1.5px] text-white/55 hover:text-white"
            >
              Reset
            </button>
            <span className="self-center text-[11px] text-white/35">
              Drag inside the frame to set the focal point. Slight zoom-out is
              allowed.
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
