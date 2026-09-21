"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogKeys } from "@/lib/domains/blog/keys";
import {
  retainAdminCommentsListener,
  retainAdminPostsListener,
  retainPublishedPostsListener,
} from "@/lib/domains/blog/listeners";
import {
  deletePostComment,
  removePost,
  savePost,
  type AdminBlogComment,
  type BlogPost,
} from "@/lib/domains/blog/service";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const BLOG_STALE = 5 * 60_000;

/** Admin: all posts (published + drafts). One shared Firestore listener. */
export function useAdminPosts() {
  const queryClient = useQueryClient();

  useEffect(() => retainAdminPostsListener(queryClient), [queryClient]);

  return useQuery({
    queryKey: blogKeys.adminPosts(),
    queryFn: async () =>
      queryClient.getQueryData<BlogPost[]>(blogKeys.adminPosts()) ?? [],
    staleTime: BLOG_STALE,
    // Realtime listener keeps cache fresh; don't refetch on mount/focus.
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

/** Admin: comments across posts. Depends on admin posts cache for titles. */
export function useAdminComments() {
  const queryClient = useQueryClient();
  const postsQuery = useAdminPosts();

  const postMetas = useMemo(
    () =>
      (postsQuery.data ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        published: p.published,
      })),
    [postsQuery.data],
  );

  const postKey = useMemo(
    () =>
      postMetas
        .map((p) => p.id)
        .sort()
        .join("|"),
    [postMetas],
  );

  useEffect(() => {
    return retainAdminCommentsListener(queryClient, postMetas);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- postKey drives resubscribe
  }, [queryClient, postKey]);

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
    mutationFn: (args: { post: BlogPost; creating: boolean }) =>
      savePost(args.post, { creating: args.creating }),
    onSuccess: () => {
      // Realtime listeners will update cache; invalidate as a safety net.
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
      void revalidatePublicSite("blog");
    },
  });
}

export function useRemovePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => removePost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
      void revalidatePublicSite("blog");
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
