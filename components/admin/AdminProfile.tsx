"use client";

import { useMemo, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import ImagePositionEditor from "@/components/media/ImagePositionEditor";
import {
  ABOUT_IMAGE_ASPECT,
  ABOUT_IMAGE_FALLBACK_ALT,
  ABOUT_IMAGE_FALLBACK_SRC,
  normalizeProfileContent,
  useProfileContent,
  useSaveProfileMutation,
  type ProfileContentInput,
} from "@/lib/domains/profile";
import {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  createMediaImageRef,
  isVideoMediaUrl,
  useMediaById,
  type MediaAsset,
} from "@/lib/domains/media";
import { formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";

type Tab = "home" | "about";

export default function AdminProfile() {
  const profileQuery = useProfileContent();
  const saveMutation = useSaveProfileMutation();
  const [tab, setTab] = useState<Tab>("home");
  const [draft, setDraft] = useState<ProfileContentInput | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingRemoveRole, setPendingRemoveRole] = useState<number | null>(
    null,
  );

  const serverDraft = useMemo(() => {
    if (!profileQuery.data) return null;
    const normalized = normalizeProfileContent(profileQuery.data);
    return {
      home: normalized.home,
      about: normalized.about,
    } satisfies ProfileContentInput;
  }, [profileQuery.data]);

  // Hydrate local edit state once server data is available (React render-time sync).
  if (serverDraft && draft === null) {
    setDraft(serverDraft);
  }

  const selectedImageId = draft?.about.image?.galleryImageId ?? null;
  const selectedMedia = useMediaById(selectedImageId);

  const previewUrl = useMemo(() => {
    if (selectedMedia.data?.imageUrl) return selectedMedia.data.imageUrl;
    return ABOUT_IMAGE_FALLBACK_SRC;
  }, [selectedMedia.data]);

  const dirty = useMemo(() => {
    if (!draft || !profileQuery.data) return false;
    const current = normalizeProfileContent(profileQuery.data);
    return (
      JSON.stringify(draft) !==
      JSON.stringify({
        home: current.home,
        about: current.about,
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
    setPendingRemoveRole(index);
  };

  const confirmRemoveRole = () => {
    if (pendingRemoveRole === null) return;
    const index = pendingRemoveRole;
    setPendingRemoveRole(null);
    if (draft.home.roles.length <= 1) return;
    patchHome({ roles: draft.home.roles.filter((_, i) => i !== index) });
  };

  const moveRole = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= draft.home.roles.length) return;
    const roles = [...draft.home.roles];
    const [item] = roles.splice(index, 1);
    roles.splice(next, 0, item!);
    patchHome({ roles });
  };

  const onSelectMedia = (asset: MediaAsset) => {
    if (isVideoMediaUrl(asset.imageUrl)) {
      adminToast.error("Please choose an image, not a video.");
      return;
    }
    const prevConfig =
      draft.about.image?.imageConfig ?? DEFAULT_IMAGE_DISPLAY_CONFIG;
    patchAbout({
      image: createMediaImageRef(asset.id, prevConfig),
    });
  };

  const clearImage = () => {
    patchAbout({ image: null });
  };

  const save = async () => {
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
            Shared Home and About content. The Home hero image stays static and
            is not edited here. Contact lives on its own page.
          </p>
          {profileQuery.data?.updatedAt ? (
            <p className="mt-2 font-title text-[9px] uppercase tracking-[2px] text-white/35">
              Updated {formatPostDate(profileQuery.data.updatedAt)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex overflow-hidden rounded-lg border border-white/12 w-fit">
        {(
          [
            { id: "home", label: "Home presentation" },
            { id: "about", label: "About" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2.5 font-title text-[9px] uppercase tracking-[1.5px] ${
              item.id !== "home" ? "border-l border-white/12 " : ""
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

          {/* <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
            Home hero image is fixed at{" "}
            <code className="text-accent-light">/images/hero-picture.jpeg</code>{" "}
            and is not managed in the CMS.
          </p> */}
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
                  onClick={() => setPickerOpen(true)}
                  className="rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
                >
                  {selectedImageId ? "Change image" : "Select image"}
                </button>
                {selectedImageId ? (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="rounded-lg border border-white/12 px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/60 hover:text-white"
                  >
                    Use site fallback
                  </button>
                ) : null}
              </div>
            </div>

            {!selectedImageId ? (
              <p className="text-sm text-white/40">
                Using static fallback{" "}
                <code className="text-accent-light">
                  {ABOUT_IMAGE_FALLBACK_SRC}
                </code>{" "}
                until a Media Library image is selected.
              </p>
            ) : null}

            <ImagePositionEditor
              imageUrl={previewUrl}
              alt={
                selectedMedia.data?.altText ||
                selectedMedia.data?.title ||
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
                  return;
                }
                // Positioning the fallback preview only — keep image null until selected.
              }}
            />
            {!selectedImageId ? (
              <p className="text-[12px] text-white/35">
                Position controls apply after you select a Media Library image.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-navy-900/95 px-4 py-4 backdrop-blur-sm sm:px-1">
        <p className="text-sm text-white/45">
          One submit saves <span className="text-white/75">roles</span>,{" "}
          <span className="text-white/75">quote</span>, and{" "}
          <span className="text-white/75">About</span> (text + image) together.
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
        title="Select About image"
      />

      <AdminConfirmDialog
        open={pendingRemoveRole !== null}
        eyebrow="Remove role"
        title="Remove this role?"
        description="It will be dropped from the list when you submit. You can cancel if this was a mistake."
        confirmLabel="Remove"
        onCancel={() => setPendingRemoveRole(null)}
        onConfirm={confirmRemoveRole}
      />
    </div>
  );
}
