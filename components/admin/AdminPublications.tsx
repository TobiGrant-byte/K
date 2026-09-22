"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  PUBLICATIONS_IMAGE_ASPECT,
  normalizePublicationsContent,
  tipDisplayNumber,
  usePublicationsContent,
  useSavePublicationsMutation,
  type PublicationPressItem,
  type PublicationTipItem,
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

type Tab = "press" | "tips";
type PendingRemove =
  | { kind: "press"; index: number }
  | { kind: "tip"; index: number }
  | { kind: "press-image"; index: number };

export default function AdminPublications() {
  const publicationsQuery = usePublicationsContent();
  const saveMutation = useSavePublicationsMutation();
  const [tab, setTab] = useState<Tab>("press");
  const [draft, setDraft] = useState<PublicationsContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!publicationsQuery.data) return null;
    const normalized = normalizePublicationsContent(publicationsQuery.data);
    return {
      title: normalized.title,
      titleAccent: normalized.titleAccent,
      subtitle: normalized.subtitle,
      items: normalized.items,
      tips: normalized.tips,
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
        tips: current.tips,
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

  const patchTips = (next: Partial<PublicationsContentInput["tips"]>) => {
    patch({ tips: { ...draft.tips, ...next } });
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
          imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    if (draft.items.length <= 1) return;
    setPendingRemove({ kind: "press", index });
  };

  const updateTip = (index: number, patchItem: Partial<PublicationTipItem>) => {
    const items = draft.tips.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patchTips({ items });
  };

  const addTip = () => {
    patchTips({
      items: [
        ...draft.tips.items,
        {
          id: createId(),
          tag: "",
          title: "",
          blurb: "",
          href: "",
        },
      ],
    });
  };

  const removeTip = (index: number) => {
    if (draft.tips.items.length <= 1) return;
    setPendingRemove({ kind: "tip", index });
  };

  const moveTip = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.tips.items.length) return;
    const items = [...draft.tips.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patchTips({ items });
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
    if (pending.kind === "press-image") {
      updateItem(pending.index, { image: null });
      return;
    }
    if (pending.kind === "tip") {
      if (draft.tips.items.length <= 1) return;
      patchTips({
        items: draft.tips.items.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (draft.items.length <= 1) return;
    patch({ items: draft.items.filter((_, i) => i !== pending.index) });
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
      adminToast.error("Press title and subtitle are required.");
      return;
    }
    if (!draft.tips.title.trim() || !draft.tips.subtitle.trim()) {
      adminToast.error("Scholarship Tips title and subtitle are required.");
      return;
    }
    const badPress = draft.items.some(
      (item) => !item.title.trim() || !item.href.trim(),
    );
    if (badPress) {
      adminToast.error("Each press feature needs a title and link URL.");
      return;
    }
    const badTips = draft.tips.items.some(
      (item) => !item.title.trim() || !item.href.trim(),
    );
    if (badTips) {
      adminToast.error("Each scholarship tip needs a title and link URL.");
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

  const selectedId = draft.items[pickerIndex]?.image?.galleryImageId ?? null;

  return (
    <div className="space-y-6 text-white">
      <div className="max-w-2xl">
        <p className="text-sm text-white/50">
          Featured In The Press and Scholarship Tips &amp; Guidance on the
          Publications page. Images come from the Media Library only — empty
          frames until you select one.
        </p>
        {publicationsQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Updated {formatPostDate(publicationsQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="-mx-1 max-w-full overflow-x-auto pb-1">
        <div className="flex w-max min-w-full overflow-hidden rounded-lg border border-white/12 sm:w-fit sm:min-w-0">
        {(
          [
            { id: "press", label: "In The Press" },
            { id: "tips", label: "Scholarship Tips" },
          ] as const
        ).map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 px-4 py-2.5 font-title text-[9px] uppercase tracking-[1.5px] ${
              index > 0 ? "border-l border-white/12 " : ""
            }${
              tab === item.id
                ? "bg-white/10 text-white"
                : "text-white/45 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
        </div>
      </div>

      {tab === "press" ? (
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
                Title Accent
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
              rows={2}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>

          <div className="space-y-4 border-t border-white/10 pt-5">
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
                  onRemoveImage={() =>
                    setPendingRemove({ kind: "press-image", index })
                  }
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
        </div>
      ) : null}

      {tab === "tips" ? (
        <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Eyebrow
            </span>
            <input
              value={draft.tips.eyebrow}
              onChange={(e) => patchTips({ eyebrow: e.target.value })}
              className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Title
              </span>
              <input
                value={draft.tips.title}
                onChange={(e) => patchTips({ title: e.target.value })}
                className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Title Accent
              </span>
              <input
                value={draft.tips.titleAccent}
                onChange={(e) => patchTips({ titleAccent: e.target.value })}
                className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Subtitle
            </span>
            <textarea
              value={draft.tips.subtitle}
              onChange={(e) => patchTips({ subtitle: e.target.value })}
              rows={2}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <h2 className="font-display text-xl font-light">Tip cards</h2>
              <p className="mt-1 text-sm text-white/45">
                Numbers (01, 02, …) follow list order. CTA is always “Read on
                LinkedIn”.
              </p>
            </div>

            <div className="space-y-4">
              {draft.tips.items.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-3 rounded-lg border border-white/10 bg-navy-900/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                      Tip {tipDisplayNumber(index)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveTip(index, -1)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index >= draft.tips.items.length - 1}
                        onClick={() => moveTip(index, 1)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={draft.tips.items.length <= 1}
                        onClick={() => removeTip(index)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-30"
                        aria-label="Remove tip"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <input
                    value={item.tag}
                    onChange={(e) => updateTip(index, { tag: e.target.value })}
                    placeholder="Tag (e.g. Essay)"
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                  />
                  <input
                    value={item.title}
                    onChange={(e) =>
                      updateTip(index, { title: e.target.value })
                    }
                    placeholder="Title"
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                  />
                  <textarea
                    value={item.blurb}
                    onChange={(e) =>
                      updateTip(index, { blurb: e.target.value })
                    }
                    rows={3}
                    placeholder="Blurb"
                    className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
                  />
                  <input
                    value={item.href}
                    onChange={(e) => updateTip(index, { href: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTip}
              className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
            >
              Add tip
            </button>
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="max-w-md text-sm text-white/45">
          One submit saves{" "}
          <span className="text-white/75">In The Press</span> and{" "}
          <span className="text-white/75">Scholarship Tips</span> together.
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
        eyebrow={
          pendingRemove?.kind === "press-image"
            ? "Remove image"
            : pendingRemove?.kind === "tip"
              ? "Remove tip"
              : "Remove feature"
        }
        title={
          pendingRemove?.kind === "press-image"
            ? "Remove this image?"
            : pendingRemove?.kind === "tip"
              ? "Remove this scholarship tip?"
              : "Remove this press feature?"
        }
        description={
          pendingRemove?.kind === "press-image"
            ? "The image will be cleared from this draft. Submit to apply the change on the public site."
            : "It will be dropped from the list when you submit."
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmPendingRemove}
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
  onRemoveImage,
}: {
  item: PublicationPressItem;
  index: number;
  total: number;
  onChange: (patch: Partial<PublicationPressItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
}) {
  const media = useMediaById(item.image?.galleryImageId ?? null);
  const previewUrl = media.data?.imageUrl || null;

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
        aspectRatio={PUBLICATIONS_IMAGE_ASPECT}
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
  );
}
