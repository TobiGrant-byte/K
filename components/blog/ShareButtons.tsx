"use client";

import { withShareCacheBust } from "@/lib/blog";

type ShareButtonsProps = {
  title: string;
  url: string;
  text?: string;
  /** ISO date — changes the shared URL so WhatsApp/Facebook re-fetch the card */
  version?: string;
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

async function shareNative(title: string, url: string, text?: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        url,
        text: text || title,
      });
      return;
    } catch {
      /* user cancelled */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard.");
  } catch {
    prompt("Copy this link:", url);
  }
}

const btn =
  "inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/70 no-underline transition-colors hover:border-accent/45 hover:text-accent-light";

export default function ShareButtons({
  title,
  url,
  text,
  version,
}: ShareButtonsProps) {
  const resolved = sharePageUrl(url, version);

  return (
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
      <button
        type="button"
        className={btn}
        onClick={() => shareNative(title, resolved, text)}
      >
        Share / Copy
      </button>
    </div>
  );
}
