"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  FEATURED_STRIP_IMAGE_ASPECT,
  GALLERY_CATEGORIES,
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_UPLOAD_COUNT,
  isVideoMediaUrl,
  useCreateMediaBatchMutation,
  useMediaLibrary,
  useMigrateSiteMediaMutation,
  useRemoveLocalPublicMediaMutation,
  useRemoveVideoMediaMutation,
  useSetMediaVisibilityBatchMutation,
  useUpdateMediaBatchMutation,
  useUploadMediaFilesMutation,
  type GalleryCategory,
  type MediaAsset,
} from "@/lib/domains/media";
import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
} from "@/lib/domains/media/display";
import { formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";

type DraftMeta = {
  title: string;
  category: GalleryCategory;
  showInGallery: boolean;
  stripConfig: ImageDisplayConfig;
};

type SessionItem = {
  id: string;
  imageUrl: string;
  imageKitFileId: string;
  draft: DraftMeta;
  baseline: DraftMeta;
};

type EditSession = {
  mode: "create" | "edit";
  items: SessionItem[];
  index: number;
};

type ViewMode = "grid" | "list";
type PageSize = 10 | 20;

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 20];

function draftsEqual(a: DraftMeta, b: DraftMeta): boolean {
  return (
    a.title === b.title &&
    a.category === b.category &&
    a.showInGallery === b.showInGallery &&
    a.stripConfig.positionX === b.stripConfig.positionX &&
    a.stripConfig.positionY === b.stripConfig.positionY &&
    a.stripConfig.zoom === b.stripConfig.zoom
  );
}

function toDraft(asset: MediaAsset): DraftMeta {
  return {
    title: asset.title,
    category: asset.category,
    showInGallery: asset.showInGallery,
    stripConfig: normalizeImageDisplayConfig(asset.stripConfig),
  };
}

function sessionDirty(session: EditSession): boolean {
  return session.items.some((item) => !draftsEqual(item.draft, item.baseline));
}

