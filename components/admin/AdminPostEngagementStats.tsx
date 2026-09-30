"use client";

import { useEffect, useState } from "react";
import { subscribeToPostEngagementCounts } from "@/lib/firebase/engagement";

type Props = {
  postId: string;
  className?: string;
};

/**
 * Compact loves / comments for admin post rows.
 */
export default function AdminPostEngagementStats({
  postId,
  className = "",
}: Props) {
  const [loves, setLoves] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    return subscribeToPostEngagementCounts(postId, (counts) => {
      setLoves(counts.loves);
      setComments(counts.comments);
    });
  }, [postId]);

  const itemClass =
    "inline-flex h-4 items-center gap-1.5 leading-none text-white/55";

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
    >
      <span
        className={itemClass}
        title={`${loves} love${loves === 1 ? "" : "s"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="block h-3.5 w-3.5 shrink-0 text-rose-400"
          fill="currentColor"
          aria-hidden
        >
          <path d="M12 21s-6.7-4.35-9.33-7.4C.5 10.9 1.1 7.2 3.9 5.55 6.2 4.2 8.85 5 12 7.6c3.15-2.6 5.8-3.4 8.1-2.05 2.8 1.65 3.4 5.35 1.23 7.05C18.7 16.65 12 21 12 21Z" />
        </svg>
        <span className="font-title text-[10px] tabular-nums tracking-wide">
          {loves}
        </span>
        <span className="sr-only">
          {loves} love{loves === 1 ? "" : "s"}
        </span>
      </span>

      <span
        className={itemClass}
        title={`${comments} comment${comments === 1 ? "" : "s"}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="block h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 6.25A2.75 2.75 0 0 1 7.25 3.5h9.5a2.75 2.75 0 0 1 2.75 2.75v6.5a2.75 2.75 0 0 1-2.75 2.75H10.2L6 19.5v-3.5A2.75 2.75 0 0 1 4.5 13.5v-7.25Z"
          />
        </svg>
        <span className="font-title text-[10px] tabular-nums tracking-wide">
          {comments}
        </span>
        <span className="sr-only">
          {comments} comment{comments === 1 ? "" : "s"}
        </span>
      </span>
    </div>
  );
}
