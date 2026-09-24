"use client";

import { useMemo, useRef, useState } from "react";
import {
  GALLERY_CATEGORIES,
  MEDIA_ACCEPTED_TYPES,
  useCreateMediaBatchMutation,
  useMediaLibrary,
  useUploadMediaFilesMutation,
  type GalleryCategory,
  type MediaAsset,
} from "@/lib/domains/media";
import { DEFAULT_IMAGE_DISPLAY_CONFIG } from "@/lib/domains/media/display";
import { adminToast } from "@/lib/admin/toast-store";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
  /** Highlight currently selected media id when editing a form. */
  selectedId?: string | null;
  title?: string;
};

/**
 * Reusable Media Picker foundation for future CMS sections.
 * Shares the Media Library TanStack cache / Firestore listener — no extra reads.
 */
export default function MediaPicker({
  open,
  onClose,
  onSelect,
  selectedId = null,
  title = "Select media",
}: Props) {
  const mediaQuery = useMediaLibrary();
  const uploadFiles = useUploadMediaFilesMutation();
  const createBatch = useCreateMediaBatchMutation();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | GalleryCategory
  >("All");

  const items = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.altText.toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  if (!open) return null;

  const uploading = uploadFiles.isPending || createBatch.isPending;

  const uploadNew = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const staged = await uploadFiles.mutateAsync([file]);
      const item = staged[0];
      if (!item) throw new Error("Upload failed.");
      await createBatch.mutateAsync([
        {
          id: item.id,
          imageUrl: item.imageUrl,
          imageKitFileId: item.imageKitFileId,
          metadata: {
            title: "",
            altText: "",
            category: "Others",
            showInGallery: false,
          },
        },
      ]);
      const asset: MediaAsset = {
        id: item.id,
        imageUrl: item.imageUrl,
        title: "",
        category: "Others",
        altText: "",
        showInGallery: false,
        stripConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        imageKitFileId: item.imageKitFileId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      adminToast.success("Image added to Media Library.");
      onSelect(asset);
      onClose();
    } catch (err) {
      adminToast.error(
        err instanceof Error ? err.message : "Upload failed.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-900/80 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="flex max-h-[min(92vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/12 bg-navy-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                Media Library
              </div>
              <h2
                id="media-picker-title"
                className="mt-1 font-display text-2xl font-light text-white"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close media picker"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/12 text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media…"
              className="w-full flex-1 rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/60"
            />
            <input
              ref={fileRef}
              type="file"
              accept={MEDIA_ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                void uploadNew(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="shrink-0 rounded-lg bg-accent px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload new"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["All", ...GALLERY_CATEGORIES] as const).map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`rounded-full border px-3 py-1.5 font-title text-[8px] uppercase tracking-[1.5px] ${
                    active
                      ? "border-accent/50 bg-accent/15 text-accent-light"
                      : "border-white/12 text-white/45 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {mediaQuery.isPending && !mediaQuery.data ? (
            <p className="text-sm text-white/45">Loading media…</p>
          ) : null}
          {filtered.length === 0 ? (
            <p className="py-12 text-center font-display text-lg italic text-white/45">
              {items.length === 0
                ? "Library is empty — upload an image."
                : "No matches."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((asset) => {
                const active = selectedId === asset.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      onClose();
                    }}
                    className={`overflow-hidden rounded-lg border text-left transition-colors ${
                      active
                        ? "border-accent ring-1 ring-accent/40"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <div className="aspect-square bg-navy-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.imageUrl}
                        alt={asset.altText || asset.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 p-2">
                      <div className="truncate font-title text-[8px] uppercase tracking-[1.5px] text-accent-light">
                        {asset.category}
                      </div>
                      <div className="truncate text-[12px] text-white/85">
                        {asset.title}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
