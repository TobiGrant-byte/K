"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  isAdminSection,
  useAdminUiStore,
  type AdminSection,
} from "@/lib/admin/ui-store";

/**
 * Keep the current CMS section in `/admin?section=…` (and optional `comments=`).
 * Same single admin route — refresh / share restores where you were.
 */
export default function AdminUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = useAdminUiStore((s) => s.section);
  const commentsPostId = useAdminUiStore((s) => s.commentsPostId);
  const hydrateFromUrl = useAdminUiStore((s) => s.hydrateFromUrl);
  const consumeSkipNextUrlSync = useAdminUiStore(
    (s) => s.consumeSkipNextUrlSync,
  );

  // URL → store (refresh, back/forward, shared link)
  useEffect(() => {
    const raw = searchParams.get("section");
    const nextSection: AdminSection =
      raw && isAdminSection(raw) ? raw : "overview";
    const nextComments = searchParams.get("comments");
    const comments =
      nextSection === "blog-posts" && nextComments?.trim()
        ? nextComments.trim()
        : null;

    const current = useAdminUiStore.getState();
    if (
      current.section === nextSection &&
      current.commentsPostId === comments
    ) {
      return;
    }
    hydrateFromUrl(nextSection, comments);
  }, [searchParams, hydrateFromUrl]);

  // Store → URL
  useEffect(() => {
    if (consumeSkipNextUrlSync()) return;

    const params = new URLSearchParams();
    if (section !== "overview") params.set("section", section);
    if (section === "blog-posts" && commentsPostId) {
      params.set("comments", commentsPostId);
    }
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (next === current) return;
    router.replace(next, { scroll: false });
  }, [
    section,
    commentsPostId,
    pathname,
    router,
    searchParams,
    consumeSkipNextUrlSync,
  ]);

  return null;
}
