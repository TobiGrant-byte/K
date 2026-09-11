"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { searchSite, type SearchEntry } from "@/lib/search";
import { withHighlightQuery } from "@/lib/search-highlight";

function isExternal(href: string) {
  return href.startsWith("http");
}

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const results = searchSite(query);

  const close = () => setOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const goExternal = (entry: SearchEntry) => {
    close();
    window.open(entry.href, "_blank", "noopener,noreferrer");
  };

  const resultHref = (entry: SearchEntry) =>
    withHighlightQuery(entry.href, query);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the site"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-transparent text-white/70 transition-colors hover:border-accent/50 hover:text-accent-light"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-navy-900/80 px-4 pt-[14vh] backdrop-blur-md"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              id={panelId}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-navy-800 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="shrink-0 text-white/40" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, research, achievements…"
                  className="w-full border-none bg-transparent font-display text-lg text-white outline-none placeholder:text-white/35"
                  aria-controls={`${panelId}-results`}
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="shrink-0 rounded border border-white/15 px-2.5 py-1.5 font-title text-[9px] tracking-[1.5px] text-white/55 transition-colors hover:border-white/35 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div id={`${panelId}-results`} className="max-h-[50vh] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <p className="px-5 py-8 text-center font-display text-base italic text-white/40">
                    No matches — try “research”, “phd”, or “philanthropy”.
                  </p>
                ) : (
                  results.map((entry) => {
                    const content = (
                      <>
                        <span className="font-title text-[9px] uppercase tracking-[2px] text-white/35">
                          {entry.category}
                        </span>
                        <span className="mt-1 block font-display text-xl font-medium text-white">
                          {entry.title}
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-white/45">
                          {entry.description}
                        </span>
                      </>
                    );

                    if (isExternal(entry.href)) {
                      return (
                        <button
                          key={entry.href + entry.title}
                          type="button"
                          onClick={() => goExternal(entry)}
                          className="block w-full border-none bg-transparent px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04]"
                        >
                          {content}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={entry.href + entry.title}
                        href={resultHref(entry)}
                        onClick={close}
                        className="block px-5 py-3.5 no-underline transition-colors hover:bg-white/[0.04]"
                      >
                        {content}
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/10 px-5 py-3">
                <p className="font-title text-[9px] tracking-[2px] text-white/30">
                  {results.length} {results.length === 1 ? "result" : "results"}
                  {query.trim() ? (
                    <>
                      {" "}
                      for <span className="text-white/50">“{query.trim()}”</span>
                    </>
                  ) : (
                    <> · browse pages below</>
                  )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
