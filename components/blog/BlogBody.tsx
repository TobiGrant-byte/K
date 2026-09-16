"use client";

import { useState } from "react";
import RichHtml from "@/components/blog/RichHtml";

const LONG_PLAIN_CHARS = 900;

function plainLength(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

export default function BlogBody({ body }: { body: string }) {
  const long = plainLength(body) > LONG_PLAIN_CHARS;
  const [expanded, setExpanded] = useState(!long);

  return (
    <div>
      <div
        className={
          !expanded
            ? "relative max-h-[22rem] overflow-hidden sm:max-h-[26rem]"
            : undefined
        }
      >
        <RichHtml html={body} tone="light" />
        {!expanded ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-off-white via-off-white/90 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 font-title text-[10px] uppercase tracking-[2.5px] text-accent hover:text-navy-800"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}
