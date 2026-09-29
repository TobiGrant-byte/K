"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  PROJECT_CATEGORIES,
  PROJECTS_IMAGE_ASPECT,
  normalizeProjectsContent,
  useProjectsContent,
  useSaveProjectsMutation,
  type ProjectCategory,
  type ProjectItem,
  type ProjectsContentInput,
} from "@/lib/domains/projects";
import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  createMediaImageRef,
  isVideoMediaUrl,
  useMediaById,
  type MediaAsset,
} from "@/lib/domains/media";
import { createId, formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-[border-color] focus:border-accent/60 placeholder:text-white/35";

const removeBtnClass =
  "rounded-md border border-white/12 px-2.5 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-30";

function emptyItem(): ProjectItem {
  return {
    id: createId(),
    title: "",
    category: "Safety",
    summary: "",
    highlights: [""],
    href: "",
    image: null,
    imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
  };
}

export default function AdminProjects() {
  const projectsQuery = useProjectsContent();
  const saveMutation = useSaveProjectsMutation();
  const [draft, setDraft] = useState<ProjectsContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(0);

  const serverDraft = useMemo(() => {
    if (!projectsQuery.data) return null;
    const normalized = normalizeProjectsContent(projectsQuery.data);
    return {
      eyebrow: normalized.eyebrow,
      title: normalized.title,
      titleAccent: normalized.titleAccent,
      subtitle: normalized.subtitle,
      items: normalized.items,
    } satisfies ProjectsContentInput;
  }, [projectsQuery.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const dirty = useMemo(() => {
    if (!draft || !projectsQuery.data) return false;
    const current = normalizeProjectsContent(projectsQuery.data);
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
  }, [draft, projectsQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {projectsQuery.isPending
          ? "Loading projects…"
          : "Could not load projects content."}
      </p>
    );
  }

  const patch = (next: Partial<ProjectsContentInput>) => {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
  };

  const updateItem = (index: number, patchItem: Partial<ProjectItem>) => {
    const items = draft.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patch({ items });
  };

  const addItem = () => {
    patch({ items: [...draft.items, emptyItem()] });
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.items.length) return;
    const items = [...draft.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patch({ items });
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
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Projects saved.");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not save projects.",
      );
    }
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="max-w-2xl">
        <p className="text-sm text-white/50">
          Page header plus project entries. Categories work like blog categories
          (Safety, Operations, Safety & Operations, ITS, Others). Empty content
          is allowed.
        </p>
        {projectsQuery.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
            Last saved {formatPostDate(projectsQuery.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <section className="space-y-5 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
        <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
          Section header
        </h3>
        <label className="block">
          <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
            Eyebrow
          </span>
          <input
            value={draft.eyebrow}
            onChange={(e) => patch({ eyebrow: e.target.value })}
            className={inputClass}
            placeholder="Projects"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Title accent
            </span>
            <input
              value={draft.titleAccent}
              onChange={(e) => patch({ titleAccent: e.target.value })}
              className={inputClass}
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
            className={`${inputClass} resize-y`}
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
            Project entries
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
          >
            New project
          </button>
        </div>

        {draft.items.length === 0 ? (
          <p className="font-display italic text-white/50">
            No projects yet — create the first one.
          </p>
        ) : null}

        {draft.items.map((item, index) => (
          <ProjectItemEditor
            key={item.id}
            item={item}
            index={index}
            total={draft.items.length}
            onChange={(patchItem) => updateItem(index, patchItem)}
            onMove={(dir) => moveItem(index, dir)}
            onRemove={() =>
              patch({ items: draft.items.filter((_, i) => i !== index) })
            }
            onPickImage={() => {
              setPickerIndex(index);
              setPickerOpen(true);
            }}
            onRemoveImage={() => updateItem(index, { image: null })}
          />
        ))}
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          disabled={!dirty || saveMutation.isPending}
          onClick={() => void onSubmit()}
          className="rounded-lg bg-accent px-6 py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white hover:bg-accent-light disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving…" : "Submit"}
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onSelectMedia}
        selectedId={draft.items[pickerIndex]?.image?.galleryImageId ?? null}
        title="Select project image"
      />
    </div>
  );
}

function ProjectItemEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  item: ProjectItem;
  index: number;
  total: number;
  onChange: (patch: Partial<ProjectItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
}) {
  const media = useMediaById(item.image?.galleryImageId);
  const previewUrl = media.data?.imageUrl ?? "";
  const points = item.highlights.length ? item.highlights : [""];

  return (
    <article className="space-y-5 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
          Project {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index >= total - 1}
            className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            className={removeBtnClass}
            aria-label="Remove project"
          >
            ✕
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Title
        </span>
        <input
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClass}
          placeholder="Project title"
        />
      </label>

      <div>
        <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Category
        </span>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Category"
        >
          {PROJECT_CATEGORIES.map((category) => {
            const selected = item.category === category;
            return (
              <button
                key={category}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  onChange({ category: category as ProjectCategory })
                }
                className={`rounded-full border px-4 py-2 font-title text-[9px] uppercase tracking-[2px] transition-colors ${
                  selected
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : "border-white/12 bg-transparent text-white/50 hover:border-white/20 hover:text-white/80"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Summary
        </span>
        <textarea
          value={item.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder="Short text summary"
        />
      </label>

      <div>
        <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Bullet highlights
        </span>
        <div className="space-y-2">
          {points.map((point, pointIndex) => (
            <div key={`${item.id}-point-${pointIndex}`} className="flex gap-2">
              <input
                value={point}
                onChange={(e) => {
                  const next = [...points];
                  next[pointIndex] = e.target.value;
                  onChange({ highlights: next });
                }}
                className={inputClass}
                placeholder="Highlight point"
              />
              <button
                type="button"
                onClick={() => {
                  const next = points.filter((_, i) => i !== pointIndex);
                  onChange({ highlights: next });
                }}
                className={removeBtnClass}
                aria-label="Remove highlight"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange({ highlights: [...points, ""] })}
            className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
          >
            Add point
          </button>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Optional link
        </span>
        <input
          value={item.href}
          onChange={(e) => onChange({ href: e.target.value })}
          className={inputClass}
          placeholder="https://..."
        />
      </label>

      <div className="space-y-4 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h4 className="font-display text-xl font-light">Image</h4>
            <p className="mt-1 text-sm text-white/45">
              Optional. Choose from Media Library when needed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPickImage}
              className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
            >
              {item.image ? "Change image" : "Select image"}
            </button>
            {item.image ? (
              <button
                type="button"
                onClick={onRemoveImage}
                className={removeBtnClass}
                aria-label="Remove image"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <ImagePositionEditor
          imageUrl={previewUrl}
          alt={media.data?.altText || media.data?.title || item.title}
          aspectRatio={PROJECTS_IMAGE_ASPECT}
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
