"use client";

type ShareButtonsProps = {
  title: string;
  url: string;
};

function absoluteUrl(url: string) {
  return new URL(url, window.location.origin).href;
}

function shareLinkedIn(url: string) {
  const resolvedUrl = absoluteUrl(url);
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resolvedUrl)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function shareX(title: string, url: string) {
  const resolvedUrl = absoluteUrl(url);
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(resolvedUrl)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

function shareFacebook(url: string) {
  const resolvedUrl = absoluteUrl(url);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

async function shareNative(title: string, url: string) {
  const resolvedUrl = absoluteUrl(url);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, url: resolvedUrl, text: title });
      return;
    } catch {
      /* user cancelled */
    }
  }
  try {
    await navigator.clipboard.writeText(resolvedUrl);
    alert("Link copied to clipboard.");
  } catch {
    prompt("Copy this link:", resolvedUrl);
  }
}

const btn =
  "inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 font-title text-[9px] uppercase tracking-[2px] text-white/70 no-underline transition-colors hover:border-accent/45 hover:text-accent-light";

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <button type="button" className={btn} onClick={() => shareLinkedIn(url)}>
        LinkedIn
      </button>
      <button type="button" className={btn} onClick={() => shareX(title, url)}>
        X
      </button>
      <button type="button" className={btn} onClick={() => shareFacebook(url)}>
        Facebook
      </button>
      <button type="button" className={btn} onClick={() => shareNative(title, url)}>
        Share / Copy
      </button>
    </div>
  );
}
