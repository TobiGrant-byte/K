"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { blogKeys } from "@/lib/domains/blog/keys";
import {
  retainAdminCommentsListener,
  retainAdminPostsListener,
} from "@/lib/domains/blog/listeners";
import type { BlogPost } from "@/lib/domains/blog/service";
import { retainAdminMediaListener } from "@/lib/domains/media/listeners";
import { subscribeToAdminAuth } from "@/lib/firebase/auth";

type PostMeta = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

function postsToMetas(posts: BlogPost[]): PostMeta[] {
  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    published: p.published,
  }));
}

function postKeyOf(metas: PostMeta[]): string {
  return metas
    .map((p) => p.id)
    .sort()
    .join("|");
}

/**
 * Opens all admin Firestore listeners once while the signed-in admin
 * stays on the site (any page). Closes on logout / session end.
 * Section switches do not reconnect.
 */
export default function AdminRealtimeBootstrap() {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return subscribeToAdminAuth((state) => {
      setIsAdmin(state.status === "admin");
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const releaseMedia = retainAdminMediaListener(queryClient);
    const releasePosts = retainAdminPostsListener(queryClient);

    let releaseComments: (() => void) | null = null;
    let lastPostKey = "";

    const attachComments = () => {
      const posts =
        queryClient.getQueryData<BlogPost[]>(blogKeys.adminPosts()) ?? [];
      const metas = postsToMetas(posts);
      const key = postKeyOf(metas);
      if (key === lastPostKey && releaseComments) return;
      lastPostKey = key;
      releaseComments?.();
      releaseComments = retainAdminCommentsListener(queryClient, metas);
    };

    attachComments();

    const unsubCache = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type !== "updated") return;
      const qKey = event.query.queryKey;
      if (qKey[0] === "blog" && qKey[1] === "admin-posts") {
        attachComments();
      }
    });

    return () => {
      unsubCache();
      releaseComments?.();
      releaseMedia();
      releasePosts();
    };
  }, [isAdmin, queryClient]);

  return null;
}
