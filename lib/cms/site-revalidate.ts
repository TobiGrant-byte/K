/**
 * Public routes to refresh after CMS writes.
 * Keep scopes coarse so one admin save clears every page that might show that content.
 */
export type SiteRevalidateScope =
  | "profile"
  | "research"
  | "publications"
  | "philanthropy"
  | "achievements"
  | "gallery"
  | "blog"
  | "all";

export type RevalidateTarget = {
  path: string;
  type?: "page" | "layout";
};

const PATHS_BY_SCOPE: Record<SiteRevalidateScope, RevalidateTarget[]> = {
  profile: [{ path: "/" }, { path: "/about" }],
  research: [{ path: "/research" }],
  publications: [{ path: "/publications" }],
  philanthropy: [{ path: "/philanthropy" }],
  achievements: [{ path: "/achievements" }],
  gallery: [
    { path: "/gallery" },
    { path: "/" },
    { path: "/about" },
    { path: "/research" },
    { path: "/publications" },
    { path: "/philanthropy" },
    { path: "/achievements" },
  ],
  blog: [{ path: "/blog" }, { path: "/blog/[slug]", type: "page" }],
  all: [
    { path: "/" },
    { path: "/about" },
    { path: "/research" },
    { path: "/publications" },
    { path: "/philanthropy" },
    { path: "/achievements" },
    { path: "/gallery" },
    { path: "/blog" },
    { path: "/blog/[slug]", type: "page" },
  ],
};

export function targetsForRevalidateScope(
  scope: SiteRevalidateScope,
): RevalidateTarget[] {
  return PATHS_BY_SCOPE[scope];
}
