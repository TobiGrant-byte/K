"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogKeys } from "@/lib/domains/blog/keys";
import { retainPublishedPostsListener } from "@/lib/domains/blog/listeners";
import {
  deletePostComment,
  removePost,
  savePost,
  type AdminBlogComment,
  type BlogPost,
} from "@/lib/domains/blog/service";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const BLOG_STALE = 60 * 60_000; // 1 hour

/**
 * Admin: all posts (published + drafts).
 * Listener is owned by AdminRealtimeBootstrap (once per admin session).
 */
export function useAdminPosts() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: blogKeys.adminPosts(),
    queryFn: async () =>
      queryClient.getQueryData<BlogPost[]>(blogKeys.adminPosts()) ?? [],
    staleTime: BLOG_STALE,
    refetchOnMount: false,
  });
}

/** Public: published posts only. Shared listener + cache. */
export function usePublishedPosts() {
  const queryClient = useQueryClient();

  useEffect(() => retainPublishedPostsListener(queryClient), [queryClient]);

  return useQuery({
    queryKey: blogKeys.publishedPosts(),
    queryFn: async () =>
      queryClient.getQueryData<BlogPost[]>(blogKeys.publishedPosts()) ?? [],
    staleTime: BLOG_STALE,
    refetchOnMount: false,
  });
}

/**
 * Admin: comments across posts.
 * Listener is owned by AdminRealtimeBootstrap (once per admin session).
 */
export function useAdminComments() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: blogKeys.adminComments(),
    queryFn: async () =>
      queryClient.getQueryData<AdminBlogComment[]>(blogKeys.adminComments()) ??
      [],
    staleTime: BLOG_STALE,
    refetchOnMount: false,
  });
}

export function useSavePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { post: BlogPost; creating: boolean }) => {
      const data = await savePost(args.post, { creating: args.creating });
      await revalidatePublicSite("blog");
      return data;
    },
    onSuccess: () => {
      // Realtime listeners will update cache; invalidate as a safety net.
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useRemovePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const data = await removePost(postId);
      await revalidatePublicSite("blog");
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { postId: string; commentId: string }) =>
      deletePostComment(args.postId, args.commentId),
    onSuccess: (_data, vars) => {
      // Optimistically drop from cache; listener confirms.
      queryClient.setQueryData<AdminBlogComment[]>(
        blogKeys.adminComments(),
        (prev) =>
          (prev ?? []).filter(
            (c) => !(c.postId === vars.postId && c.id === vars.commentId),
          ),
      );
    },
  });
}
