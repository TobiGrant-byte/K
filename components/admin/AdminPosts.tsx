"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import ImageCropModal from "@/components/admin/ImageCropModal";
import AdminComments from "@/components/admin/AdminComments";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";
import PostRowActions from "@/components/admin/PostRowActions";
import RichTextEditor, {
  insertImageIntoEditor,
} from "@/components/admin/RichTextEditor";
import { useAdminUiStore } from "@/lib/admin/ui-store";
import { adminToast } from "@/lib/admin/toast-store";
import {
  BLOG_CATEGORIES,
  DEFAULT_BLOG_AUTHOR,
  MAX_BODY_IMAGES,
  MAX_EXCERPT_IMAGES,
  collectPostImageUrls,
  countHtmlImages,
  createId,
  fileToDataUrl,
  formatPostDate,
  htmlToPlainText,
  migrateLegacyRichHtml,
  richTextHasContent,
  sanitizeBlogHtml,
  slugify,
  type BlogPost,
} from "@/lib/blog";
import {
  assertUniqueSlug,
  removePost,
  savePost,
  useAdminPosts,
} from "@/lib/domains/blog";
import {
  deleteImageKitImages,
  isImageKitBlogUrl,
  syncPostImages,
  uploadCroppedBlogImage,
} from "@/lib/imagekit/images";

type Mode = "list" | "create" | "edit";

type CropTarget = "cover" | "excerpt" | "body";
type CropJob = { src: string; target: CropTarget; replaces?: string };

type UploadingImage = {
  id: string;
  preview: string;
  target: CropTarget;
  replaces?: string;
  error?: string;
};

const inputClass =
  "w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-[border-color] focus:border-accent/60 placeholder:text-white/35";

function emptyDraft(): Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
} {
  return {
    slug: "",
    title: "",
    author: DEFAULT_BLOG_AUTHOR,
    excerpt: "",
    body: "",
    category: "Reflections",
    coverImage: undefined,
    published: true,
  };
}

