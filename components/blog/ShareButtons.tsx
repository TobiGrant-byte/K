"use client";

import { useEffect, useState } from "react";
import { withShareCacheBust } from "@/lib/blog";

type ShareButtonsProps = {
  title: string;
  url: string;
  text?: string;
  /** ISO date — changes the shared URL so WhatsApp/Facebook re-fetch the card */
  version?: string;
  /** Match light blog surfaces or dark site sections */
  tone?: "dark" | "light";
};

/** Always share the live site URL, with ?v= so stale previews refresh. */
function sharePageUrl(pathOrUrl: string, version?: string) {
  return withShareCacheBust(pathOrUrl, version || "1");
}

function shareLinkedIn(url: string) {
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function shareX(title: string, url: string) {
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function shareFacebook(url: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export default function ShareButtons({
  title,
  url,
  text,
  version,
  tone = "dark",
}: ShareButtonsProps) {
  const resolved = sharePageUrl(url, version);
  const [toast, setToast] = useState<{
    message: string;
    link?: string;
  } | null>(null);

  const btn =
    tone === "light"
      ? "inline-flex items-center gap-2 rounded-lg border border-navy-800/15 bg-white px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-navy-800 no-underline transition-colors hover:border-accent/45 hover:text-accent"
      : "inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/70 no-underline transition-colors hover:border-accent/45 hover:text-accent-light";

  useEffect(() => {
    if (!toast || toast.link) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const copyLink = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: resolved,
          text: text || title,
        });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }

    try {
      await navigator.clipboard.writeText(resolved);
    } catch {
      setToast({
        message: "Copy this link to share:",
        link: resolved,
      });
      return;
    }
    setToast({ message: "Link copied to clipboard." });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          className={btn}
          onClick={() => shareLinkedIn(resolved)}
        >
          LinkedIn
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => shareX(title, resolved)}
        >
          X
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => shareFacebook(resolved)}
        >
          Facebook
        </button>
        <button type="button" className={btn} onClick={copyLink}>
          Share / Copy
        </button>
      </div>

      {toast ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/80 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setToast(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-toast-title"
            className="w-full max-w-md rounded-2xl border border-white/12 bg-navy-800 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              id="share-toast-title"
              className="font-title text-[10px] uppercase tracking-[2px] text-accent-light"
            >
              {toast.link ? "Copy link" : "Copied"}
            </p>
            <p className="mt-2 font-display text-lg text-white">
              {toast.message}
            </p>
            {toast.link ? (
              <input
                readOnly
                value={toast.link}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-4 w-full rounded-lg border border-white/12 bg-white/5 px-3 py-2.5 font-sans text-sm text-white/80 outline-none focus:border-accent/50"
              />
            ) : null}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setToast(null)}
                className="rounded-lg bg-accent px-5 py-2.5 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
