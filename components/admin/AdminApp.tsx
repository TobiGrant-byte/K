"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ImageCropModal from "@/components/admin/ImageCropModal";
import {
  BLOG_CATEGORIES,
  DEMO_ADMIN,
  MAX_BLOG_IMAGES,
  createId,
  deletePost,
  fileToDataUrl,
  formatPostDate,
  getPostById,
  isAdminLoggedIn,
  loadPosts,
  loginAdmin,
  logoutAdmin,
  slugify,
  upsertPost,
  type BlogPost,
} from "@/lib/blog";

type Mode = "list" | "create" | "edit";

const inputClass =
  "w-full rounded-lg border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-[border-color] focus:border-accent/60 placeholder:text-white/30";

function emptyDraft(): Omit<BlogPost, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: string;
} {
  return {
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    category: "Reflections",
    coverImage: undefined,
    images: [],
    published: true,
  };
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [mode, setMode] = useState<Mode>("list");
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cropQueue, setCropQueue] = useState<{ src: string; asCover: boolean }[]>([]);
  const [recropSrc, setRecropSrc] = useState<string | null>(null);

  const refresh = () => setPosts(loadPosts());

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    refresh();
    setReady(true);
  }, []);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [posts],
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (loginAdmin(email, password)) {
      setAuthed(true);
    } else {
      setLoginError("Invalid email or password.");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
    setMode("list");
  };

  const flash = (text: string, error = false) => {
    setMessage(text);
    setMessageError(error);
  };

  const clearMessage = () => {
    setMessage("");
    setMessageError(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setMode("create");
    clearMessage();
  };

  const openEdit = (id: string) => {
    const post = getPostById(id);
    if (!post) return;
    setEditingId(id);
    setDraft({ ...post });
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

  const uniqueImageCount = (() => {
    const set = new Set(draft.images);
    if (draft.coverImage) set.add(draft.coverImage);
    return set.size;
  })();
  const imageCount = uniqueImageCount;
  const slotsLeft = Math.max(0, MAX_BLOG_IMAGES - imageCount - cropQueue.length);

  const onFiles = async (files: FileList | null, asCover = false) => {
    if (!files?.length) return;
    if (slotsLeft <= 0) {
      flash(`Maximum of ${MAX_BLOG_IMAGES} images (including cover). Remove one to add another.`, true);
      return;
    }

    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;

    if (list.length > slotsLeft) {
      flash(
        slotsLeft === 1
          ? `Only 1 image slot left (max ${MAX_BLOG_IMAGES} including cover). Select a single file.`
          : `Only ${slotsLeft} image slots left (max ${MAX_BLOG_IMAGES} including cover). Select at most ${slotsLeft} files.`,
        true,
      );
      return;
    }

    const queued: { src: string; asCover: boolean }[] = [];
    for (let i = 0; i < list.length; i++) {
      const src = await fileToDataUrl(list[i]);
      queued.push({ src, asCover: false });
    }
    if (asCover && queued[0]) queued[0].asCover = true;
    else if (!draft.coverImage && queued[0]) queued[0].asCover = true;

    clearMessage();
    setCropQueue((q) => [...q, ...queued]);
  };

  const currentCrop = cropQueue[0] || null;

  const finishCrop = (croppedDataUrl: string) => {
    if (recropSrc) {
      setDraft((d) => ({
        ...d,
        coverImage: d.coverImage === recropSrc ? croppedDataUrl : d.coverImage,
        images: d.images.map((img) => (img === recropSrc ? croppedDataUrl : img)),
      }));
      setRecropSrc(null);
      return;
    }

    const job = cropQueue[0];
    if (!job) return;
    setDraft((d) => {
      const existing = new Set(d.images);
      if (d.coverImage) existing.add(d.coverImage);
      if (existing.size >= MAX_BLOG_IMAGES) return d;
      return {
        ...d,
        coverImage: job.asCover || !d.coverImage ? croppedDataUrl : d.coverImage,
        images: [...d.images, croppedDataUrl],
      };
    });
    setCropQueue((q) => q.slice(1));
  };

  const cancelCrop = () => {
    if (recropSrc) {
      setRecropSrc(null);
      return;
    }
    setCropQueue((q) => q.slice(1));
  };

  const removeImage = (src: string) => {
    setDraft((d) => ({
      ...d,
      images: d.images.filter((i) => i !== src),
      coverImage: d.coverImage === src ? d.images.find((i) => i !== src) : d.coverImage,
    }));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) {
      flash("Title and body are required.", true);
      return;
    }
    setSaving(true);
    const now = new Date().toISOString();
    const slugBase = slugify(draft.slug || draft.title) || createId();
    const existing = loadPosts();
    let slug = slugBase;
    let n = 2;
    while (existing.some((p) => p.slug === slug && p.id !== editingId)) {
      slug = `${slugBase}-${n++}`;
    }

    const post: BlogPost = {
      id: editingId || createId(),
      slug,
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || draft.body.trim().slice(0, 160),
      body: draft.body.trim(),
      category: draft.category,
      coverImage: draft.coverImage,
      images: draft.images,
      published: draft.published,
      createdAt: draft.createdAt || now,
      updatedAt: now,
    };

    upsertPost(post);
    refresh();
    setSaving(false);
    flash(editingId ? "Post updated." : "Post created.");
    setMode("list");
    setEditingId(null);
    setDraft(emptyDraft());
  };

  const remove = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deletePost(deleteId);
    refresh();
    setDeleteId(null);
    flash("Post deleted.");
  };

  const deleteTarget = deleteId ? posts.find((p) => p.id === deleteId) : null;

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 text-white/50">
        Loading…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-6">
        <div className="accent-wash" />
        <form
          onSubmit={handleLogin}
          className="relative w-full max-w-md rounded-2xl border border-white/12 bg-navy-800/90 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-2 font-title text-[10px] uppercase tracking-[3px] text-accent-light">
            Admin
          </div>
          <h1 className="mb-2 font-display text-3xl font-light text-white">Sign in</h1>
          <p className="mb-8 text-[13px] leading-relaxed text-white/45">
            Temporary demo login. Firebase Auth will replace this later.
          </p>

          <label className="mb-4 block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="username"
              required
            />
          </label>
          <label className="mb-6 block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border-none bg-transparent text-white/45 transition-colors hover:text-accent-light"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" strokeLinecap="round" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" strokeLinecap="round" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
                    <path d="M1 1l22 22" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {loginError ? (
            <p className="mb-4 text-sm text-red-300" role="alert">
              {loginError}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-accent py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:bg-accent-light"
          >
            Enter dashboard
          </button>

          <div className="mt-6 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3 text-[12px] leading-relaxed text-white/55">
            <div className="mb-1 font-title text-[8px] uppercase tracking-[2px] text-accent-light">
              Demo credentials
            </div>
            <div>
              {DEMO_ADMIN.email}
              <br />
              {DEMO_ADMIN.password}
            </div>
          </div>

          <Link
            href="/"
            className="mt-6 inline-flex font-title text-[9px] uppercase tracking-[2px] text-white/35 no-underline hover:text-white/60"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="font-title text-[10px] uppercase tracking-[3px] text-accent-light">
              Blog Admin
            </div>
            <div className="font-display text-lg text-white/90">Dr. Sunday Okafor</div>
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
          <p
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              messageError
                ? "border-red-400/40 bg-red-500/10 text-red-300"
                : "border-accent/25 bg-accent/10 text-accent-light"
            }`}
            role={messageError ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}

        <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/40">
          Local preview only — posts live in this browser&apos;s storage. Firebase comes next; this
          data can be cleared anytime.
        </div>

        {mode === "list" ? (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-light">Posts</h1>
                <p className="mt-1 text-sm text-white/45">{sorted.length} total</p>
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
                    {post.coverImage || post.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverImage || post.images[0]}
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
                        <span className="text-accent-light">{post.category}</span>
                        <span className="text-white/20" aria-hidden>
                          ·
                        </span>
                        <span
                          className={
                            post.published ? "text-emerald-300/80" : "text-amber-200/70"
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
                      {post.excerpt ? (
                        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-white/45 sm:line-clamp-1">
                          {post.excerpt}
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
                <p className="font-display italic text-white/40">No posts yet — create the first one.</p>
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
                  URL slug
                </span>
                <input
                  className={inputClass}
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
                  placeholder="keeping-going-every-day"
                />
              </label>

              <div>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Category
                </span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
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
                  onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="font-title text-[9px] uppercase tracking-[2px] text-white/50">
                  Published (visible on /blog)
                </span>
              </label>

              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Short excerpt
                </span>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  value={draft.excerpt}
                  onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                  placeholder="One or two sentences for the blog cards…"
                />
              </label>

              <label>
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/40">
                  Body
                </span>
                <textarea
                  className={`${inputClass} min-h-[220px] resize-y`}
                  value={draft.body}
                  onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                  required
                  placeholder="Write the reflection… Separate paragraphs with a blank line."
                />
              </label>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-white/40">
                    Images
                  </span>
                  <span className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
                    {imageCount} / {MAX_BLOG_IMAGES}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label
                    className={`rounded-lg border border-dashed border-accent/35 bg-accent/5 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-accent-light hover:bg-accent/10 ${
                      slotsLeft <= 0 ? "pointer-events-none opacity-40" : "cursor-pointer"
                    }`}
                  >
                    {slotsLeft <= 1 ? "Upload image" : "Upload image(s)"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple={slotsLeft > 1}
                      disabled={slotsLeft <= 0}
                      className="hidden"
                      onChange={(e) => {
                        onFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <label
                    className={`rounded-lg border border-white/15 px-4 py-3 font-title text-[9px] uppercase tracking-[2px] text-white/55 hover:border-white/30 ${
                      slotsLeft <= 0
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }`}
                  >
                    Set cover from file
                    <input
                      type="file"
                      accept="image/*"
                      disabled={slotsLeft <= 0}
                      className="hidden"
                      onChange={(e) => {
                        onFiles(e.target.files, true);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {draft.images.length || draft.coverImage ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(draft.coverImage && !draft.images.includes(draft.coverImage)
                      ? [draft.coverImage, ...draft.images]
                      : draft.images
                    ).map((src) => (
                      <div key={src.slice(0, 64)} className="relative overflow-hidden rounded-lg border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="aspect-[16/10] w-full object-contain object-center bg-navy-900" />
                        <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-navy-900/80 p-1.5">
                          <button
                            type="button"
                            onClick={() => setDraft((d) => ({ ...d, coverImage: src }))}
                            className="flex-1 rounded border border-white/15 py-1 font-title text-[7px] uppercase tracking-[1px] text-white/70 hover:text-accent-light"
                          >
                            {draft.coverImage === src ? "Cover" : "Make cover"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecropSrc(src)}
                            className="rounded border border-accent/35 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-accent-light"
                          >
                            Recrop
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(src)}
                            className="rounded border border-red-400/30 px-2 py-1 font-title text-[7px] uppercase tracking-[1px] text-red-300/80"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-white/35">
                    Up to {MAX_BLOG_IMAGES} images including the cover. Every upload is cropped to a
                    fixed 16:10 frame (1200×750) so nothing gets cut off oddly on mobile or desktop.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 rounded-lg bg-accent py-4 font-title text-[11px] uppercase tracking-[2.5px] text-white hover:bg-accent-light disabled:opacity-60"
              >
                {saving ? "Saving…" : mode === "edit" ? "Update post" : "Publish post"}
              </button>
            </div>
          </form>
        )}
      </div>

      {(currentCrop || recropSrc) ? (
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
            <h2 id="delete-post-title" className="font-display text-2xl font-light text-white">
              Remove this post?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/55">
              {deleteTarget ? (
                <>
                  “{deleteTarget.title}” will be permanently removed from local storage. This cannot be
                  undone.
                </>
              ) : (
                <>This post will be permanently removed from local storage.</>
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