export default function AdminMediaLibrary() {
  const mediaQuery = useMediaLibrary();
  const uploadFiles = useUploadMediaFilesMutation();
  const createBatch = useCreateMediaBatchMutation();
  const updateBatch = useUpdateMediaBatchMutation();
  const visibilityBatch = useSetMediaVisibilityBatchMutation();
  const removeVideos = useRemoveVideoMediaMutation();
  const migrateSiteMedia = useMigrateSiteMediaMutation();
  const removeLocalPublic = useRemoveLocalPublicMediaMutation();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cleanedVideosRef = useRef(false);
  const migratedSiteMediaRef = useRef(false);
  const cleanedLocalPublicRef = useRef(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | GalleryCategory
  >("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<EditSession | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const items = useMemo(
    () => (mediaQuery.data ?? []).filter((item) => !isVideoMediaUrl(item.imageUrl)),
    [mediaQuery.data],
  );

  // One-time cleanup: drop mistaken video rows from Media Library (keeps /public file).
  useEffect(() => {
    const all = mediaQuery.data ?? [];
    if (cleanedVideosRef.current || !all.length) return;
    if (!all.some((item) => isVideoMediaUrl(item.imageUrl))) return;
    cleanedVideosRef.current = true;
    void removeVideos.mutateAsync().then((count) => {
      if (count > 0) {
        adminToast.info(
          `Removed ${count} video file${count === 1 ? "" : "s"} from Media Library. The public Gallery video is still served from /images.`,
        );
      }
    });
  }, [mediaQuery.data, removeVideos]);

  // One-time: upload public site images to ImageKit + restore Firebase docs
  // under the original legacy-* ids (keeps CMS positions / selections).
  useEffect(() => {
    if (migratedSiteMediaRef.current || mediaQuery.isPending) return;
    if (!mediaQuery.data) return;
    migratedSiteMediaRef.current = true;
    void migrateSiteMedia.mutateAsync().then((result) => {
      if (result.uploaded > 0 || result.linked > 0) {
        adminToast.success(
          `ImageKit sync: uploaded ${result.uploaded}, relinked ${result.linked}, skipped ${result.skipped}.`,
        );
      }
      if (result.failed.length) {
        adminToast.error(
          `Could not sync ${result.failed.length} image${result.failed.length === 1 ? "" : "s"}.`,
        );
      }
      // After ImageKit docs exist, drop any leftover /images/ URL rows.
      void removeLocalPublic.mutateAsync().then((count) => {
        cleanedLocalPublicRef.current = true;
        if (count > 0) {
          adminToast.info(
            `Removed ${count} leftover local path row${count === 1 ? "" : "s"} from Media Library.`,
          );
        }
      });
    });
  }, [
    mediaQuery.data,
    mediaQuery.isPending,
    migrateSiteMedia,
    removeLocalPublic,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "All" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.altText.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const busy =
    uploadFiles.isPending ||
    createBatch.isPending ||
    updateBatch.isPending ||
    visibilityBatch.isPending;

  const current = session?.items[session.index] ?? null;

  const requestCloseSession = () => {
    if (!session) return;
    // Create sessions are always uncommitted until Submit all.
    if (session.mode === "create" || sessionDirty(session)) {
      setDiscardOpen(true);
      return;
    }
    setSession(null);
  };

  const confirmDiscard = () => {
    setDiscardOpen(false);
    setSession(null);
  };

  const patchCurrentDraft = (patch: Partial<DraftMeta>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const itemsNext = prev.items.map((item, i) =>
        i === prev.index
          ? { ...item, draft: { ...item.draft, ...patch } }
          : item,
      );
      return { ...prev, items: itemsNext };
    });
  };

  const goPrev = () => {
    setSession((prev) =>
      prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev,
    );
  };

  const goNext = () => {
    setSession((prev) =>
      prev && prev.index < prev.items.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev,
    );
  };

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    try {
      const staged = await uploadFiles.mutateAsync(files);
      const sessionItems: SessionItem[] = staged.map((s) => {
        const draft: DraftMeta = {
          title: "",
          category: "Others",
          showInGallery: false,
          stripConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        };
        return {
          id: s.id,
          imageUrl: s.imageUrl,
          imageKitFileId: s.imageKitFileId,
          draft,
          baseline: {
            ...draft,
            stripConfig: { ...draft.stripConfig },
          },
        };
      });
      setSession({ mode: "create", items: sessionItems, index: 0 });
      adminToast.success(
        `${staged.length} image${staged.length === 1 ? "" : "s"} uploaded — review details, then submit all.`,
      );
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Upload failed.",
      );
    }
  };

  const openBulkEdit = (assets: MediaAsset[]) => {
    if (!assets.length) return;
    setSession({
      mode: "edit",
      items: assets.map((asset) => {
        const draft = toDraft(asset);
        return {
          id: asset.id,
          imageUrl: asset.imageUrl,
          imageKitFileId: asset.imageKitFileId,
          draft,
          baseline: {
            ...draft,
            stripConfig: { ...draft.stripConfig },
          },
        };
      }),
      index: 0,
    });
  };

  const openSingleEdit = (asset: MediaAsset) => {
    openBulkEdit([asset]);
  };

  const submitSession = async () => {
    if (!session) return;
    try {
      if (session.mode === "create") {
        await createBatch.mutateAsync(
          session.items.map((item) => ({
            id: item.id,
            imageUrl: item.imageUrl,
            imageKitFileId: item.imageKitFileId,
            metadata: {
              title: item.draft.title.trim(),
              altText: item.draft.title.trim(),
              category: item.draft.category,
              showInGallery: item.draft.showInGallery,
              stripConfig: item.draft.stripConfig,
            },
          })),
        );
        adminToast.success(
          `${session.items.length} image${session.items.length === 1 ? "" : "s"} saved to Media Library.`,
        );
      } else {
        await updateBatch.mutateAsync(
          session.items.map((item) => ({
            id: item.id,
            metadata: {
              title: item.draft.title.trim(),
              altText: item.draft.title.trim(),
              category: item.draft.category,
              showInGallery: item.draft.showInGallery,
              stripConfig: item.draft.stripConfig,
            },
          })),
        );
        adminToast.success(
          `${session.items.length} image${session.items.length === 1 ? "" : "s"} updated.`,
        );
      }
      setSession(null);
      setSelectedIds(new Set());
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not save media.",
      );
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const allOnPageSelected =
      pageItems.length > 0 &&
      pageItems.every((item) => selectedIds.has(item.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const item of pageItems) next.delete(item.id);
      } else {
        for (const item of pageItems) next.add(item.id);
      }
      return next;
    });
  };

  const setSearchAndResetPage = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setCategoryAndResetPage = (value: "All" | GalleryCategory) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const setPageSizeAndReset = (size: PageSize) => {
    setPageSize(size);
    setPage(1);
  };

  const selectedAssets = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const bulkVisibility = async (showInGallery: boolean) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await visibilityBatch.mutateAsync({ ids, showInGallery });
      adminToast.success(
        showInGallery
          ? `${ids.length} image${ids.length === 1 ? "" : "s"} shown in Gallery.`
          : `${ids.length} image${ids.length === 1 ? "" : "s"} hidden from Gallery.`,
      );
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not update visibility.",
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-sm text-white/50">
          Upload up to {MEDIA_MAX_UPLOAD_COUNT} images at once, review each, then
          submit all together. Public Gallery shows assets with “Show in
          Gallery” enabled. Featured moments crop only affects the scrolling
          strip on the Gallery page.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept={MEDIA_ACCEPTED_TYPES.join(",")}
            multiple
            className="hidden"
            onChange={(e) => {
              void onUpload(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={busy || Boolean(session)}
            onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-60"
          >
            {uploadFiles.isPending ? "Uploading…" : "Upload images"}
          </button>
          <span className="font-title text-[9px] uppercase tracking-[1.5px] text-white/40">
            Max {MEDIA_MAX_UPLOAD_COUNT} at once
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(e) => setSearchAndResetPage(e.target.value)}
          placeholder="Search description or category…"
          className="w-full flex-1 rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/60"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(["All", ...GALLERY_CATEGORIES] as const).map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryAndResetPage(cat)}
                className={`rounded-full border px-3 py-2 font-title text-[9px] uppercase tracking-[2px] transition-colors ${
                  active
                    ? "border-accent/50 bg-accent/15 text-accent-light"
                    : "border-white/12 text-white/50 hover:border-white/25 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
          <div className="ml-0 flex overflow-hidden rounded-lg border border-white/12 sm:ml-2">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 font-title text-[9px] uppercase tracking-[1.5px] ${
                viewMode === "grid"
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`border-l border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[1.5px] ${
                viewMode === "list"
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white"
              }`}
            >
              List
            </button>
          </div>
          <div className="ml-0 flex overflow-hidden rounded-lg border border-white/12 sm:ml-1">
            {PAGE_SIZE_OPTIONS.map((size) => {
              const active = pageSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPageSizeAndReset(size)}
                  className={`px-3 py-2 font-title text-[9px] uppercase tracking-[1.5px] ${
                    size !== PAGE_SIZE_OPTIONS[0]
                      ? "border-l border-white/12 "
                      : ""
                  }${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/45 hover:text-white"
                  }`}
                  aria-pressed={active}
                  aria-label={`${size} per page`}
                >
                  {size}/page
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {viewMode === "list" && selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
          <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkVisibility(true)}
            className="rounded-md border border-white/15 px-3 py-2 font-title text-[8px] uppercase tracking-[1.5px] text-white/80 hover:bg-white/5 disabled:opacity-50"
          >
            Show in Gallery
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void bulkVisibility(false)}
            className="rounded-md border border-white/15 px-3 py-2 font-title text-[8px] uppercase tracking-[1.5px] text-white/80 hover:bg-white/5 disabled:opacity-50"
          >
            Hide from Gallery
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => openBulkEdit(selectedAssets)}
            className="rounded-md bg-accent px-3 py-2 font-title text-[8px] uppercase tracking-[1.5px] text-white hover:bg-accent-light disabled:opacity-50"
          >
            Bulk edit
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="rounded-md px-3 py-2 font-title text-[8px] uppercase tracking-[1.5px] text-white/45 hover:text-white"
          >
            Clear
          </button>
        </div>
      ) : null}

      {mediaQuery.isPending && !mediaQuery.data ? (
        <p className="text-sm text-white/45">Loading media…</p>
      ) : null}
      {mediaQuery.isError ? (
        <p className="text-sm text-red-300" role="alert">
          Could not load the Media Library.
        </p>
      ) : null}

      {!mediaQuery.isPending && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-16 text-center">
          <p className="font-display text-xl italic text-white/55">
            {items.length === 0
              ? "No media yet — upload the first images."
              : "No images match this filter."}
          </p>
        </div>
      ) : null}

      {viewMode === "grid" && pageItems.length > 0 ? (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {pageItems.map((asset) => (
            <article
              key={asset.id}
              className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-white/10 bg-navy-800"
            >
              <button
                type="button"
                onClick={() => openSingleEdit(asset)}
                className="block w-full text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.imageUrl}
                  alt={
                    asset.altText || asset.title
                      ? asset.altText || asset.title
                      : ""
                  }
                  className="h-auto w-full object-cover"
                />
                <div className="space-y-1.5 p-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-title text-[8px] uppercase tracking-[1.5px]">
                    <span className="text-accent-light">{asset.category}</span>
                    <span className="text-white/25" aria-hidden>
                      ·
                    </span>
                    <span
                      className={
                        asset.showInGallery
                          ? "text-emerald-400"
                          : "text-white/40"
                      }
                    >
                      {asset.showInGallery ? "In Gallery" : "Library only"}
                    </span>
                  </div>
                  {asset.title ? (
                    <p className="font-display text-[15px] leading-snug text-white/90">
                      {asset.title}
                    </p>
                  ) : (
                    <p className="font-display text-[15px] italic text-white/35">
                      No description
                    </p>
                  )}
                </div>
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {viewMode === "list" && pageItems.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-navy-800 font-title text-[8px] uppercase tracking-[1.5px] text-white/45">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      pageItems.length > 0 &&
                      pageItems.every((item) => selectedIds.has(item.id))
                    }
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all on this page"
                    className="h-4 w-4 accent-accent"
                  />
                </th>
                <th className="px-3 py-3">Preview</th>
                <th className="px-3 py-3">Image description</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Gallery</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-3 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-t border-white/10 bg-navy-900/40 hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-3 align-middle">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={() => toggleSelect(asset.id)}
                      aria-label={`Select ${asset.title || asset.id}`}
                      className="h-4 w-4 accent-accent"
                    />
                  </td>
                  <td className="px-3 py-3 align-middle">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.imageUrl}
                      alt=""
                      className="h-12 w-16 rounded object-cover"
                    />
                  </td>
                  <td className="max-w-xs px-3 py-3 align-middle text-white/85">
                    {asset.title || (
                      <span className="italic text-white/35">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-middle font-title text-[9px] uppercase tracking-[1.5px] text-accent-light">
                    {asset.category}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <span
                      className={`font-title text-[9px] uppercase tracking-[1.5px] ${
                        asset.showInGallery
                          ? "text-emerald-400"
                          : "text-white/40"
                      }`}
                    >
                      {asset.showInGallery ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle text-[12px] text-white/40">
                    {formatPostDate(asset.updatedAt)}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openSingleEdit(asset)}
                      className="font-title text-[8px] uppercase tracking-[1.5px] text-accent-light hover:text-accent disabled:opacity-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy-800/50 px-4 py-3">
          <p className="text-sm text-white/50">
            Showing{" "}
            <span className="text-white/80">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of <span className="text-white/80">{filtered.length}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[9px] uppercase tracking-[1.5px] text-white/70 hover:border-white/25 hover:text-white disabled:opacity-35"
            >
              Previous
            </button>
            <span className="min-w-[5.5rem] text-center font-title text-[9px] uppercase tracking-[1.5px] text-white/55">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[9px] uppercase tracking-[1.5px] text-white/70 hover:border-white/25 hover:text-white disabled:opacity-35"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {session && current ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 px-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-session-title"
            className="max-h-[min(92vh,760px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/12 bg-navy-800 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                {session.mode === "create" ? "New uploads" : "Bulk edit"} ·{" "}
                {session.index + 1} of {session.items.length}
              </div>
              <button
                type="button"
                onClick={requestCloseSession}
                className="font-title text-[9px] uppercase tracking-[1.5px] text-white/45 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <h2
              id="media-session-title"
              className="font-display text-2xl font-light text-white"
            >
              {session.mode === "create"
                ? "Review & describe"
                : "Edit selected"}
            </h2>
            <p className="mt-2 text-sm text-white/45">
              Use Previous / Next to move between images. Submit all saves
              everything in one step.
            </p>

            <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-navy-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.imageUrl}
                alt={current.draft.title || ""}
                className="max-h-40 w-full object-contain"
              />
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label>
                <span className="mb-2 flex items-center gap-2 font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Image description
                  <span className="normal-case tracking-normal text-white/30">
                    (optional)
                  </span>
                </span>
                <textarea
                  value={current.draft.title}
                  onChange={(e) => patchCurrentDraft({ title: e.target.value })}
                  rows={3}
                  placeholder="e.g. Graduation Dinner with Stephen Jones"
                  className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-accent/60"
                />
              </label>

              <div>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Category
                </span>
                <div className="flex flex-wrap gap-2">
                  {GALLERY_CATEGORIES.map((cat) => {
                    const active = current.draft.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => patchCurrentDraft({ category: cat })}
                        className={`rounded-full border px-3 py-2 font-title text-[9px] uppercase tracking-[2px] ${
                          active
                            ? "border-accent/50 bg-accent/15 text-accent-light"
                            : "border-white/12 text-white/50 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={current.draft.showInGallery}
                  onChange={(e) =>
                    patchCurrentDraft({ showInGallery: e.target.checked })
                  }
                  className="h-4 w-4 accent-accent"
                />
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/60">
                  Show in public Gallery
                </span>
              </label>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <div>
                  <h3 className="font-display text-lg font-light text-white">
                    Featured moments crop
                  </h3>
                  <p className="mt-1 text-sm text-white/45">
                    Adjust how this photo looks in the moving strip at the top
                    of the Gallery page. Drag to choose what stays in view.
                  </p>
                </div>
                <ImagePositionEditor
                  imageUrl={current.imageUrl}
                  alt={current.draft.title || "Featured moments"}
                  aspectRatio={FEATURED_STRIP_IMAGE_ASPECT}
                  value={current.draft.stripConfig}
                  onChange={(stripConfig) =>
                    patchCurrentDraft({ stripConfig })
                  }
                  emptyLabel="No image"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={session.index === 0}
                  onClick={goPrev}
                  className="rounded-lg border border-white/12 px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/25 hover:text-white disabled:opacity-35"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={session.index >= session.items.length - 1}
                  onClick={goNext}
                  className="rounded-lg border border-white/12 px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/25 hover:text-white disabled:opacity-35"
                >
                  Next
                </button>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submitSession()}
                className="rounded-lg bg-accent px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-60"
              >
                {createBatch.isPending || updateBatch.isPending
                  ? "Submitting…"
                  : `Submit all (${session.items.length})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {discardOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/85 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setDiscardOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-title"
            className="w-full max-w-md rounded-2xl border border-white/12 bg-navy-800 p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-amber-300">
              Unsaved changes
            </div>
            <h2
              id="discard-title"
              className="font-display text-2xl font-light text-white"
            >
              Leave without submitting?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              {session?.mode === "create"
                ? "These uploads are not saved to the Media Library yet. If you leave now, your descriptions and Gallery settings will be discarded."
                : "Edits you made in this session have not been submitted. Leave and lose those changes?"}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDiscardOpen(false)}
                className="rounded-lg border border-white/12 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:text-white"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-amber-200 hover:bg-amber-500/25"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
