"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { retainPublishedPostsListener } from "@/lib/domains/blog/listeners";
import { retainPublicGalleryListener } from "@/lib/domains/media/listeners";
import { subscribeToAdminAuth } from "@/lib/firebase/auth";

/**
 * Public gallery / blog listeners: closed until the visitor actually opens
 * /gallery or /blog. Once opened, stay open for the rest of the tab session
 * (soft navigations do not reconnect). Admin sessions skip these — admin
 * bootstrap owns realtime.
 */
export default function PublicRealtimeBootstrap() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [galleryLive, setGalleryLive] = useState(false);
  const [postsLive, setPostsLive] = useState(false);

  if (pathname?.startsWith("/gallery") && !galleryLive) {
    setGalleryLive(true);
  }
  if (pathname?.startsWith("/blog") && !postsLive) {
    setPostsLive(true);
  }

  useEffect(() => {
    return subscribeToAdminAuth((state) => {
      setIsAdmin(state.status === "admin");
    });
  }, []);

  useEffect(() => {
    if (isAdmin || !galleryLive) return;
    return retainPublicGalleryListener(queryClient);
  }, [isAdmin, galleryLive, queryClient]);

  useEffect(() => {
    if (isAdmin || !postsLive) return;
    return retainPublishedPostsListener(queryClient);
  }, [isAdmin, postsLive, queryClient]);

  return null;
}
