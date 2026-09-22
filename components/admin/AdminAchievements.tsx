"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  ACHIEVEMENTS_CARD_IMAGE_ASPECT,
  ACHIEVEMENTS_PORTRAIT_IMAGE_ASPECT,
  ACHIEVEMENTS_SQUARE_IMAGE_ASPECT,
  normalizeAchievementsContent,
  useAchievementsContent,
  useSaveAchievementsMutation,
  type AchievementMilestoneItem,
  type AchievementTimelineItem,
  type AchievementsContentInput,
} from "@/lib/domains/achievements";
import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  createMediaImageRef,
  isVideoMediaUrl,
  useMediaById,
  type ImageDisplayConfig,
  type MediaAsset,
} from "@/lib/domains/media";
import { createId, formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";

type Tab = "milestones" | "journey";
type PickerTarget =
  | { kind: "milestone"; index: number }
  | { kind: "portrait" }
  | { kind: "secondaryA" }
  | { kind: "secondaryB" };
type PendingRemove =
  | { kind: "milestone"; index: number }
  | { kind: "timeline"; index: number }
  | { kind: "milestone-image"; index: number }
  | { kind: "portrait-image" }
  | { kind: "secondaryA-image" }
  | { kind: "secondaryB-image" };

export default function AdminAchievements() {
  const query = useAchievementsContent();
  const saveMutation = useSaveAchievementsMutation();
  const [tab, setTab] = useState<Tab>("milestones");
  const [draft, setDraft] = useState<AchievementsContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!query.data) return null;
    const normalized = normalizeAchievementsContent(query.data);
    return {
      milestones: normalized.milestones,
      journey: normalized.journey,
    } satisfies AchievementsContentInput;
  }, [query.data]);

  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const dirty = useMemo(() => {
    if (!draft || !query.data) return false;
    const current = normalizeAchievementsContent(query.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        milestones: current.milestones,
        journey: current.journey,
      })
    );
  }, [draft, query.data]);

  const portraitMedia = useMediaById(
    draft?.journey.portraitImage?.galleryImageId,
  );
  const secondaryAMedia = useMediaById(
    draft?.journey.secondaryImageA?.galleryImageId,
  );
  const secondaryBMedia = useMediaById(
    draft?.journey.secondaryImageB?.galleryImageId,
  );

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {query.isPending
          ? "Loading achievements…"
          : "Could not load achievements content."}
      </p>
    );
  }

  const patchMilestones = (
    next: Partial<AchievementsContentInput["milestones"]>,
  ) => {
    setDraft((prev) =>
      prev
        ? { ...prev, milestones: { ...prev.milestones, ...next } }
        : prev,
    );
  };

  const patchJourney = (
    next: Partial<AchievementsContentInput["journey"]>,
  ) => {
    setDraft((prev) =>
      prev ? { ...prev, journey: { ...prev.journey, ...next } } : prev,
    );
  };

  const updateMilestone = (
    index: number,
    patchItem: Partial<AchievementMilestoneItem>,
  ) => {
    const items = draft.milestones.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patchMilestones({ items });
  };

  const updateTimeline = (
    index: number,
    patchItem: Partial<AchievementTimelineItem>,
  ) => {
    const timeline = draft.journey.timeline.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patchJourney({ timeline });
  };

  const onSelectMedia = (asset: MediaAsset) => {
    if (!pickerTarget) return;
    if (isVideoMediaUrl(asset.imageUrl)) {
      adminToast.error("Please choose an image, not a video.");
      return;
    }
    if (pickerTarget.kind === "milestone") {
      const current = draft.milestones.items[pickerTarget.index];
      const imageConfig =
        current?.imageConfig ?? { ...DEFAULT_IMAGE_DISPLAY_CONFIG };
      updateMilestone(pickerTarget.index, {
        image: createMediaImageRef(asset.id, imageConfig),
        imageConfig,
      });
    } else if (pickerTarget.kind === "portrait") {
      const imageConfig = draft.journey.portraitImageConfig;
      patchJourney({
        portraitImage: createMediaImageRef(asset.id, imageConfig),
        portraitImageConfig: imageConfig,
      });
    } else if (pickerTarget.kind === "secondaryA") {
      const imageConfig = draft.journey.secondaryImageAConfig;
      patchJourney({
        secondaryImageA: createMediaImageRef(asset.id, imageConfig),
        secondaryImageAConfig: imageConfig,
      });
    } else {
      const imageConfig = draft.journey.secondaryImageBConfig;
      patchJourney({
        secondaryImageB: createMediaImageRef(asset.id, imageConfig),
        secondaryImageBConfig: imageConfig,
      });
    }
    setPickerOpen(false);
    setPickerTarget(null);
  };

  const confirmPendingRemove = () => {
    if (!pendingRemove) return;
    const pending = pendingRemove;
    setPendingRemove(null);
    if (pending.kind === "milestone") {
      if (draft.milestones.items.length <= 1) return;
      patchMilestones({
        items: draft.milestones.items.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (pending.kind === "timeline") {
      if (draft.journey.timeline.length <= 1) return;
      patchJourney({
        timeline: draft.journey.timeline.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (pending.kind === "milestone-image") {
      updateMilestone(pending.index, { image: null });
      return;
    }
    if (pending.kind === "portrait-image") {
      patchJourney({ portraitImage: null });
      return;
    }
    if (pending.kind === "secondaryA-image") {
      patchJourney({ secondaryImageA: null });
      return;
    }
    patchJourney({ secondaryImageB: null });
  };

  const onSubmit = async () => {
    const { milestones, journey } = draft;
    if (
      !milestones.eyebrow.trim() ||
      !milestones.title.trim() ||
      !journey.eyebrow.trim() ||
      !journey.title.trim() ||
      !journey.quote.trim()
    ) {
      adminToast.error("Section headers and journey quote are required.");
      return;
    }
    if (
      milestones.items.some(
        (item) => !item.title.trim() || !item.description.trim(),
      )
    ) {
      adminToast.error("Each milestone needs a title and description.");
      return;
    }
    if (
      journey.timeline.some((item) => !item.title.trim() || !item.detail.trim())
    ) {
      adminToast.error("Each timeline entry needs a title and detail.");
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Achievements saved.");
    } catch (error) {
      adminToast.error(
        error instanceof Error
          ? error.message
          : "Could not save achievements.",
      );
    }
  };

  const selectedId =
    pickerTarget?.kind === "milestone"
      ? (draft.milestones.items[pickerTarget.index]?.image?.galleryImageId ??
        null)
      : pickerTarget?.kind === "portrait"
        ? (draft.journey.portraitImage?.galleryImageId ?? null)
        : pickerTarget?.kind === "secondaryA"
          ? (draft.journey.secondaryImageA?.galleryImageId ?? null)
          : pickerTarget?.kind === "secondaryB"
            ? (draft.journey.secondaryImageB?.galleryImageId ?? null)
            : null;

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="font-display text-2xl font-light text-white">
          Achievements
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Milestone cards and Career Journey — all copy and images from Firebase
          / Media Library.
        </p>
        {query.data?.updatedAt ? (
          <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/30">
            Last saved {formatPostDate(query.data.updatedAt)}
          </p>
        ) : null}
      </div>

      <div className="-mx-1 max-w-full overflow-x-auto pb-1">
        <div className="flex w-max min-w-full overflow-hidden rounded-lg border border-white/12 sm:w-fit sm:min-w-0">
        {(
          [
            { id: "milestones", label: "Milestones" },
            { id: "journey", label: "Career Journey" },
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

      {tab === "milestones" ? (
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <label className="block space-y-1.5">
              <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                Eyebrow
              </span>
              <input
                value={draft.milestones.eyebrow}
                onChange={(e) => patchMilestones({ eyebrow: e.target.value })}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Title
                </span>
                <input
                  value={draft.milestones.title}
                  onChange={(e) => patchMilestones({ title: e.target.value })}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Title accent
                </span>
                <input
                  value={draft.milestones.titleAccent}
                  onChange={(e) =>
                    patchMilestones({ titleAccent: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </label>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
              Cards
            </h3>
            <button
              type="button"
              onClick={() =>
                patchMilestones({
                  items: [
                    ...draft.milestones.items,
                    {
                      id: createId(),
                      year: "",
                      title: "",
                      org: "",
                      description: "",
                      href: "",
                      image: null,
                      imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
                      extraLinks: [],
                    },
                  ],
                })
              }
              className="rounded-lg border border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60 hover:text-white"
            >
              Add card
            </button>
          </div>

          {draft.milestones.items.map((item, index) => (
            <MilestoneEditor
              key={item.id}
              item={item}
              index={index}
              total={draft.milestones.items.length}
              onChange={(patch) => updateMilestone(index, patch)}
              onMove={(dir) => {
                const next = index + dir;
                if (next < 0 || next >= draft.milestones.items.length) return;
                const items = [...draft.milestones.items];
                const [moved] = items.splice(index, 1);
                items.splice(next, 0, moved!);
                patchMilestones({ items });
              }}
              onRemove={() => setPendingRemove({ kind: "milestone", index })}
              onPickImage={() => {
                setPickerTarget({ kind: "milestone", index });
                setPickerOpen(true);
              }}
              onRemoveImage={() =>
                setPendingRemove({ kind: "milestone-image", index })
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <label className="block space-y-1.5">
              <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                Eyebrow
              </span>
              <input
                value={draft.journey.eyebrow}
                onChange={(e) => patchJourney({ eyebrow: e.target.value })}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-1.5">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Title
                </span>
                <input
                  value={draft.journey.title}
                  onChange={(e) => patchJourney({ title: e.target.value })}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Accent
                </span>
                <input
                  value={draft.journey.titleAccent}
                  onChange={(e) =>
                    patchJourney({ titleAccent: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  After accent
                </span>
                <input
                  value={draft.journey.titleAfter}
                  onChange={(e) => patchJourney({ titleAfter: e.target.value })}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                Portrait quote
              </span>
              <textarea
                value={draft.journey.quote}
                onChange={(e) => patchJourney({ quote: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
              />
            </label>
          </section>

          <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
              Images
            </h3>
            <JourneyImageField
              label="Portrait"
              aspect={ACHIEVEMENTS_PORTRAIT_IMAGE_ASPECT}
              imageUrl={portraitMedia.data?.imageUrl ?? ""}
              alt={portraitMedia.data?.altText || "Portrait"}
              value={draft.journey.portraitImageConfig}
              onChange={(portraitImageConfig) =>
                patchJourney({
                  portraitImageConfig,
                  portraitImage: draft.journey.portraitImage
                    ? {
                        galleryImageId:
                          draft.journey.portraitImage.galleryImageId,
                        imageConfig: portraitImageConfig,
                      }
                    : null,
                })
              }
              onPick={() => {
                setPickerTarget({ kind: "portrait" });
                setPickerOpen(true);
              }}
              onRemove={
                draft.journey.portraitImage
                  ? () => setPendingRemove({ kind: "portrait-image" })
                  : undefined
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <JourneyImageField
                label="Secondary A"
                aspect={ACHIEVEMENTS_SQUARE_IMAGE_ASPECT}
                imageUrl={secondaryAMedia.data?.imageUrl ?? ""}
                alt={secondaryAMedia.data?.altText || "Secondary A"}
                value={draft.journey.secondaryImageAConfig}
                onChange={(secondaryImageAConfig) =>
                  patchJourney({
                    secondaryImageAConfig,
                    secondaryImageA: draft.journey.secondaryImageA
                      ? {
                          galleryImageId:
                            draft.journey.secondaryImageA.galleryImageId,
                          imageConfig: secondaryImageAConfig,
                        }
                      : null,
                  })
                }
                onPick={() => {
                  setPickerTarget({ kind: "secondaryA" });
                  setPickerOpen(true);
                }}
                onRemove={
                  draft.journey.secondaryImageA
                    ? () => setPendingRemove({ kind: "secondaryA-image" })
                    : undefined
                }
              />
              <JourneyImageField
                label="Secondary B"
                aspect={ACHIEVEMENTS_SQUARE_IMAGE_ASPECT}
                imageUrl={secondaryBMedia.data?.imageUrl ?? ""}
                alt={secondaryBMedia.data?.altText || "Secondary B"}
                value={draft.journey.secondaryImageBConfig}
                onChange={(secondaryImageBConfig) =>
                  patchJourney({
                    secondaryImageBConfig,
                    secondaryImageB: draft.journey.secondaryImageB
                      ? {
                          galleryImageId:
                            draft.journey.secondaryImageB.galleryImageId,
                          imageConfig: secondaryImageBConfig,
                        }
                      : null,
                  })
                }
                onPick={() => {
                  setPickerTarget({ kind: "secondaryB" });
                  setPickerOpen(true);
                }}
                onRemove={
                  draft.journey.secondaryImageB
                    ? () => setPendingRemove({ kind: "secondaryB-image" })
                    : undefined
                }
              />
            </div>
          </section>

          <div className="flex items-center justify-between">
            <h3 className="font-title text-[10px] uppercase tracking-[2px] text-white/50">
              Timeline
            </h3>
            <button
              type="button"
              onClick={() =>
                patchJourney({
                  timeline: [
                    ...draft.journey.timeline,
                    {
                      id: createId(),
                      year: "",
                      title: "",
                      org: "",
                      detail: "",
                    },
                  ],
                })
              }
              className="rounded-lg border border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60 hover:text-white"
            >
              Add entry
            </button>
          </div>

          {draft.journey.timeline.map((item, index) => (
            <article
              key={item.id}
              className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Entry {String(index + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  disabled={draft.journey.timeline.length <= 1}
                  onClick={() =>
                    setPendingRemove({ kind: "timeline", index })
                  }
                  className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={item.year}
                  onChange={(e) =>
                    updateTimeline(index, { year: e.target.value })
                  }
                  placeholder="Year"
                  className="rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
                <input
                  value={item.org}
                  onChange={(e) =>
                    updateTimeline(index, { org: e.target.value })
                  }
                  placeholder="Organization"
                  className="rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
                />
              </div>
              <input
                value={item.title}
                onChange={(e) =>
                  updateTimeline(index, { title: e.target.value })
                }
                placeholder="Title"
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
              />
              <textarea
                value={item.detail}
                onChange={(e) =>
                  updateTimeline(index, { detail: e.target.value })
                }
                placeholder="Detail"
                rows={3}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
              />
            </article>
          ))}
        </div>
      )}

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
        onClose={() => {
          setPickerOpen(false);
          setPickerTarget(null);
        }}
        onSelect={onSelectMedia}
        selectedId={selectedId}
      />

      <AdminConfirmDialog
        open={Boolean(pendingRemove)}
        title={
          pendingRemove?.kind.endsWith("image")
            ? "Remove image"
            : pendingRemove?.kind === "timeline"
              ? "Remove timeline entry?"
              : "Remove this milestone?"
        }
        description="This updates Achievements content in Firebase."
        confirmLabel="Remove"
        onCancel={() => setPendingRemove(null)}
        onConfirm={confirmPendingRemove}
      />
    </div>
  );
}

function JourneyImageField({
  label,
  aspect,
  imageUrl,
  alt,
  value,
  onChange,
  onPick,
  onRemove,
}: {
  label: string;
  aspect: number;
  imageUrl: string;
  alt: string;
  value: ImageDisplayConfig;
  onChange: (next: ImageDisplayConfig) => void;
  onPick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <span className="mr-auto font-title text-[9px] uppercase tracking-[2px] text-white/40">
          {label}
        </span>
        <button
          type="button"
          onClick={onPick}
          className="rounded-lg border border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60"
        >
          {imageUrl ? "Change" : "Choose"}
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg border border-white/12 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60"
          >
            Remove
          </button>
        ) : null}
      </div>
      <ImagePositionEditor
        imageUrl={imageUrl}
        alt={alt}
        aspectRatio={aspect}
        emptyLabel="No image"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function MilestoneEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  item: AchievementMilestoneItem;
  index: number;
  total: number;
  onChange: (patch: Partial<AchievementMilestoneItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
}) {
  const media = useMediaById(item.image?.galleryImageId);
  return (
    <article className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
          Card {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index >= total - 1}
            onClick={() => onMove(1)}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={total <= 1}
            onClick={onRemove}
            className="rounded-lg border border-white/12 px-2.5 py-1.5 font-title text-[9px] uppercase tracking-[2px] text-white/50 disabled:opacity-30"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={item.year}
          onChange={(e) => onChange({ year: e.target.value })}
          placeholder="Year"
          className="rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
        />
        <input
          value={item.org}
          onChange={(e) => onChange({ org: e.target.value })}
          placeholder="Organization"
          className="rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
        />
      </div>
      <input
        value={item.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Title"
        className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
      />
      <textarea
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description"
        rows={4}
        className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
      />
      <input
        value={item.href}
        onChange={(e) => onChange({ href: e.target.value })}
        placeholder="Link URL (optional)"
        className="w-full rounded-lg border border-white/12 bg-navy-900 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPickImage}
          className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/60"
        >
          {item.image ? "Change image" : "Choose image"}
        </button>
        {item.image ? (
          <button
            type="button"
            onClick={onRemoveImage}
            className="rounded-lg border border-white/12 px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white/60"
          >
            Remove image
          </button>
        ) : null}
      </div>
      <ImagePositionEditor
        imageUrl={media.data?.imageUrl ?? ""}
        alt={media.data?.altText || item.title}
        aspectRatio={ACHIEVEMENTS_CARD_IMAGE_ASPECT}
        emptyLabel="No image"
        value={item.imageConfig}
        onChange={(imageConfig) =>
          onChange({
            imageConfig,
            image: item.image
              ? {
                  galleryImageId: item.image.galleryImageId,
                  imageConfig,
                }
              : null,
          })
        }
      />
    </article>
  );
}
