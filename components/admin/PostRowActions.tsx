"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

type Props = {
  slug: string;
  onEdit: () => void;
  onComments: () => void;
  onDelete: () => void;
};

export default function PostRowActions({
  slug,
  onEdit,
  onComments,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "block w-full px-3 py-2.5 text-left font-title text-[9px] uppercase tracking-[1.5px] transition-colors hover:bg-white/5";

  return (
    <div
      ref={rootRef}
      className={`relative -mr-1 -mt-0.5 shrink-0 ${open ? "z-50" : "z-20"}`}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Post actions"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center text-white/50 transition-colors hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 min-w-40 overflow-hidden rounded-lg border border-white/10 bg-navy-800 py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        >
          <Link
            href={`/blog/${slug}`}
            role="menuitem"
            className={`${itemClass} text-white/80 no-underline`}
            onClick={() => setOpen(false)}
          >
            View
          </Link>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-white`}
            onClick={() => {
              setOpen(false);
              onComments();
            }}
          >
            Comments
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-accent`}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} text-red-400`}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
