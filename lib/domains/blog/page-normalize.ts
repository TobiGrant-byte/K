import type {
  BlogPageContent,
  BlogPageContentInput,
} from "@/lib/domains/blog/page-types";

const DEFAULT_SUBTITLE =
  "Notes on family, career, and the world beyond the résumé — in Dr. Okafor's own words.";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function normalizeBlogPageContent(
  raw: Record<string, unknown> | BlogPageContent | BlogPageContentInput,
  updatedAt = "",
): BlogPageContent {
  return {
    subtitle: asString((raw as { subtitle?: unknown }).subtitle).trim(),
    updatedAt,
  };
}

export function toBlogPageWritePayload(
  input: BlogPageContentInput,
): BlogPageContentInput {
  return {
    subtitle: input.subtitle.trim(),
  };
}

/** Public empty — no invented copy when the doc is missing. */
export const BLOG_PAGE_PUBLIC_EMPTY: BlogPageContent = {
  subtitle: "",
  updatedAt: "",
};

/** Admin seed — restores the original public subtitle once. */
export function blogPageSeedPayload(): BlogPageContentInput {
  return { subtitle: DEFAULT_SUBTITLE };
}
