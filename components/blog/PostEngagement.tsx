"use client";

import { useEffect, useState } from "react";
import {
  addPostComment,
  subscribeToPostComments,
  subscribeToPostLoves,
  togglePostLove,
  type BlogComment,
} from "@/lib/firebase/engagement";
import { formatPostDate } from "@/lib/blog";
import { buildPostReplyMail, submitWeb3Form } from "@/lib/web3forms";

type Props = {
  postId: string;
  postTitle: string;
};

const fieldClass =
  "w-full rounded-lg border border-navy-800/15 bg-white px-3.5 py-2.5 font-sans text-sm text-navy-800 outline-none transition-[border-color] focus:border-accent/60 disabled:opacity-60";

export default function PostEngagement({ postId, postTitle }: Props) {
  const [loveCount, setLoveCount] = useState(0);
  const [loved, setLoved] = useState(false);
  const [loveBusy, setLoveBusy] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showMailForm, setShowMailForm] = useState(false);

  const [commentName, setCommentName] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentStatus, setCommentStatus] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [commentError, setCommentError] = useState("");

  const [mailName, setMailName] = useState("");
  const [mailEmail, setMailEmail] = useState("");
  const [mailAnonymous, setMailAnonymous] = useState(false);
  const [mailBody, setMailBody] = useState("");
  const [mailStatus, setMailStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [mailError, setMailError] = useState("");

  useEffect(() => {
    const unsubLoves = subscribeToPostLoves(postId, (count, lovedByMe) => {
      setLoveCount(count);
      setLoved(lovedByMe);
    });
    const unsubComments = subscribeToPostComments(postId, setComments);
    return () => {
      unsubLoves();
      unsubComments();
    };
  }, [postId]);

  const onLove = async () => {
    if (loveBusy) return;
    setLoveBusy(true);
    // Optimistic
    const nextLoved = !loved;
    setLoved(nextLoved);
    setLoveCount((c) => Math.max(0, c + (nextLoved ? 1 : -1)));
    try {
      await togglePostLove(postId);
    } catch {
      setLoved(!nextLoved);
      setLoveCount((c) => Math.max(0, c + (nextLoved ? -1 : 1)));
    } finally {
      setLoveBusy(false);
    }
  };

  const onCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentStatus("loading");
    setCommentError("");
    try {
      await addPostComment(postId, {
        body: commentBody,
        authorName: commentName,
        anonymous: commentAnonymous,
      });
      setCommentBody("");
      setCommentName("");
      setCommentAnonymous(false);
      setCommentStatus("idle");
      setShowCommentForm(false);
    } catch (err) {
      setCommentStatus("error");
      setCommentError(
        err instanceof Error ? err.message : "Could not post comment.",
      );
    }
  };

  const onMailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMailStatus("loading");
    setMailError("");
    try {
      const payload = buildPostReplyMail({
        postTitle,
        name: mailName,
        email: mailEmail,
        message: mailBody,
        anonymous: mailAnonymous,
      });
      await submitWeb3Form(payload);
      setMailBody("");
      setMailName("");
      setMailEmail("");
      setMailAnonymous(false);
      setMailStatus("done");
    } catch (err) {
      setMailStatus("error");
      setMailError(
        err instanceof Error ? err.message : "Could not send the message.",
      );
    }
  };

  return (
    <section className="mt-12 border-t border-navy-800/10 pt-8">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onLove}
          disabled={loveBusy}
          aria-pressed={loved}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition-colors ${
            loved
              ? "border-rose-400/50 bg-rose-50 text-rose-600"
              : "border-navy-800/15 bg-white text-navy-800 hover:border-rose-300 hover:text-rose-600"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill={loved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s-6.7-4.35-9.33-7.4C.5 10.9 1.1 7.2 3.9 5.55 6.2 4.2 8.85 5 12 7.6c3.15-2.6 5.8-3.4 8.1-2.05 2.8 1.65 3.4 5.35 1.23 7.05C18.7 16.65 12 21 12 21Z"
            />
          </svg>
          <span className="font-title text-[10px] uppercase tracking-[2px]">
            Love{loveCount > 0 ? ` · ${loveCount}` : ""}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowCommentForm((v) => !v);
            setShowMailForm(false);
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] transition-colors ${
            showCommentForm
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-navy-800/15 bg-white text-navy-800 hover:border-navy-800/30"
          }`}
        >
          Comment{comments.length > 0 ? ` · ${comments.length}` : ""}
        </button>

        <button
          type="button"
          onClick={() => {
            setShowMailForm((v) => !v);
            setShowCommentForm(false);
            setMailStatus((s) => (s === "done" ? "idle" : s));
          }}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-title text-[10px] uppercase tracking-[2px] transition-colors ${
            showMailForm
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-navy-800/15 bg-white text-navy-800 hover:border-navy-800/30"
          }`}
        >
          Email Dr. Okafor
        </button>
      </div>

      {showCommentForm ? (
        <form
          onSubmit={onCommentSubmit}
          className="mt-5 space-y-3 rounded-xl border border-navy-800/10 bg-white p-4 sm:p-5"
        >
          <div className="font-title text-[9px] uppercase tracking-[2px] text-text-muted">
            Leave a comment
          </div>
          {!commentAnonymous ? (
            <div>
              <label className="mb-1.5 block font-title text-[9px] uppercase tracking-[2px] text-text-muted">
                Name
              </label>
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                disabled={commentStatus === "loading"}
                placeholder="Your name"
                className={fieldClass}
                maxLength={80}
              />
            </div>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-800">
            <input
              type="checkbox"
              checked={commentAnonymous}
              onChange={(e) => setCommentAnonymous(e.target.checked)}
              disabled={commentStatus === "loading"}
              className="accent-accent"
            />
            Anonymous
          </label>
          <div>
            <label className="mb-1.5 block font-title text-[9px] uppercase tracking-[2px] text-text-muted">
              Comment
            </label>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              disabled={commentStatus === "loading"}
              required
              rows={4}
              maxLength={2000}
              placeholder="Write your comment…"
              className={`${fieldClass} resize-y`}
            />
          </div>
          {commentStatus === "error" ? (
            <p className="text-sm text-red-600" role="alert">
              {commentError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={commentStatus === "loading"}
            className="rounded-lg bg-navy-800 px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white disabled:opacity-60"
          >
            {commentStatus === "loading" ? "Posting…" : "Post comment"}
          </button>
        </form>
      ) : null}

      {showMailForm ? (
        <form
          onSubmit={onMailSubmit}
          className="mt-5 space-y-3 rounded-xl border border-navy-800/10 bg-white p-4 sm:p-5"
        >
          <div className="font-title text-[9px] uppercase tracking-[2px] text-text-muted">
            Message Dr. Sunday Okafor about this post
          </div>
          {mailStatus === "done" ? (
            <p className="font-display text-sm italic text-text-secondary">
              Message sent. Thank you.
            </p>
          ) : (
            <>
              {!mailAnonymous ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-title text-[9px] uppercase tracking-[2px] text-text-muted">
                      Name
                    </label>
                    <input
                      type="text"
                      value={mailName}
                      onChange={(e) => setMailName(e.target.value)}
                      disabled={mailStatus === "loading"}
                      placeholder="Your name"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-title text-[9px] uppercase tracking-[2px] text-text-muted">
                      Email
                    </label>
                    <input
                      type="email"
                      value={mailEmail}
                      onChange={(e) => setMailEmail(e.target.value)}
                      disabled={mailStatus === "loading"}
                      placeholder="your@email.com"
                      className={fieldClass}
                    />
                  </div>
                </div>
              ) : null}
              <label className="flex cursor-pointer items-center gap-2 text-sm text-navy-800">
                <input
                  type="checkbox"
                  checked={mailAnonymous}
                  onChange={(e) => setMailAnonymous(e.target.checked)}
                  disabled={mailStatus === "loading"}
                  className="accent-accent"
                />
                Anonymous
              </label>
              <div>
                <label className="mb-1.5 block font-title text-[9px] uppercase tracking-[2px] text-text-muted">
                  Message
                </label>
                <textarea
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  disabled={mailStatus === "loading"}
                  required
                  rows={5}
                  placeholder="Write your message…"
                  className={`${fieldClass} resize-y`}
                />
              </div>
              {mailStatus === "error" ? (
                <p className="text-sm text-red-600" role="alert">
                  {mailError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={mailStatus === "loading"}
                className="rounded-lg bg-accent px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white disabled:opacity-60"
              >
                {mailStatus === "loading" ? "Sending…" : "Send message"}
              </button>
            </>
          )}
        </form>
      ) : null}

      {comments.length > 0 ? (
        <div className="mt-8 space-y-5">
          <div className="font-title text-[9px] uppercase tracking-[2px] text-text-muted">
            Comments
          </div>
          <ul className="space-y-5">
            {comments.map((c) => (
              <li
                key={c.id}
                className="border-b border-navy-800/8 pb-5 last:border-0 last:pb-0"
              >
                <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="font-display text-[15px] font-medium text-navy-800">
                    {c.anonymous || !c.authorName ? "Anonymous" : c.authorName}
                  </span>
                  <time
                    dateTime={c.createdAt}
                    className="font-display text-[13px] text-text-muted"
                  >
                    {formatPostDate(c.createdAt)}
                  </time>
                </div>
                <p className="whitespace-pre-wrap font-display text-[15px] leading-[1.65] text-text-secondary">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
