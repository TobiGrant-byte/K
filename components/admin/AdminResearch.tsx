"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  RESEARCH_ACTION_IMAGE_ASPECT,
  RESEARCH_IMAGE_ASPECT,
  normalizeResearchContent,
  useResearchContent,
  useSaveResearchMutation,
  type ResearchActionItem,
  type ResearchArea,
  type ResearchContentInput,
} from "@/lib/domains/research";
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

type Tab = "development" | "action";
type PickerTarget = "development" | number;
type PendingRemove =
  | { kind: "area"; index: number }
  | { kind: "action"; index: number }
  | { kind: "development-image" }
  | { kind: "action-image"; index: number };

export default function AdminResearch() {
  const researchQuery = useResearchContent();
  const saveMutation = useSaveResearchMutation();
  const [tab, setTab] = useState<Tab>("development");
  const [draft, setDraft] = useState<ResearchContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("development");
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!researchQuery.data) return null;
    const normalized = normalizeResearchContent(researchQuery.data);
    return {
      development: normalized.development,
      action: normalized.action,
    } satisfies ResearchContentInput;
  }, [researchQuery.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const developmentImageId = draft?.development.image?.galleryImageId ?? null;
  const actionImageIndex =
    typeof pickerTarget === "number" ? pickerTarget : null;
  const actionImageId =
    actionImageIndex !== null
      ? (draft?.action.items[actionImageIndex]?.image?.galleryImageId ?? null)
      : null;
  const selectedImageId =
    pickerTarget === "development" ? developmentImageId : actionImageId;

  const developmentMedia = useMediaById(developmentImageId);

  const developmentPreviewUrl = useMemo(() => {
    if (!developmentImageId) return null;
    return developmentMedia.data?.imageUrl ?? null;
  }, [developmentImageId, developmentMedia.data]);

  const dirty = useMemo(() => {
    if (!draft || !researchQuery.data) return false;
    const current = normalizeResearchContent(researchQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        development: current.development,
        action: current.action,
      })
    );
  }, [draft, researchQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {researchQuery.isPending
          ? "Loading research…"
          : "Could not load research content."}
      </p>
    );
  }

  const patchDevelopment = (
    patch: Partial<ResearchContentInput["development"]>,
  ) => {
    setDraft((prev) =>
      prev
        ? { ...prev, development: { ...prev.development, ...patch } }
        : prev,
    );
  };

  const patchAction = (patch: Partial<ResearchContentInput["action"]>) => {
    setDraft((prev) =>
      prev ? { ...prev, action: { ...prev.action, ...patch } } : prev,
    );
  };

  const updateArea = (index: number, patchArea: Partial<ResearchArea>) => {
    const areas = draft.development.areas.map((area, i) =>
      i === index ? { ...area, ...patchArea } : area,
    );
    patchDevelopment({ areas });
  };

  const addArea = () => {
    patchDevelopment({
      areas: [
        ...draft.development.areas,
        { id: createId(), title: "", description: "" },
      ],
    });
  };

  const removeArea = (index: number) => {
    if (draft.development.areas.length <= 1) return;
    setPendingRemove({ kind: "area", index });
  };

  const moveArea = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.development.areas.length) return;
    const areas = [...draft.development.areas];
    const [item] = areas.splice(index, 1);
    areas.splice(next, 0, item!);
    patchDevelopment({ areas });
  };

  const updateActionItem = (
    index: number,
    patchItem: Partial<ResearchActionItem>,
  ) => {
    const items = draft.action.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patchAction({ items });
  };

  const addActionItem = () => {
    patchAction({
      items: [
        ...draft.action.items,
        {
          id: createId(),
          label: "",
          title: "",
          description: "",
          href: "",
          image: null,
          fallbackSrc: "",
        },
      ],
    });
  };

  const removeActionItem = (index: number) => {
    if (draft.action.items.length <= 1) return;
    setPendingRemove({ kind: "action", index });
  };

  const confirmPendingRemove = () => {
    if (!pendingRemove) return;
    const pending = pendingRemove;
    setPendingRemove(null);
    if (pending.kind === "area") {
      if (draft.development.areas.length <= 1) return;
      patchDevelopment({
        areas: draft.development.areas.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (pending.kind === "action") {
      if (draft.action.items.length <= 1) return;
      patchAction({
        items: draft.action.items.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (pending.kind === "development-image") {
      patchDevelopment({ image: null });
      return;
    }
    updateActionItem(pending.index, { image: null });
  };

  const moveActionItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.action.items.length) return;
    const items = [...draft.action.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patchAction({ items });
  };

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const onSelectMedia = (asset: MediaAsset) => {
    if (isVideoMediaUrl(asset.imageUrl)) {
      adminToast.error("Please choose an image, not a video.");
      return;
    }
    if (pickerTarget === "development") {
      const prevConfig =
        draft.development.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG;
      patchDevelopment({
        image: createMediaImageRef(asset.id, prevConfig),
      });
      return;
    }
    const item = draft.action.items[pickerTarget];
    if (!item) return;
    const prevConfig = item.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG;
    updateActionItem(pickerTarget, {
      image: createMediaImageRef(asset.id, prevConfig),
    });
  };

  const save = async () => {
    const emptyArea = draft.development.areas.some(
      (a) => !a.title.trim() || !a.description.trim(),
    );
    if (emptyArea) {
      adminToast.error("Each research area needs a title and description.");
      return;
    }
    const emptyAction = draft.action.items.some(
      (item) => !item.title.trim() || !item.description.trim(),
    );
    if (emptyAction) {
      adminToast.error(
        "Each Research in Action card needs a title and description.",
      );
      return;
    }
    if (!draft.action.subtitle.trim()) {
      adminToast.error("Research in Action needs a subtitle.");
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Submitted.");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not submit research.",
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="max-w-2xl">
        <p className="text-sm text-white/50">
          Shared Research page content. Toggle between Research & Development
          and Research in Action — one Submit saves both. Google Scholar stays
          static on the public page.
        </p>
        {researchQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Updated {formatPostDate(researchQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="-mx-1 max-w-full overflow-x-auto pb-1">
        <div className="flex w-max min-w-full overflow-hidden rounded-lg border border-white/12 sm:w-fit sm:min-w-0">
        {(
          [
            { id: "development", label: "Research & Development" },
            { id: "action", label: "Research in Action" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 px-4 py-2.5 font-title text-[9px] uppercase tracking-[1.5px] ${
              item.id !== "development" ? "border-l border-white/12 " : ""
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

      {tab === "development" ? (
        <>
          <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Title
                </span>
                <textarea
                  value={draft.development.title}
                  onChange={(e) =>
                    patchDevelopment({ title: e.target.value })
                  }
                  rows={2}
                  className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Accent phrase (italic)
                </span>
                <textarea
                  value={draft.development.titleAccent}
                  onChange={(e) =>
                    patchDevelopment({ titleAccent: e.target.value })
                  }
                  rows={2}
                  className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Image eyebrow
                </span>
                <input
                  value={draft.development.imageEyebrow}
                  onChange={(e) =>
                    patchDevelopment({ imageEyebrow: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Image caption
                </span>
                <input
                  value={draft.development.imageCaption}
                  onChange={(e) =>
                    patchDevelopment({ imageCaption: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                />
              </label>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-light">
                    Focus image
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    Public frame is 4∶3. Choose from the Media Library, then
                    position.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openPicker("development")}
                    className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
                  >
                    {developmentImageId ? "Change image" : "Select image"}
                  </button>
                  {developmentImageId ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPendingRemove({ kind: "development-image" })
                      }
                      className="rounded-lg border border-white/12 px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
              </div>

              <ImagePositionEditor
                imageUrl={developmentPreviewUrl}
                alt={
                  developmentMedia.data?.altText ||
                  developmentMedia.data?.title ||
                  "Research"
                }
                aspectRatio={RESEARCH_IMAGE_ASPECT}
                emptyLabel="No focus image"
                value={
                  draft.development.image?.imageConfig ??
                  DEFAULT_IMAGE_DISPLAY_CONFIG
                }
                onChange={(imageConfig) => {
                  if (!draft.development.image) return;
                  patchDevelopment({
                    image: {
                      galleryImageId: draft.development.image.galleryImageId,
                      imageConfig,
                    },
                  });
                }}
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-xl font-light">Focus areas</h2>
              <p className="mt-1 text-sm text-white/45">
                Numbering is automatic (01, 02, …) from the list order.
              </p>
            </div>

            <div className="space-y-4">
              {draft.development.areas.map((area, index) => (
                <div
                  key={area.id}
                  className="space-y-3 rounded-lg border border-white/10 bg-navy-900/40 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                      Area {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveArea(index, -1)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={
                          index >= draft.development.areas.length - 1
                        }
                        onClick={() => moveArea(index, 1)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={draft.development.areas.length <= 1}
                        onClick={() => removeArea(index)}
                        className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-30"
                        aria-label="Remove area"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <input
                    value={area.title}
                    onChange={(e) =>
                      updateArea(index, { title: e.target.value })
                    }
                    placeholder="Area title"
                    className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
                  />
                  <textarea
                    value={area.description}
                    onChange={(e) =>
                      updateArea(index, { description: e.target.value })
                    }
                    rows={4}
                    placeholder="Area description"
                    className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addArea}
              className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
            >
              Add area
            </button>
          </div>
        </>
      ) : null}

      {tab === "action" ? (
        <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Title
              </span>
              <textarea
                value={draft.action.title}
                onChange={(e) => patchAction({ title: e.target.value })}
                rows={2}
                className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Accent phrase (italic)
              </span>
              <textarea
                value={draft.action.titleAccent}
                onChange={(e) =>
                  patchAction({ titleAccent: e.target.value })
                }
                rows={2}
                className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Subtitle
            </span>
            <textarea
              value={draft.action.subtitle}
              onChange={(e) => patchAction({ subtitle: e.target.value })}
              rows={3}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <h2 className="font-display text-xl font-light">Spotlight cards</h2>
              <p className="mt-1 text-sm text-white/45">
                Public frames are 16∶10. Leave link empty for non-clickable
                cards.
              </p>
            </div>

            <div className="space-y-5">
              {draft.action.items.map((item, index) => (
                <ActionItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  total={draft.action.items.length}
                  onChange={(patch) => updateActionItem(index, patch)}
                  onMove={(dir) => moveActionItem(index, dir)}
                  onRemove={() => removeActionItem(index)}
                  onPickImage={() => openPicker(index)}
                  onRemoveImage={() =>
                    setPendingRemove({ kind: "action-image", index })
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addActionItem}
              className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
            >
              Add card
            </button>
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="max-w-md text-sm text-white/45">
          One submit saves{" "}
          <span className="text-white/75">Research & Development</span> and{" "}
          <span className="text-white/75">Research in Action</span> together.
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
        selectedId={selectedImageId}
        title={
          pickerTarget === "development"
            ? "Select research focus image"
            : "Select spotlight image"
        }
      />

      <AdminConfirmDialog
        open={pendingRemove !== null}
        eyebrow={
          pendingRemove?.kind === "action-image" ||
          pendingRemove?.kind === "development-image"
            ? "Remove image"
            : pendingRemove?.kind === "action"
              ? "Remove card"
              : "Remove area"
        }
        title={
          pendingRemove?.kind === "action-image" ||
          pendingRemove?.kind === "development-image"
            ? "Remove this image?"
            : pendingRemove?.kind === "action"
              ? "Remove this spotlight card?"
              : "Remove this focus area?"
        }
        description={
          pendingRemove?.kind === "action-image" ||
          pendingRemove?.kind === "development-image"
            ? "The image will be cleared from this draft. Submit to apply the change on the public site."
            : "It will be dropped from the list when you submit. You can cancel if this was a mistake."
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmPendingRemove}
      />
    </div>
  );
}

function ActionItemEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  item: ResearchActionItem;
  index: number;
  total: number;
  onChange: (patch: Partial<ResearchActionItem>) => void;
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
          Card {String(index + 1).padStart(2, "0")}
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
            aria-label="Remove card"
          >
            ✕
          </button>
        </div>
      </div>

      <input
        value={item.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Label (eyebrow)"
        className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
      />
      <input
        value={item.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
      />
      <textarea
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
        placeholder="Description"
        className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={item.href}
          onChange={(e) => onChange({ href: e.target.value })}
          placeholder="Link URL (optional)"
          className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60 md:col-span-2"
        />
      </div>
      <p className="text-[12px] text-white/35">
        When a link is set, the public card shows “View on LinkedIn”. With no
        link, that CTA is hidden.
      </p>

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
        aspectRatio={RESEARCH_ACTION_IMAGE_ASPECT}
        emptyLabel="No image"
        value={item.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG}
        onChange={(imageConfig) => {
          if (!item.image) return;
          onChange({
            image: {
              galleryImageId: item.image.galleryImageId,
              imageConfig,
            },
          });
        }}
      />
    </div>
  );
}