export default function AdminPosts() {
  const postsQuery = useAdminPosts();
  const posts = postsQuery.data ?? [];
  const commentsPostId = useAdminUiStore((s) => s.commentsPostId);
  const openPostComments = useAdminUiStore((s) => s.openPostComments);
  const clearPostComments = useAdminUiStore((s) => s.clearPostComments);
  const [mode, setMode] = useState<Mode>("list");
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingRemoveCover, setPendingRemoveCover] = useState(false);
  const [cropQueue, setCropQueue] = useState<CropJob[]>([]);
  const [recropSrc, setRecropSrc] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  /** Stable post id for ImageKit folder while creating/editing. */
  const [workingPostId, setWorkingPostId] = useState<string | null>(null);
  const excerptEditorRef = useRef<HTMLDivElement | null>(null);
  const bodyEditorRef = useRef<HTMLDivElement | null>(null);
  const excerptFileRef = useRef<HTMLInputElement | null>(null);
  const bodyFileRef = useRef<HTMLInputElement | null>(null);

  const flash = useCallback((text: string, error = false) => {
    if (error) adminToast.error(text);
    else adminToast.success(text);
  }, []);

  const sorted = useMemo(
    () =>
      [...(postsQuery.data ?? [])].sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
      ),
    [postsQuery.data],
  );


  const openCreate = () => {
    setEditingId(null);
    setWorkingPostId(createId());
    setDraft(emptyDraft());
    setUploadingImages([]);
    setCropQueue([]);
    setRecropSrc(null);
    setMode("create");
  };

  const openEdit = (id: string) => {
    const post = posts.find((item) => item.id === id);
    if (!post) return;
    setEditingId(id);
    setWorkingPostId(id);
    setDraft({
      ...post,
      excerpt: migrateLegacyRichHtml(post.excerpt),
      body: migrateLegacyRichHtml(post.body),
    });
    setUploadingImages([]);
    setCropQueue([]);
    setRecropSrc(null);
    setMode("edit");
  };

  const onTitleChange = (title: string) => {
    setDraft((d) => ({
      ...d,
      title,
      slug: mode === "create" || !d.slug ? slugify(title) : d.slug,
    }));
  };

  const imagesBusy =
    uploadingImages.some((item) => !item.error) ||
    cropQueue.length > 0 ||
    Boolean(recropSrc);

  const queueCoverFile = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const src = await fileToDataUrl(file);
    setCropQueue((q) => [
      ...q,
      {
        src,
        target: "cover",
        replaces: draft.coverImage,
      },
    ]);
  };

  const queueEditorFile = async (
    files: FileList | null,
    target: "excerpt" | "body",
  ) => {
    if (!files?.length) return;
    const html = target === "excerpt" ? draft.excerpt : draft.body;
    const maxImages =
      target === "excerpt" ? MAX_EXCERPT_IMAGES : MAX_BODY_IMAGES;
    const pending = uploadingImages.filter(
      (item) => item.target === target,
    ).length;
    if (countHtmlImages(html) + pending >= maxImages) {
      flash(
        `Maximum of ${maxImages} inline image${maxImages === 1 ? "" : "s"} in the ${target}.`,
        true,
      );
      return;
    }
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) return;
    const src = await fileToDataUrl(file);
    setCropQueue((q) => [...q, { src, target }]);
  };

  const currentCrop = cropQueue[0] || null;

  const beginImageUpload = (
    croppedDataUrl: string,
    options: {
      target: CropTarget;
      replaces?: string;
    },
  ) => {
    const postId = workingPostId || editingId || createId();
    if (!workingPostId) setWorkingPostId(postId);

    const uploadId = createId();
    setUploadingImages((items) => [
      ...items,
      {
        id: uploadId,
        preview: croppedDataUrl,
        target: options.target,
        replaces: options.replaces,
      },
    ]);

    void (async () => {
      try {
        const url = await uploadCroppedBlogImage(croppedDataUrl, postId);
        setUploadingImages((items) =>
          items.filter((item) => item.id !== uploadId),
        );
        if (options.target === "cover") {
          setDraft((d) => ({ ...d, coverImage: url }));
        } else {
          insertImageIntoEditor(
            options.target === "excerpt"
              ? excerptEditorRef.current
              : bodyEditorRef.current,
            url,
          );
        }

        if (options.replaces && isImageKitBlogUrl(options.replaces)) {
          if (!editingId) {
            void deleteImageKitImages([options.replaces]).catch(console.error);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Image upload failed.";
        setUploadingImages((items) =>
          items.map((item) =>
            item.id === uploadId ? { ...item, error: message } : item,
          ),
        );
        flash(message, true);
      }
    })();
  };

  const finishCrop = (croppedDataUrl: string) => {
    if (recropSrc) {
      const replacing = recropSrc;
      setRecropSrc(null);
      setDraft((d) => ({ ...d, coverImage: undefined }));
      beginImageUpload(croppedDataUrl, {
        target: "cover",
        replaces: replacing,
      });
      return;
    }

    const job = cropQueue[0];
    if (!job) return;
    setCropQueue((q) => q.slice(1));
    if (job.target === "cover") {
      beginImageUpload(croppedDataUrl, {
        target: "cover",
        replaces: job.replaces,
      });
      return;
    }
    beginImageUpload(croppedDataUrl, { target: job.target });
  };

  const cancelCrop = () => {
    if (recropSrc) {
      setRecropSrc(null);
      return;
    }
    setCropQueue((q) => q.slice(1));
  };

  const removeUploadingImage = (id: string) => {
    setUploadingImages((items) => items.filter((item) => item.id !== id));
  };

  const retryUpload = (item: UploadingImage) => {
    setUploadingImages((items) =>
      items.filter((entry) => entry.id !== item.id),
    );
    beginImageUpload(item.preview, {
      target: item.target,
      replaces: item.replaces,
    });
  };

  const editorUploadStatus = (target: "excerpt" | "body") =>
    uploadingImages
      .filter((item) => item.target === target)
      .map((item) => (
        <div
          key={item.id}
          className={`mt-2 flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px] ${
            item.error
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-accent/30 bg-accent/10 text-accent-light"
          }`}
        >
          <span>
            {item.error ? "Image upload failed." : "Uploading image…"}
          </span>
          {item.error ? (
            <span className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => retryUpload(item)}
                className="font-title text-[8px] uppercase tracking-[1.5px] text-accent"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => removeUploadingImage(item.id)}
                className="font-title text-[8px] uppercase tracking-[1.5px] text-red-400"
              >
                Remove
              </button>
            </span>
          ) : null}
        </div>
      ));

  const removeCover = () => {
    setPendingRemoveCover(true);
  };

  const confirmRemoveCover = () => {
    const src = draft.coverImage;
    setPendingRemoveCover(false);
    setDraft((d) => ({ ...d, coverImage: undefined }));
    if (!editingId && src && isImageKitBlogUrl(src)) {
      void deleteImageKitImages([src]).catch(console.error);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.title.trim();
    const author = draft.author.trim();
    const slug = slugify(draft.slug || draft.title);
    const excerpt = sanitizeBlogHtml(draft.excerpt);
    const body = sanitizeBlogHtml(draft.body);

    if (
      !title ||
      !author ||
      !slug ||
      !richTextHasContent(excerpt) ||
      !richTextHasContent(body) ||
      !draft.category
    ) {
      flash(
        "Please fill in title, author, URL slug, category, short excerpt, and body text before submitting.",
        true,
      );
      return;
    }
    if (!draft.coverImage) {
      flash("Please add a cover photo before submitting.", true);
      return;
    }
    if (countHtmlImages(excerpt) > MAX_EXCERPT_IMAGES) {
      flash(
        `The short excerpt can include at most ${MAX_EXCERPT_IMAGES} inline image.`,
        true,
      );
      return;
    }
    if (countHtmlImages(body) > MAX_BODY_IMAGES) {
      flash(
        `The body can include at most ${MAX_BODY_IMAGES} inline images.`,
        true,
      );
      return;
    }
    if (imagesBusy || uploadingImages.some((item) => item.error)) {
      flash(
        uploadingImages.some((item) => item.error)
          ? "Fix or remove failed image uploads before publishing."
          : "Wait for image uploads to finish before publishing.",
        true,
      );
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const postId = workingPostId || editingId || createId();
      await assertUniqueSlug(slug, editingId ?? undefined);

      const previous = editingId
        ? posts.find((post) => post.id === editingId)
        : undefined;
      const previousImages = previous
        ? collectPostImageUrls(
            previous.coverImage,
            previous.excerpt,
            previous.body,
          )
        : [];
      const imageSources = collectPostImageUrls(
        draft.coverImage,
        excerpt,
        body,
      );
      const synced = await syncPostImages({
        postId,
        imageSources,
        coverSource: draft.coverImage,
        previousImages,
      });

      if (!synced.coverImage) {
        flash("Please add a cover photo before submitting.", true);
        return;
      }

      const post: BlogPost = {
        id: postId,
        slug,
        title,
        author,
        excerpt,
        body,
        category: draft.category,
        coverImage: synced.coverImage,
        published: draft.published,
        createdAt: draft.createdAt || now,
        updatedAt: now,
      };

      await savePost(post, { creating: !editingId });
      try {
        await deleteImageKitImages(synced.removedImages);
      } catch (cleanupError) {
        console.error(
          "Post saved, but removed image cleanup failed.",
          cleanupError,
        );
      }
      flash(editingId ? "Post updated." : "Post created.");
      setMode("list");
      setEditingId(null);
      setWorkingPostId(null);
      setUploadingImages([]);
      setDraft(emptyDraft());
    } catch (error) {
      flash(
        error instanceof Error ? error.message : "Could not save this post.",
        true,
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const target = posts.find((post) => post.id === deleteId);
      if (target) {
        await deleteImageKitImages(
          collectPostImageUrls(target.coverImage, target.excerpt, target.body),
        );
      }
      await removePost(deleteId);
      setDeleteId(null);
      flash("Post deleted.");
    } catch (error) {
      flash(
        error instanceof Error ? error.message : "Could not delete this post.",
        true,
      );
    }
  };

  const deleteTarget = deleteId ? posts.find((p) => p.id === deleteId) : null;
  const commentsPost = commentsPostId
    ? posts.find((p) => p.id === commentsPostId)
    : null;

  if (commentsPostId) {
    return (
      <AdminComments
        filterPostId={commentsPostId}
        postTitle={commentsPost?.title}
        onBack={clearPostComments}
      />
    );
  }

  return (
    <div className="space-y-6 text-white">
      <div>

        {postsQuery.isError ? (
          <p className="mb-6 text-sm text-red-400" role="alert">
            Could not load posts.
          </p>
        ) : null}

        {/* <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-[12px] text-white/50">
          Local preview only — posts live in this browser&apos;s storage. Firebase comes next; this
          data can be cleared anytime.
        </div> */}

        {mode === "list" ? (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-white/50">{sorted.length} total</p>
              <button
                type="button"
                onClick={openCreate}
                className="shrink-0 rounded-lg bg-accent px-4 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light sm:px-5"
              >
                New post
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {sorted.map((post) => (
                <article
                  key={post.id}
                  className="relative overflow-visible rounded-xl border border-white/10 bg-navy-800 sm:flex sm:items-stretch sm:gap-0 sm:p-0"
                >
                  <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-t-xl bg-white/5 sm:aspect-auto sm:h-auto sm:w-40 sm:self-stretch sm:rounded-none sm:rounded-l-xl">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full min-h-[7.5rem] items-center justify-center sm:min-h-full">
                        <span className="font-title text-[8px] uppercase tracking-[2px] text-white/40">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-visible p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 font-title text-[10px] uppercase tracking-[1.5px]">
                          <span className="font-semibold text-accent">
                            {post.category}
                          </span>
                          <span className="text-white/25" aria-hidden>
                            ·
                          </span>
                          <span
                            className={`font-semibold ${
                              post.published
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {post.published ? "Published" : "Draft"}
                          </span>
                          <span className="text-white/25" aria-hidden>
                            ·
                          </span>
                          <span className="font-medium text-white/60">
                            {formatPostDate(post.updatedAt)}
                          </span>
                        </div>
                        <PostRowActions
                          slug={post.slug}
                          onEdit={() => openEdit(post.id)}
                          onComments={() => openPostComments(post.id)}
                          onDelete={() => remove(post.id)}
                        />
                      </div>
                      <h2 className="font-display text-[22px] leading-snug text-white sm:truncate sm:text-xl">
                        {post.title}
                      </h2>
                      <p className="admin-text-dim mt-1 text-[12px]">
                        By {post.author || DEFAULT_BLOG_AUTHOR}
                      </p>
                      {post.excerpt ? (
                        <p className="admin-text-dim mt-1.5 line-clamp-2 text-[13px] leading-relaxed sm:line-clamp-1">
                          {htmlToPlainText(post.excerpt)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
              {sorted.length === 0 ? (
                <p className="font-display italic text-white/50">
                  No posts yet — create the first one.
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <form onSubmit={save} className="mx-auto max-w-3xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-light">
                {mode === "edit" ? "Edit post" : "New post"}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setMode("list");
                }}
                className="font-title text-[9px] uppercase tracking-[2px] text-white/50 hover:text-white"
              >
                ← Back to list
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Title
                </span>
                <input
                  className={inputClass}
                  value={draft.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  required
                  placeholder="Keeping Going Every Day"
                />
              </label>

              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Author
                </span>
                <input
                  className={inputClass}
                  value={draft.author}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, author: e.target.value }))
                  }
                  required
                  placeholder="Dr. Sunday Okafor"
                />
              </label>

              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  URL slug
                </span>
                <input
                  className={inputClass}
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))
                  }
                  required
                  placeholder="keeping-going-every-day"
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
                  {BLOG_CATEGORIES.map((c) => {
                    const selected = draft.category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setDraft((d) => ({ ...d, category: c }))}
                        className={`rounded-full border px-4 py-2 font-title text-[9px] uppercase tracking-[2px] transition-colors ${
                          selected
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : "border-white/12 bg-transparent text-white/50 hover:border-white/20 hover:text-white/80"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, published: e.target.checked }))
                  }
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Published (visible on /blog)
                </span>
              </label>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-white/50">
                    Cover photo
                  </span>
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-accent">
                    Required
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label
                    className={`rounded-lg border border-dashed border-accent/40 bg-accent/5 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-accent hover:bg-accent/5 ${
                      imagesBusy
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }`}
                  >
                    {draft.coverImage ? "Replace cover" : "Add cover photo"}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={imagesBusy}
                      className="hidden"
                      onChange={(e) => {
                        void queueCoverFile(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {draft.coverImage ||
                uploadingImages.some((item) => item.target === "cover") ? (
                  <div className="mt-4 max-w-md">
                    {uploadingImages
                      .filter((item) => item.target === "cover")
                      .map((item) => (
                        <div
                          key={item.id}
                          className="relative overflow-hidden rounded-lg border border-white/10"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.preview}
                            alt=""
                            className="aspect-[16/10] w-full bg-white/5 object-contain object-center opacity-40"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-900/80 px-3 text-center">
                            {item.error ? (
                              <>
                                <p className="text-[11px] leading-snug text-red-300">
                                  Upload failed
                                </p>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => retryUpload(item)}
                                    className="rounded border border-accent/40 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-accent"
                                  >
                                    Retry
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeUploadingImage(item.id)
                                    }
                                    className="rounded border border-red-500/30 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-red-400"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p className="font-title text-[9px] uppercase tracking-[2px] text-accent">
                                Uploading…
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    {draft.coverImage ? (
                      <div className="relative overflow-hidden rounded-lg border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={draft.coverImage}
                          alt=""
                          className="aspect-[16/10] w-full bg-white/5 object-contain object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-navy-900/70 p-1.5">
                          <button
                            type="button"
                            onClick={() => setRecropSrc(draft.coverImage!)}
                            disabled={imagesBusy}
                            className="rounded border border-accent/40 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-accent disabled:opacity-40"
                          >
                            Recrop
                          </button>
                          <button
                            type="button"
                            onClick={removeCover}
                            disabled={imagesBusy}
                            className="rounded border border-red-500/30 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-red-400 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-white/40">
                    Cropped to 16:10 (1200×750). Shown at the top of the post.
                  </p>
                )}
              </div>

              <div>
                <input
                  ref={excerptFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void queueEditorFile(e.target.files, "excerpt");
                    e.target.value = "";
                  }}
                />
                <RichTextEditor
                  label="Short excerpt"
                  value={draft.excerpt}
                  onChange={(excerpt) => setDraft((d) => ({ ...d, excerpt }))}
                  maxImages={MAX_EXCERPT_IMAGES}
                  onRequestImage={() => excerptFileRef.current?.click()}
                  uploading={uploadingImages.some(
                    (item) => item.target === "excerpt" && !item.error,
                  )}
                  disabled={imagesBusy}
                  minHeightClass="min-h-[120px]"
                  hint="Preview for blog cards. Bold, italic, bullets, numbers, and at most one image."
                  editorRef={excerptEditorRef}
                />
                {editorUploadStatus("excerpt")}
              </div>

              <div>
                <input
                  ref={bodyFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void queueEditorFile(e.target.files, "body");
                    e.target.value = "";
                  }}
                />
                <RichTextEditor
                  label="Body"
                  value={draft.body}
                  onChange={(body) => setDraft((d) => ({ ...d, body }))}
                  maxImages={MAX_BODY_IMAGES}
                  onRequestImage={() => bodyFileRef.current?.click()}
                  uploading={uploadingImages.some(
                    (item) => item.target === "body" && !item.error,
                  )}
                  disabled={imagesBusy}
                  minHeightClass="min-h-[300px]"
                  hint={`Bold, italic, bullets, numbers, and up to ${MAX_BODY_IMAGES} images. Images insert below your current paragraph.`}
                  editorRef={bodyEditorRef}
                />
                {editorUploadStatus("body")}
              </div>

              <button
                type="submit"
                disabled={
                  saving ||
                  imagesBusy ||
                  uploadingImages.some((item) => Boolean(item.error))
                }
                className="mt-2 rounded-lg bg-accent py-4 font-title text-[11px] uppercase tracking-[2.5px] text-white hover:bg-accent-light disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : imagesBusy
                    ? "Uploading images…"
                    : mode === "edit"
                      ? "Update post"
                      : "Publish post"}
              </button>
            </div>
          </form>
        )}
      </div>

      {currentCrop || recropSrc ? (
        <ImageCropModal
          imageSrc={recropSrc || currentCrop!.src}
          onCancel={cancelCrop}
          onComplete={finishCrop}
        />
      ) : null}

      {deleteId ? (
        <AdminConfirmDialog
          open
          eyebrow="Delete post"
          title="Remove this post?"
          description={
            deleteTarget ? (
              <>
                “{deleteTarget.title}” will be permanently deleted. This cannot
                be undone.
              </>
            ) : (
              <>This post will be permanently deleted.</>
            )
          }
          confirmLabel="Delete"
          onCancel={() => setDeleteId(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      <AdminConfirmDialog
        open={pendingRemoveCover}
        eyebrow="Remove cover"
        title="Remove the cover image?"
        description="The cover will be cleared from this draft. Save the post to apply the change."
        confirmLabel="Remove"
        onCancel={() => setPendingRemoveCover(false)}
        onConfirm={confirmRemoveCover}
      />
    </div>
  );
}
