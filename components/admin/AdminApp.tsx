"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ImageCropModal from "@/components/admin/ImageCropModal";
import RichTextEditor, {
  insertImageIntoEditor,
} from "@/components/admin/RichTextEditor";
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
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeToAdminAuth,
  type AdminAuthState,
} from "@/lib/firebase/auth";
import {
  assertUniqueSlug,
  removePost,
  savePost,
  subscribeToAllPosts,
} from "@/lib/firebase/posts";
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
  "w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-[border-color] focus:border-accent/60 placeholder:text-white/30";

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

export default function AdminApp() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    status: "loading",
    user: null,
    isAdmin: false,
  });
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [messageId, setMessageId] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    setMessage(text);
    setMessageError(error);
    setMessageId((n) => n + 1);
  }, []);

  const clearMessage = () => {
    setMessage("");
    setMessageError(false);
  };

  useEffect(() => {
    return subscribeToAdminAuth(setAuthState);
  }, []);

  // Auto-dismiss unauthorized / auth error alerts after a few seconds.
  useEffect(() => {
    if (authState.status !== "unauthorized" && authState.status !== "error") {
      return;
    }
    const t = window.setTimeout(() => {
      setLoginError("");
      setAuthState({ status: "signed-out", user: null, isAdmin: false });
    }, 8000);
    return () => window.clearTimeout(t);
  }, [authState]);

  const authAlert =
    loginError ||
    (authState.status === "unauthorized"
      ? "This Google account is not authorized to view this page. Please contact Dr. Sunday Okafor for access."
      : "") ||
    (authState.status === "error" ? authState.message : "");
  useEffect(() => {
    if (authState.status !== "admin") return;
    return subscribeToAllPosts(setPosts, (error) =>
      flash(
        `Could not load posts (Firestore posts query): ${error.message}`,
        true,
      ),
    );
  }, [authState.status, flash]);

  /** Flash banners auto-clear after a few hours; X dismisses sooner. */
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(
      () => {
        setMessage("");
        setMessageError(false);
      },
      3 * 60 * 60 * 1000,
    );
    return () => window.clearTimeout(t);
  }, [message, messageId]);

  const sorted = useMemo(
    () =>
      [...posts].sort(
        (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
      ),
    [posts],
  );

  const handleLogin = async () => {
    setLoginError("");
    setSigningIn(true);
    try {
      // Popup only — admin getDoc runs in subscribeToAdminAuth after Auth state
      // is restored and the ID token is ready.
      await signInAdminWithGoogle();
    } catch (error) {
      const details = error as Error & { code?: string };
      if (
        details.code !== "auth/popup-closed-by-user" &&
        details.code !== "auth/cancelled-popup-request"
      ) {
        setLoginError(details.message || "Google sign-in failed.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setMode("list");
  };

  const openCreate = () => {
    setEditingId(null);
    setWorkingPostId(createId());
    setDraft(emptyDraft());
    setUploadingImages([]);
    setCropQueue([]);
    setRecropSrc(null);
    setMode("create");
    clearMessage();
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
    clearMessage();
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
    clearMessage();
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
    clearMessage();
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
              ? "border-red-400/30 bg-red-500/10 text-red-300"
              : "border-accent/25 bg-accent/10 text-accent-light"
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
                className="font-title text-[8px] uppercase tracking-[1.5px] text-accent-light"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => removeUploadingImage(item.id)}
                className="font-title text-[8px] uppercase tracking-[1.5px] text-red-200"
              >
                Remove
              </button>
            </span>
          ) : null}
        </div>
      ));

  const removeCover = () => {
    const src = draft.coverImage;
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

  if (authState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 pt-[72px] text-white/50">
        Loading…
      </div>
    );
  }

  if (authState.status !== "admin") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-6 pt-[72px]">
        <div className="accent-wash" />
        <div className="relative w-full max-w-md rounded-2xl border border-white/12 bg-navy-800/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-2 font-title text-[10px] uppercase tracking-[3px] text-accent-light">
            Admin
          </div>
          <h1 className="mb-2 font-display text-3xl font-light text-white">
            Sign in
          </h1>
          <p className="mb-8 text-[13px] leading-relaxed text-white/45">
            Continue with an authorized Google account.
          </p>

          {authAlert ? (
            <p className="mb-4 text-sm text-red-300" role="alert">
              {authAlert}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full rounded-lg bg-accent py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:bg-accent-light disabled:opacity-60"
          >
            {signingIn ? "Signing in…" : "Continue with Google"}
          </button>

          <Link
            href="/"
            className="mt-6 inline-flex font-title text-[9px] uppercase tracking-[2px] text-white/35 no-underline hover:text-white/60"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-[72px] text-white">
      <header
        data-admin-header
        className="sticky top-[72px] z-40 border-b border-white/10 bg-navy-900/95 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="font-title text-[10px] uppercase tracking-[3px] text-accent-light">
              Blog Admin
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              className="rounded-lg border border-white/15 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60 no-underline hover:border-accent/40 hover:text-accent-light"
            >
              View blog
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/15 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-white/60 hover:border-white/30 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {message ? (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
              messageError
                ? "border-red-400/40 bg-red-500/10 text-red-300"
                : "border-accent/25 bg-accent/10 text-accent-light"
            }`}
            role={messageError ? "alert" : "status"}
          >
            <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={clearMessage}
              aria-label="Dismiss message"
              className={`-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm transition-colors ${
                messageError
                  ? "border-red-400/30 text-red-200/80 hover:bg-red-500/15 hover:text-red-100"
                  : "border-accent/30 text-accent-light/80 hover:bg-accent/15 hover:text-accent-light"
              }`}
            >
              ✕
            </button>
          </div>
        ) : null}

        {/* <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/40">
          Local preview only — posts live in this browser&apos;s storage. Firebase comes next; this
          data can be cleared anytime.
        </div> */}

        {mode === "list" ? (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-light">Posts</h1>
                <p className="mt-1 text-sm text-white/45">
                  {sorted.length} total
                </p>
              </div>
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
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] sm:flex sm:items-stretch sm:gap-0 sm:p-0"
                >
                  <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-navy-800 sm:aspect-auto sm:h-auto sm:w-40 sm:self-stretch sm:rounded-none">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage}
                        alt=""
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full min-h-[7.5rem] items-center justify-center sm:min-h-full">
                        <span className="font-title text-[8px] uppercase tracking-[2px] text-white/25">
                          No image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-title text-[8px] uppercase tracking-[2px] text-white/40">
                        <span className="text-accent-light">
                          {post.category}
                        </span>
                        <span className="text-white/20" aria-hidden>
                          ·
                        </span>
                        <span
                          className={
                            post.published
                              ? "text-emerald-300/80"
                              : "text-amber-200/70"
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-white/20" aria-hidden>
                          ·
                        </span>
                        <span>{formatPostDate(post.updatedAt)}</span>
                      </div>
                      <h2 className="font-display text-[22px] leading-snug text-white sm:truncate sm:text-xl">
                        {post.title}
                      </h2>
                      <p className="mt-1 text-[12px] text-white/35">
                        By {post.author || DEFAULT_BLOG_AUTHOR}
                      </p>
                      {post.excerpt ? (
                        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45 sm:line-clamp-1">
                          {htmlToPlainText(post.excerpt)}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0 sm:grid-cols-none">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="rounded-lg border border-white/15 px-3 py-2.5 text-center font-title text-[8px] uppercase tracking-[1.5px] text-white/60 no-underline hover:text-white sm:py-2"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEdit(post.id)}
                        className="rounded-lg border border-accent/35 px-3 py-2.5 font-title text-[8px] uppercase tracking-[1.5px] text-accent-light hover:bg-accent/10 sm:py-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(post.id)}
                        className="rounded-lg border border-red-400/30 px-3 py-2.5 font-title text-[8px] uppercase tracking-[1.5px] text-red-300/80 hover:bg-red-500/10 sm:py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {sorted.length === 0 ? (
                <p className="font-display italic text-white/40">
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
                  clearMessage();
                }}
                className="font-title text-[9px] uppercase tracking-[2px] text-white/45 hover:text-white"
              >
                ← Back to list
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
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
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
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
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
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
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
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
                            ? "border-accent/50 bg-accent/15 text-accent-light"
                            : "border-white/12 bg-transparent text-white/50 hover:border-white/25 hover:text-white/80"
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
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                    Cover photo
                  </span>
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                    Required
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label
                    className={`rounded-lg border border-dashed border-accent/35 bg-accent/5 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-accent-light hover:bg-accent/10 ${
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
                            className="aspect-[16/10] w-full bg-navy-900 object-contain object-center opacity-40"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-900/70 px-3 text-center">
                            {item.error ? (
                              <>
                                <p className="text-[11px] leading-snug text-red-300">
                                  Upload failed
                                </p>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => retryUpload(item)}
                                    className="rounded border border-accent/35 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-accent-light"
                                  >
                                    Retry
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeUploadingImage(item.id)
                                    }
                                    className="rounded border border-red-400/30 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-red-300/80"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </>
                            ) : (
                              <p className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
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
                          className="aspect-[16/10] w-full bg-navy-900 object-contain object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-navy-900/80 p-1.5">
                          <button
                            type="button"
                            onClick={() => setRecropSrc(draft.coverImage!)}
                            disabled={imagesBusy}
                            className="rounded border border-accent/35 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-accent-light disabled:opacity-40"
                          >
                            Recrop
                          </button>
                          <button
                            type="button"
                            onClick={removeCover}
                            disabled={imagesBusy}
                            className="rounded border border-red-400/30 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-red-300/80 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-white/35">
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
                  hint="Preview for blog cards. Bold, italic, and at most one image. Drag to reorder; backspace onto an image to remove it; click an image then drag the blue handle to resize."
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
                  hint={`Bold, italic, and up to ${MAX_BODY_IMAGES} images. Images insert below your current paragraph. Drag images to move them; backspace onto one to delete; click then use the blue handle to resize.`}
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 px-4 backdrop-blur-sm"
          onClick={() => setDeleteId(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
            className="w-full max-w-md rounded-2xl border border-white/12 bg-navy-800 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-red-300/80">
              Delete post
            </div>
            <h2
              id="delete-post-title"
              className="font-display text-2xl font-light text-white"
            >
              Remove this post?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/55">
              {deleteTarget ? (
                <>
                  “{deleteTarget.title}” will be permanently deleted. This
                  cannot be undone.
                </>
              ) : (
                <>This post will be permanently deleted.</>
              )}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-white/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/30 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg border border-red-400/40 bg-red-500/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-red-200 hover:bg-red-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
