"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { retainPublishedPostsListener } from "@/lib/domains/blog/listeners";
import { retainPublicGalleryListener } from "@/lib/domains/media/listeners";

/**
 * Public gallery / blog listeners: closed until the visitor opens /gallery
 * or /blog. Once opened, stay open for the rest of the tab session.
 * Runs for everyone (including signed-in admin) — public UI reads these
 * cache keys, which are separate from the admin CMS listeners.
 */
export default function PublicRealtimeBootstrap() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [galleryLive, setGalleryLive] = useState(false);
  const [postsLive, setPostsLive] = useState(false);

  if (pathname?.startsWith("/gallery") && !galleryLive) {
    setGalleryLive(true);
  }
  if (pathname?.startsWith("/blog") && !postsLive) {
    setPostsLive(true);
  }

  useEffect(() => {
    if (!galleryLive) return;
    return retainPublicGalleryListener(queryClient);
  }, [galleryLive, queryClient]);

  useEffect(() => {
    if (!postsLive) return;
    return retainPublishedPostsListener(queryClient);
  }, [postsLive, queryClient]);

  return null;
}
