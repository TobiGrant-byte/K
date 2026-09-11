"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  applySearchHighlights,
  clearSearchHighlights,
} from "@/lib/search-highlight";

const FADE_MS = 7000;

function SearchHighlightInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const q = (searchParams.get("q") || "").trim();

  const [marks, setMarks] = useState<HTMLElement[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const fadeTimer = useRef<number | undefined>(undefined);
  const clearTimer = useRef<number | undefined>(undefined);
  const marksRef = useRef<HTMLElement[]>([]);

  const clearUrlQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("q")) return;
    params.delete("q");
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const dismiss = useCallback(() => {
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(clearTimer.current);
    clearSearchHighlights();
    marksRef.current = [];
    setMarks([]);
    setVisible(false);
    clearUrlQuery();
  }, [clearUrlQuery]);

  const focusMark = useCallback((list: HTMLElement[], i: number) => {
    list.forEach((m, mi) => {
      if (mi === i) m.dataset.active = "true";
      else delete m.dataset.active;
    });
    const el = list[i];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const scheduleFade = useCallback(() => {
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(clearTimer.current);
    marksRef.current.forEach((m) => m.classList.remove("search-hit-fade"));

    fadeTimer.current = window.setTimeout(() => {
      marksRef.current.forEach((m) => m.classList.add("search-hit-fade"));
      clearTimer.current = window.setTimeout(() => {
        clearSearchHighlights();
        marksRef.current = [];
        setMarks([]);
        setVisible(false);
        clearUrlQuery();
      }, 900);
    }, FADE_MS);
  }, [clearUrlQuery]);

  useEffect(() => {
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(clearTimer.current);

    if (!q) {
      clearSearchHighlights();
      marksRef.current = [];
      setMarks([]);
      setVisible(false);
      return;
    }

    let cancelled = false;
    const startTimer = window.setTimeout(() => {
      if (cancelled) return;
      const root =
        document.querySelector("main") ||
        document.querySelector("[data-search-root]") ||
        document.body;

      const found = applySearchHighlights(root, q);
      if (cancelled) return;

      marksRef.current = found;
      setMarks(found);
      setIndex(0);
      setVisible(found.length > 0);

      if (found.length > 0) {
        requestAnimationFrame(() => focusMark(found, 0));
        scheduleFade();
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [q, pathname, focusMark, scheduleFade]);

  useEffect(() => {
    return () => {
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(clearTimer.current);
      clearSearchHighlights();
    };
  }, []);

  const go = (dir: -1 | 1) => {
    if (marks.length === 0) return;
    const next = (index + dir + marks.length) % marks.length;
    setIndex(next);
    focusMark(marks, next);
    scheduleFade();
  };

  return (
    <AnimatePresence>
      {visible && marks.length > 0 ? (
        <motion.div
          key="search-nav"
          data-search-ui
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full border border-accent/35 bg-navy-900/95 px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous match"
            disabled={marks.length < 2}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white/80 transition-colors hover:border-accent/50 hover:text-accent-light disabled:opacity-30"
          >
            ↑
          </button>
          <div className="min-w-[7.5rem] px-2 text-center">
            <div className="font-title text-[9px] uppercase tracking-[2px] text-accent-light">
              {index + 1} of {marks.length}
            </div>
            <div className="max-w-[10rem] truncate font-display text-sm text-white/70">
              “{q}”
            </div>
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next match"
            disabled={marks.length < 2}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-transparent text-white/80 transition-colors hover:border-accent/50 hover:text-accent-light disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Clear highlights"
            className="ml-1 rounded-full border border-white/10 px-3 py-1.5 font-title text-[9px] tracking-[1.5px] text-white/45 transition-colors hover:border-white/25 hover:text-white"
          >
            Clear
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function SearchHighlight() {
  return (
    <Suspense fallback={null}>
      <SearchHighlightInner />
    </Suspense>
  );
}
