"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPostDate } from "@/lib/blog";
import { adminToast } from "@/lib/admin/toast-store";
import {
  useAdminComments,
  useDeleteCommentMutation,
  type AdminBlogComment,
} from "@/lib/domains/blog";

type Props = {
  filterPostId?: string;
  postTitle?: string;
  onBack?: () => void;
};

export default function AdminComments({
  filterPostId,
  postTitle,
  onBack,
}: Props) {
  const commentsQuery = useAdminComments();
  const deleteMutation = useDeleteCommentMutation();
  const allComments = commentsQuery.data ?? [];
  const comments = useMemo(
    () =>
      filterPostId
        ? allComments.filter((c) => c.postId === filterPostId)
        : allComments,
    [allComments, filterPostId],
  );
  const loading = commentsQuery.isPending && !commentsQuery.data;
  const loadError = commentsQuery.isError ? "Could not load comments." : "";

  const [pendingDelete, setPendingDelete] = useState<AdminBlogComment | null>(
    null,
  );

  const confirmDelete = async () => {
    if (!pendingDelete || deleteMutation.isPending) return;
    const target = pendingDelete;
    try {
      await deleteMutation.mutateAsync({
        postId: target.postId,
        commentId: target.id,
      });
      setPendingDelete(null);
      adminToast.success("Comment deleted.");
    } catch (error) {
      adminToast.error(
        error instanceof Error
          ? error.message
          : "Could not delete this comment.",
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 font-title text-[9px] uppercase tracking-[2px] text-white/50 hover:text-white"
          >
            ← Back to posts
          </button>
        ) : null}
        <h2 className="font-display text-2xl font-light text-white sm:text-3xl">
          {postTitle ? `Comments · ${postTitle}` : "Comments"}
        </h2>
        <p className="mt-1 text-sm text-white/50">
          {loading
            ? "Loading…"
            : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {loadError ? (
        <p className="mb-6 text-sm text-red-400" role="alert">
          {loadError}
        </p>
      ) : null}

      {!loading && !loadError && comments.length === 0 ? (
        <p className="font-display text-lg italic text-white/40">
          No comments on this post yet.
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {comments.map((c) => {
          const displayName =
            c.anonymous || !c.authorName.trim()
              ? "Anonymous"
              : c.authorName.trim();
          return (
            <article
              key={`${c.postId}:${c.id}`}
              className="rounded-lg border border-white/10 bg-navy-800 p-4 sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-title text-[8px] uppercase tracking-[2px] text-white/50">
                    <span className="text-accent">{displayName}</span>
                    {c.anonymous ? (
                      <>
                        <span className="text-white/25" aria-hidden>
                          ·
                        </span>
                        <span>Anonymous</span>
                      </>
                    ) : null}
                    <span className="text-white/25" aria-hidden>
                      ·
                    </span>
                    <time dateTime={c.createdAt}>
                      {formatPostDate(c.createdAt)}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white/90">
                    {c.body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(c)}
                  className="shrink-0 rounded-lg border border-red-500/30 px-3 py-2 font-title text-[9px] uppercase tracking-[2px] text-red-400 hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
              {!filterPostId ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 font-title text-[8px] uppercase tracking-[2px] text-white/40">
                  <span>
                    Post:{" "}
                    <span className="text-white/70">
                      {c.postTitle || "(Untitled)"}
                    </span>
                  </span>
                  {c.postSlug ? (
                    <>
                      <span className="text-white/25" aria-hidden>
                        ·
                      </span>
                      <Link
                        href={`/blog/${c.postSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent no-underline hover:text-accent-light"
                      >
                        View post →
                      </Link>
                    </>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 px-4 backdrop-blur-sm"
          onClick={() =>
            deleteMutation.isPending ? undefined : setPendingDelete(null)
          }
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-comment-title"
            className="w-full max-w-md rounded-xl border border-white/10 bg-navy-800 p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 font-title text-[9px] uppercase tracking-[2px] text-red-400">
              Delete comment
            </div>
            <h2
              id="delete-comment-title"
              className="font-display text-2xl font-light text-white"
            >
              Delete this comment?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/50">
              This removes the comment from the public blog. This cannot be
              undone.
            </p>
            <p className="mt-3 line-clamp-4 whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-relaxed text-white/80">
              {pendingDelete.body}
            </p>
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setPendingDelete(null)}
                className="rounded-lg border border-white/12 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-white/70 hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={confirmDelete}
                className="rounded-lg border border-red-500/40 bg-red-500/15 px-5 py-3 font-title text-[10px] uppercase tracking-[2px] text-red-300 hover:bg-red-500/25 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
