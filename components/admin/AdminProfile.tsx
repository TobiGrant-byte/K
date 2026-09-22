"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  ABOUT_IMAGE_ASPECT,
  ABOUT_IMAGE_FALLBACK_ALT,
  ABOUT_IMAGE_FALLBACK_SRC,
  HOBBIES_IMAGE_ASPECT,
  normalizeProfileContent,
  useProfileContent,
  useSaveProfileMutation,
  validateProfileWritePayload,
  type ProfileContentInput,
  type ProfileHobbyItem,
} from "@/lib/domains/profile";
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

type Tab = "home" | "about" | "hobbies";
type PickerTarget = "about" | number;
type PendingRemove =
  | { kind: "role"; index: number }
  | { kind: "hobby"; index: number }
  | { kind: "hobby-image"; index: number };

export default function AdminProfile() {
  const profileQuery = useProfileContent();
  const saveMutation = useSaveProfileMutation();
  const [tab, setTab] = useState<Tab>("home");
  const [draft, setDraft] = useState<ProfileContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("about");
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!profileQuery.data) return null;
    const normalized = normalizeProfileContent(profileQuery.data);
    return {
      home: normalized.home,
      about: normalized.about,
      hobbies: normalized.hobbies,
    } satisfies ProfileContentInput;
  }, [profileQuery.data]);

  // Hydrate local edit state once server data is available (React render-time sync).
  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const aboutImageId = draft?.about.image?.galleryImageId ?? null;
  const hobbyImageIndex =
    typeof pickerTarget === "number" ? pickerTarget : null;
  const hobbyImageId =
    hobbyImageIndex !== null
      ? (draft?.hobbies.items[hobbyImageIndex]?.image?.galleryImageId ?? null)
      : null;
  const selectedImageId =
    pickerTarget === "about" ? aboutImageId : hobbyImageId;

  const selectedAboutMedia = useMediaById(aboutImageId);

  const aboutPreviewUrl = useMemo(() => {
    if (selectedAboutMedia.data?.imageUrl) {
      return selectedAboutMedia.data.imageUrl;
    }
    return ABOUT_IMAGE_FALLBACK_SRC;
  }, [selectedAboutMedia.data]);

  const dirty = useMemo(() => {
    if (!draft || !profileQuery.data) return false;
    const current = normalizeProfileContent(profileQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        home: current.home,
        about: current.about,
        hobbies: current.hobbies,
      })
    );
  }, [draft, profileQuery.data]);

  if (!draft) {
    return (
      <p className="text-sm text-white/45">
        {profileQuery.isPending
          ? "Loading profile…"
          : "Could not load profile."}
      </p>
    );
  }

  const patchHome = (patch: Partial<ProfileContentInput["home"]>) => {
    setDraft((prev) =>
      prev ? { ...prev, home: { ...prev.home, ...patch } } : prev,
    );
  };

  const patchAbout = (patch: Partial<ProfileContentInput["about"]>) => {
    setDraft((prev) =>
      prev ? { ...prev, about: { ...prev.about, ...patch } } : prev,
    );
  };

  const patchHobbies = (patch: Partial<ProfileContentInput["hobbies"]>) => {
    setDraft((prev) =>
      prev ? { ...prev, hobbies: { ...prev.hobbies, ...patch } } : prev,
    );
  };

  const updateRole = (index: number, value: string) => {
    const roles = [...draft.home.roles];
    roles[index] = value;
    patchHome({ roles });
  };

  const addRole = () => {
    patchHome({ roles: [...draft.home.roles, ""] });
  };

  const removeRole = (index: number) => {
    if (draft.home.roles.length <= 1) return;
    setPendingRemove({ kind: "role", index });
  };

  const moveRole = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.home.roles.length) return;
    const roles = [...draft.home.roles];
    const [item] = roles.splice(index, 1);
    roles.splice(next, 0, item!);
    patchHome({ roles });
  };

  const updateHobbyItem = (
    index: number,
    patchItem: Partial<ProfileHobbyItem>,
  ) => {
    const items = draft.hobbies.items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patchHobbies({ items });
  };

  const addHobbyItem = () => {
    patchHobbies({
      items: [
        ...draft.hobbies.items,
        {
          id: createId(),
          title: "",
          description: "",
          icon: "◎",
          image: null,
          imageConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        },
      ],
    });
  };

  const removeHobbyItem = (index: number) => {
    if (draft.hobbies.items.length <= 1) return;
    setPendingRemove({ kind: "hobby", index });
  };

  const moveHobbyItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.hobbies.items.length) return;
    const items = [...draft.hobbies.items];
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item!);
    patchHobbies({ items });
  };

  const confirmPendingRemove = () => {
    if (!pendingRemove) return;
    const pending = pendingRemove;
    setPendingRemove(null);
    if (pending.kind === "role") {
      if (draft.home.roles.length <= 1) return;
      patchHome({
        roles: draft.home.roles.filter((_, i) => i !== pending.index),
      });
      return;
    }
    if (pending.kind === "hobby-image") {
      updateHobbyItem(pending.index, { image: null });
      return;
    }
    if (draft.hobbies.items.length <= 1) return;
    patchHobbies({
      items: draft.hobbies.items.filter((_, i) => i !== pending.index),
    });
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
    if (pickerTarget === "about") {
      const prevConfig =
        draft.about.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG;
      patchAbout({
        image: createMediaImageRef(asset.id, prevConfig),
      });
      return;
    }
    const item = draft.hobbies.items[pickerTarget];
    if (!item) return;
    updateHobbyItem(pickerTarget, {
      image: createMediaImageRef(asset.id, item.imageConfig),
      imageConfig: item.imageConfig,
    });
  };

  const clearAboutImage = () => {
    patchAbout({ image: null });
  };

  const save = async () => {
    const validationError = validateProfileWritePayload(draft);
    if (validationError) {
      adminToast.error(validationError);
      return;
    }
    try {
      await saveMutation.mutateAsync(draft);
      adminToast.success("Submitted.");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not submit profile.",
      );
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm text-white/50">
            Shared Home, About, and Hobbies content. The Home hero image
            stays static and is not edited here. Contact lives on its own page.
          </p>
          {profileQuery.data?.updatedAt ? (
            <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
              Updated {formatPostDate(profileQuery.data.updatedAt)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="-mx-1 max-w-full overflow-x-auto pb-1">
        <div className="flex w-max min-w-full overflow-hidden rounded-lg border border-white/12 sm:w-fit sm:min-w-0">
        {(
          [
            { id: "home", label: "Home presentation" },
            { id: "about", label: "About" },
            { id: "hobbies", label: "Hobbies" },
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

      {tab === "home" ? (
        <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl font-light">
              Professional roles
            </h2>
            <p className="mt-1 text-sm text-white/45">
              These rotate under the quote on the Home hero. Use a new line
              inside a role for stacked words (e.g. Transportation / Engineer.).
            </p>
          </div>
          <div className="space-y-3">
            {draft.home.roles.map((role, index) => (
              <div
                key={`role-${index}`}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-navy-900/40 p-3 sm:flex-row sm:items-start"
              >
                <textarea
                  value={role}
                  onChange={(e) => updateRole(index, e.target.value)}
                  rows={2}
                  className="min-w-0 flex-1 resize-y rounded-lg border border-white/12 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                />
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveRole(index, -1)}
                    className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index >= draft.home.roles.length - 1}
                    onClick={() => moveRole(index, 1)}
                    className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-white/60 hover:text-white disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={draft.home.roles.length <= 1}
                    onClick={() => removeRole(index)}
                    className="rounded-md border border-white/12 px-2.5 py-2 text-xs text-red-300/80 hover:text-red-200 disabled:opacity-30"
                    aria-label="Remove role"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRole}
              className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
            >
              Add role
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Quote
            </span>
            <textarea
              value={draft.home.quote}
              onChange={(e) => patchHome({ quote: e.target.value })}
              rows={3}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Title
              </span>
              <textarea
                value={draft.about.title}
                onChange={(e) => patchAbout({ title: e.target.value })}
                rows={3}
                className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                Title Accent phrase (italic and blue)
              </span>
              <textarea
                value={draft.about.titleAccent}
                onChange={(e) => patchAbout({ titleAccent: e.target.value })}
                rows={3}
                className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Excerpt (Home + About intro)
            </span>
            <textarea
              value={draft.about.excerpt}
              onChange={(e) => patchAbout({ excerpt: e.target.value })}
              rows={5}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Full About body
            </span>
            <textarea
              value={draft.about.body}
              onChange={(e) => patchAbout({ body: e.target.value })}
              rows={12}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
            />
            <span className="mt-2 block text-[12px] text-white/35">
              Separate paragraphs with a blank line.
            </span>
          </label>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-light">About image</h2>
                <p className="mt-1 text-sm text-white/45">
                  Choose from the Media Library, then position within the public{" "}
                  {ABOUT_IMAGE_ASPECT.toFixed(2)} aspect frame (360×480).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPicker("about")}
                  className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
                >
                  {aboutImageId ? "Change image" : "Select image"}
                </button>
                {aboutImageId ? (
                  <button
                    type="button"
                    onClick={clearAboutImage}
                    className="rounded-lg border border-white/12 px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
                  >
                    Use site fallback
                  </button>
                ) : null}
              </div>
            </div>

            {!aboutImageId ? (
              <p className="text-sm text-white/40">
                Using static fallback{" "}
                <code className="text-accent-light">
                  {ABOUT_IMAGE_FALLBACK_SRC}
                </code>{" "}
                until a Media Library image is selected.
              </p>
            ) : null}

            <ImagePositionEditor
              imageUrl={aboutPreviewUrl}
              alt={
                selectedAboutMedia.data?.altText ||
                selectedAboutMedia.data?.title ||
                ABOUT_IMAGE_FALLBACK_ALT
              }
              aspectRatio={ABOUT_IMAGE_ASPECT}
              value={
                draft.about.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG
              }
              onChange={(imageConfig) => {
                if (draft.about.image) {
                  patchAbout({
                    image: {
                      galleryImageId: draft.about.image.galleryImageId,
                      imageConfig,
                    },
                  });
                }
              }}
            />
            {!aboutImageId ? (
              <p className="text-[12px] text-white/35">
                Position controls apply after you select a Media Library image.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "hobbies" ? (
        <div className="space-y-6 rounded-xl border border-white/10 bg-navy-800/40 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl font-light">Hobbies</h2>
            <p className="mt-1 text-sm text-white/45">
              Cards and closing quote for the Hobbies section on the About page.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
              Closing quote
            </span>
            <textarea
              value={draft.hobbies.quote}
              onChange={(e) => patchHobbies({ quote: e.target.value })}
              rows={3}
              className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
            />
          </label>

          <div className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <h3 className="font-display text-lg font-light">Cards</h3>
              <p className="mt-1 text-sm text-white/45">
                Each card needs a title, description, and a Media Library image.
              </p>
            </div>

            <div className="space-y-4">
              {draft.hobbies.items.map((item, index) => (
                <HobbyItemEditor
                  key={item.id}
                  item={item}
                  index={index}
                  total={draft.hobbies.items.length}
                  onChange={(patch) => updateHobbyItem(index, patch)}
                  onMove={(dir) => moveHobbyItem(index, dir)}
                  onRemove={() => removeHobbyItem(index)}
                  onPickImage={() => openPicker(index)}
                  onRemoveImage={() =>
                    setPendingRemove({ kind: "hobby-image", index })
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addHobbyItem}
              className="rounded-lg border border-dashed border-white/20 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/35 hover:text-white"
            >
              Add card
            </button>
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <p className="max-w-md text-sm text-white/45">
          One submit saves <span className="text-white/75">roles</span>,{" "}
          <span className="text-white/75">quote</span>,{" "}
          <span className="text-white/75">About</span>, and{" "}
          <span className="text-white/75">Hobbies</span> together.
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
          pickerTarget === "about"
            ? "Select About image"
            : "Select Hobbies image"
        }
      />

      <AdminConfirmDialog
        open={pendingRemove !== null}
        eyebrow={
          pendingRemove?.kind === "hobby-image"
            ? "Remove image"
            : pendingRemove?.kind === "hobby"
              ? "Remove card"
              : "Remove role"
        }
        title={
          pendingRemove?.kind === "hobby-image"
            ? "Remove this image?"
            : pendingRemove?.kind === "hobby"
              ? "Remove this card?"
              : "Remove this role?"
        }
        description={
          pendingRemove?.kind === "hobby-image"
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

function HobbyItemEditor({
  item,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  item: ProfileHobbyItem;
  index: number;
  total: number;
  onChange: (patch: Partial<ProfileHobbyItem>) => void;
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

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={item.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Card title"
          className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-accent/60"
        />
        <input
          value={item.icon}
          onChange={(e) => onChange({ icon: e.target.value })}
          placeholder="Icon"
          maxLength={4}
          className="w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-center text-sm text-white outline-none focus:border-accent/60 md:w-24"
          aria-label="Badge icon"
        />
      </div>
      <textarea
        value={item.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
        placeholder="Description"
        className="w-full resize-y rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-accent/60"
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
        aspectRatio={HOBBIES_IMAGE_ASPECT}
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
