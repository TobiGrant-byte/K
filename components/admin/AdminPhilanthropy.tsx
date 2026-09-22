"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  PHILANTHROPY_IMAGE_ASPECT,
  normalizePhilanthropyContent,
  usePhilanthropyContent,
  useSavePhilanthropyMutation,
  type PhilanthropyContentInput,
  type PhilanthropyPillarItem,
} from "@/lib/domains/philanthropy";
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

type PendingRemove =
  | { kind: "item"; index: number }
  | { kind: "image"; index: number };

export default function AdminPhilanthropy() {
  const philanthropyQuery = usePhilanthropyContent();
  const saveMutation = useSavePhilanthropyMutation();
  const [draft, setDraft] = useState<PhilanthropyContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!philanthropyQuery.data) return null;
    const normalized = normalizePhilanthropyContent(philanthropyQuery.data);
    return {
      eyebrow: normalized.eyebrow,
      title: normalized.title,
      titleAccent: normalized.titleAccent,
      subtitle: normalized.subtitle,
      items: normalized.items,
    } satisfies PhilanthropyContentInput;
  }, [philanthropyQuery.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const dirty = useMemo(() => {
    if (!draft || !philanthropyQuery.data) return false;
    const current = normalizePhilanthropyContent(philanthropyQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        eyebrow: current.eyebrow,
        title: current.title,
        titleAccent: current.titleAccent,
        subtitle: current.subtitle,
        items: current.items,
      })
    );
  }, [draft, philanthropyQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {philanthropyQuery.isPending
          ? "Loading impacts…"
          : "Could not load impacts content."}
      </p>
    );
  }

  const patch = (next: Partial<PhilanthropyContentInput>) => {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const updateItem = (
    index: number,
    patchItem: Partial<PhilanthropyPillarItem>,
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
          description: "",
          href: "",
          cta: "",
          image: null,
          imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        },
      ],
    });
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.items.length) return;
    const items = [...draft.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patch({ items });
  };

  const confirmPendingRemove = () => {
    if (!pendingRemove) return;
    const pending = pendingRemove;
    setPendingRemove(null);
    if (pending.kind === "item") {
      if (draft.items.length <= 1) return;
      patch({ items: draft.items.filter((_, i) => i !== pending.index) });
      return;
    }
    updateItem(pending.index, { image: null });
  };

  const onSelectMedia = (asset: MediaAsset) => {
    if (isVideoMediaUrl(asset.imageUrl)) {
      adminToast.error("Please choose an image, not a video.");
      return;
    }
    const current = draft.items[pickerIndex];
    const imageConfig =
      current?.imageConfig ?? { ...DEFAULT_IMAGE_DISPLAY_CONFIG };
    updateItem(pickerIndex, {
      image: createMediaImageRef(asset.id, imageConfig),
      imageConfig,
    });
    setPickerOpen(false);
  };

  const onSubmit = async () => {
    if (!draft.eyebrow.trim() || !draft.title.trim() || !draft.subtitle.trim()) {
      adminToast.error("Eyebrow, title, and subtitle are required.");
      return;
    }
    const bad = draft.items.some(
      (item) => !item.title.trim() || !item.description.trim(),
    );
    if (bad) {
      adminToast.error("Each impact card needs a title and description.");
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Impacts saved.");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not save impacts.",
      );
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="font-display text-2xl font-light text-white">Impacts</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Pillars on the Impacts page — copy, links, and Media Library images
          (ImageKit only on the public site).
        </p>
        {philanthropyQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/30">
            Last saved {formatPostDate(philanthropyQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
          Section header
        </h3>
        <label className="block space-y-1.5">
          <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
            Eyebrow
          </span>
          <input
            value={draft.eyebrow}
            onChange={(e) => patch({ eyebrow: e.target.value })}
            className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
              Title accent
            </span>
            <input
              value={draft.titleAccent}
              onChange={(e) => patch({ titleAccent: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
            />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
            Subtitle
          </span>
          <textarea
            value={draft.subtitle}
            onChange={(e) => patch({ subtitle: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
            Impact cards
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg border border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60 hover:text-white"
          >
            Add card
          </button>
        </div>

        {draft.items.map((item, index) => (
          <PillarEditor
            key={item.id}
            item={item}
            index={index}
            total={draft.items.length}
            onChange={(patchItem) => updateItem(index, patchItem)}
            onMove={(dir) => moveItem(index, dir)}
            onRemove={() => setPendingRemove({ kind: "item", index })}
            onPickImage={() => {
              setPickerIndex(index);
              setPickerOpen(true);
            }}
            onRemoveImage={() =>
              setPendingRemove({ kind: "image", index })
            }
          />
        ))}
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          disabled={!dirty || saveMutation.isPending}
          onClick={() => void onSubmit()}
          className="rounded-lg bg-accent px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white disabled:opacity-40"
        >
          {saveMutation.isPending ? "Saving…" : "Submit"}
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelectMedia}
        selectedId={draft.items[pickerIndex]?.image?.galleryImageId ?? null}
      />

      <AdminConfirmDialog
        open={Boolean(pendingRemove)}
        title={
          pendingRemove?.kind === "image"
            ? "Remove image"
            : "Remove this impact card?"
        }
        description={
          pendingRemove?.kind === "image"
            ? "The card keeps its copy; the image frame will be empty on the public page."
            : "This removes the card from Impacts."
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmPendingRemove}
      />
    </div>
  );
}

function PillarEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  item: PhilanthropyPillarItem;
  index: number;
  total: number;
  onChange: (patch: Partial<PhilanthropyPillarItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
}) {
  const media = useMediaById(item.image?.galleryImageId);
  const previewUrl = media.data?.imageUrl ?? "";

  return (
    <article className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
          Card {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index >= total - 1}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={total <= 1}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            Remove
          </button>
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
          Title
        </span>
        <input
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
          Description
        </span>
        <textarea
          value={item.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
            Link URL
          </span>
          <input
            value={item.href}
            onChange={(e) => onChange({ href: e.target.value })}
            className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
            CTA label
          </span>
          <input
            value={item.cta}
            onChange={(e) => onChange({ cta: e.target.value })}
            className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPickImage}
            className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
          >
            {item.image ? "Change image" : "Choose image"}
          </button>
          {item.image ? (
            <button
              type="button"
              onClick={onRemoveImage}
              className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
            >
              Remove image
            </button>
          ) : null}
        </div>
        <ImagePositionEditor
          imageUrl={previewUrl}
          alt={media.data?.altText || media.data?.title || item.title}
          aspectRatio={PHILANTHROPY_IMAGE_ASPECT}
          emptyLabel="No image"
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
      </div>
    </article>
  );
}
