"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  PUBLICATIONS_IMAGE_ASPECT,
  normalizePublicationsContent,
  usePublicationsContent,
  useSavePublicationsMutation,
  type PublicationPressItem,
  type PublicationsContentInput,
} from "@/lib/domains/publications";
import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  createMediaImageRef,
  isVideoMediaUrl,
  useMediaById,
  type MediaAsset,
} from "@/lib/domains/media";
import { createId, formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";

export default function AdminPublications() {
  const publicationsQuery = usePublicationsContent();
  const saveMutation = useSavePublicationsMutation();
  const [draft, setDraft] = useState<PublicationsContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  const serverDraft = useMemo(() => {
    if (!publicationsQuery.data) return null;
    const normalized = normalizePublicationsContent(publicationsQuery.data);
    return {
      title: normalized.title,
      titleAccent: normalized.titleAccent,
      subtitle: normalized.subtitle,
      items: normalized.items,
    } satisfies PublicationsContentInput;
  }, [publicationsQuery.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const dirty = useMemo(() => {
    if (!draft || !publicationsQuery.data) return false;
    const current = normalizePublicationsContent(publicationsQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        title: current.title,
        titleAccent: current.titleAccent,
        subtitle: current.subtitle,
        items: current.items,
      })
    );
  }, [draft, publicationsQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {publicationsQuery.isPending
          ? "Loading publications…"
          : "Could not load publications content."}
      </p>
    );
  }

  const patch = (next: Partial<PublicationsContentInput>) => {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const updateItem = (
    index: number,
    patchItem: Partial<PublicationPressItem>,
  ) => {
    const items = draft.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patch({ items });
  };

  const addItem = () => {
    patch({
      items: [
        ...draft.items,
        {
          id: createId(),
          title: "",
          source: "",
          year: "",
          excerpt: "",
          href: "",
          image: null,
          fallbackSrc: "",
          imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (draft.items.length <= 1) return;
    setPendingRemove(index);
  };

  const confirmRemoveItem = () => {
    if (pendingRemove === null) return;
    const index = pendingRemove;
    setPendingRemove(null);
    if (draft.items.length <= 1) return;
    patch({ items: draft.items.filter((_, i) => i !== index) });
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.items.length) return;
    const items = [...draft.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patch({ items });
  };

  const openPicker = (index: number) => {
    setPickerIndex(index);
    setPickerOpen(true);
  };

  const onSelectMedia = (asset: MediaAsset) => {
    if (isVideoMediaUrl(asset.imageUrl)) {
      adminToast.error("Please choose an image, not a video.");
      return;
    }
    const item = draft.items[pickerIndex];
    if (!item) return;
    updateItem(pickerIndex, {
      image: createMediaImageRef(asset.id, item.imageConfig),
    });
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.subtitle.trim()) {
      adminToast.error("Title and subtitle are required.");
      return;
    }
    const bad = draft.items.some(
      (item) => !item.title.trim() || !item.href.trim(),
    );
    if (bad) {
      adminToast.error("Each press feature needs a title and link URL.");
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Submitted.");
    } catch (error) {
      adminToast.error(
        error instanceof Error
          ? error.message
          : "Could not submit publications.",
      );
    }
  };

  const selectedId =
    draft.items[pickerIndex]?.image?.galleryImageId ?? null;

  return (
    <div className="space-y-6 text-white">
      <div className="max-w-2xl">
        <p className="text-sm text-white/50">
          Edit the Featured In The Press block on the Publications page.
          Scholarship Tips &amp; Guidance and Academic Publications (on Research)
          stay static for now.
        </p>
        {publicationsQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Updated {formatPostDate(publicationsQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Accent phrase (italic)
            </span>
            <input
              value={draft.titleAccent}
              onChange={(e) => patch({ titleAccent: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
            Subtitle
          </span>
          <textarea
            value={draft.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            rows={3}
            className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
          />
        </label>
      </div>

      <div className="space-y-4 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-xl font-light">Press features</h2>
          <p className="mt-1 text-sm text-white/45">
            Card images use a 360∶228 frame. CTA is always “Read Feature”.
          </p>
        </div>

        <div className="space-y-5">
          {draft.items.map((item, index) => (
            <PressItemEditor
              key={item.id}
              item={item}
              index={index}
              total={draft.items.length}
              onChange={(patchItem) => updateItem(index, patchItem)}
              onMove={(dir) => moveItem(index, dir)}
              onRemove={() => removeItem(index)}
              onPickImage={() => openPicker(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
        >
          Add feature
        </button>
      </div>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-4 backdrop-blur-sm sm:px-1">
        <p className="text-sm text-white/45">
          One submit saves the Featured In The Press section.
        </p>
        <button
          type="button"
          disabled={saveMutation.isPending || !dirty}
          onClick={() => void save()}
          className="rounded-lg bg-accent px-6 py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white hover:bg-accent-light disabled:opacity-50"
        >
          {saveMutation.isPending ? "Submitting…" : "Submit"}
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelectMedia}
        selectedId={selectedId}
        title="Select press feature image"
      />

      <AdminConfirmDialog
        open={pendingRemove !== null}
        eyebrow="Remove feature"
        title="Remove this press feature?"
        description={
          pendingRemove !== null && draft.items[pendingRemove]?.title ? (
            <>
              “{draft.items[pendingRemove]!.title}” will be dropped from the
              list when you submit.
            </>
          ) : (
            "It will be dropped from the list when you submit."
          )
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmRemoveItem}
      />
    </div>
  );
}

function PressItemEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
}: {
  item: PublicationPressItem;
  index: number;
  total: number;
  onChange: (patch: Partial<PublicationPressItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPickImage: () => void;
}) {
  const media = useMediaById(item.image?.galleryImageId ?? null);
  const previewUrl = media.data?.imageUrl || item.fallbackSrc || "";

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-navy-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Feature {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => onMove(1)}
            className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={total <= 1}
            onClick={onRemove}
            className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-30"
            aria-label="Remove feature"
          >
            ✕
          </button>
        </div>
      </div>

      <input
        value={item.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Feature title"
        className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={item.source}
          onChange={(e) => onChange({ source: e.target.value })}
          placeholder="Source (e.g. The University of Alabama)"
          className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
        />
        <input
          value={item.year}
          onChange={(e) => onChange({ year: e.target.value })}
          placeholder="Year"
          className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
        />
      </div>
      <textarea
        value={item.excerpt}
        onChange={(e) => onChange({ excerpt: e.target.value })}
        rows={3}
        placeholder="Excerpt (optional)"
        className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
      />
      <input
        value={item.href}
        onChange={(e) => onChange({ href: e.target.value })}
        placeholder="Link URL"
        className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPickImage}
          className="rounded-lg bg-accent px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
        >
          {item.image ? "Change image" : "Select image"}
        </button>
        {item.image ? (
          <button
            type="button"
            onClick={() => onChange({ image: null })}
            className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
          >
            Use site fallback
          </button>
        ) : null}
      </div>

      {previewUrl ? (
        <ImagePositionEditor
          imageUrl={previewUrl}
          alt={media.data?.altText || media.data?.title || item.title}
          aspectRatio={PUBLICATIONS_IMAGE_ASPECT}
          value={item.imageConfig}
          onChange={(imageConfig) => {
            onChange({
              imageConfig,
              image: item.image
                ? {
                    galleryImageId: item.image.galleryImageId,
                    imageConfig,
                  }
                : null,
            });
          }}
        />
      ) : (
        <p className="text-sm text-white/40">
          Select a Media Library image, or keep the built-in site fallback for
          this feature.
        </p>
      )}
    </div>
  );
}
