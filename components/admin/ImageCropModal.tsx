"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  BLOG_IMAGE_ASPECT,
  BLOG_IMAGE_HEIGHT,
  BLOG_IMAGE_WIDTH,
} from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const DEFAULT_ZOOM = 1;

async function getCroppedDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  mime = "image/webp",
  quality = 0.86,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = BLOG_IMAGE_WIDTH;
  canvas.height = BLOG_IMAGE_HEIGHT;

  // Fill so zoomed-out crops (letterbox) don't leave transparent/black holes oddly
  ctx.fillStyle = "#0a1628";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Clamp source rect to image bounds; map the visible portion into the output
  const sx = Math.max(0, pixelCrop.x);
  const sy = Math.max(0, pixelCrop.y);
  const ex = Math.min(image.width, pixelCrop.x + pixelCrop.width);
  const ey = Math.min(image.height, pixelCrop.y + pixelCrop.height);
  const sw = Math.max(0, ex - sx);
  const sh = Math.max(0, ey - sy);

  if (sw > 0 && sh > 0) {
    const scaleX = BLOG_IMAGE_WIDTH / pixelCrop.width;
    const scaleY = BLOG_IMAGE_HEIGHT / pixelCrop.height;
    const dx = (sx - pixelCrop.x) * scaleX;
    const dy = (sy - pixelCrop.y) * scaleY;
    const dw = sw * scaleX;
    const dh = sh * scaleY;
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  return canvas.toDataURL(mime, quality);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.src = url;
  });
}

type ImageCropModalProps = {
  imageSrc: string;
  onCancel: () => void;
  onComplete: (croppedDataUrl: string) => void;
};

export default function ImageCropModal({
  imageSrc,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const apply = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const dataUrl = await getCroppedDataUrl(imageSrc, croppedAreaPixels);
      onComplete(dataUrl);
    } catch {
      adminToast.error("Could not crop this image. Try another file.");
    } finally {
      setBusy(false);
    }
  };

  const nudgeZoom = (delta: number) => {
    setZoom((z) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z + delta).toFixed(2)))),
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/85 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crop-title"
        className="flex max-h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/12 bg-navy-800 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
            Crop image
          </div>
          <h2
            id="crop-title"
            className="mt-1 font-display text-xl font-light text-white sm:text-2xl"
          >
            Fit the 16:10 frame
          </h2>
          <p className="mt-1 hidden text-[13px] text-white/45 sm:block">
            Zoom out to fit more in the frame, or zoom in to focus. Keep faces
            inside the bright box.
          </p>
        </div>

        <div className="relative h-[min(38vh,320px)] w-full shrink-0 bg-navy-900 sm:h-[min(44vh,400px)] lg:h-[min(48vh,460px)]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={BLOG_IMAGE_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            showGrid
            classes={{
              containerClassName: "!bg-navy-900",
            }}
          />
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/10 px-4 py-3 sm:space-y-4 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nudgeZoom(-0.1)}
              disabled={zoom <= MIN_ZOOM}
              aria-label="Zoom out"
              className="shrink-0 rounded-lg border border-white/15 px-3 py-2 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              −
            </button>
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <span className="sr-only">Zoom</span>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </label>
            <button
              type="button"
              onClick={() => nudgeZoom(0.1)}
              disabled={zoom >= MAX_ZOOM}
              aria-label="Zoom in"
              className="shrink-0 rounded-lg border border-white/15 px-3 py-2 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/15 px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/30 hover:text-white sm:py-3"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={busy || !croppedAreaPixels}
              className="rounded-lg bg-accent px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-60 sm:py-3"
            >
              {busy ? "Cropping…" : "Use cropped image"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
