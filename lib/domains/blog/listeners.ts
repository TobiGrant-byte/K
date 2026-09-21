import type { QueryClient } from "@tanstack/react-query";
import { blogKeys } from "@/lib/domains/blog/keys";
import {
  subscribeToAllCommentsForAdmin,
  subscribeToAllPosts,
  subscribeToPublishedPosts,
  type AdminBlogComment,
  type BlogPost,
} from "@/lib/domains/blog/service";

type RetainEntry = {
  count: number;
  unsub: (() => void) | null;
};

const adminPostsRetain: RetainEntry = { count: 0, unsub: null };
const publishedPostsRetain: RetainEntry = { count: 0, unsub: null };

type CommentsRetain = RetainEntry & { postKey: string };
const adminCommentsRetain: CommentsRetain = {
  count: 0,
  unsub: null,
  postKey: "",
};

/**
 * Ref-counted realtime listeners that write into TanStack Query cache.
 * Multiple UI consumers share one Firestore listener per resource.
 */
export function retainAdminPostsListener(queryClient: QueryClient): () => void {
  adminPostsRetain.count += 1;
  if (!adminPostsRetain.unsub) {
    adminPostsRetain.unsub = subscribeToAllPosts(
      (posts: BlogPost[]) => {
        queryClient.setQueryData(blogKeys.adminPosts(), posts);
      },
      (error) => {
        queryClient.setQueryData(blogKeys.adminPosts(), [] as BlogPost[]);
        console.error("[blog] admin posts listener:", error.message);
      },
    );
  }
  return () => {
    adminPostsRetain.count = Math.max(0, adminPostsRetain.count - 1);
    if (adminPostsRetain.count === 0 && adminPostsRetain.unsub) {
      adminPostsRetain.unsub();
      adminPostsRetain.unsub = null;
    }
  };
}

export function retainPublishedPostsListener(
  queryClient: QueryClient,
): () => void {
  publishedPostsRetain.count += 1;
  if (!publishedPostsRetain.unsub) {
    publishedPostsRetain.unsub = subscribeToPublishedPosts(
      (posts: BlogPost[]) => {
        queryClient.setQueryData(blogKeys.publishedPosts(), posts);
      },
      (error) => {
        queryClient.setQueryData(blogKeys.publishedPosts(), [] as BlogPost[]);
        console.error("[blog] published posts listener:", error.message);
      },
    );
  }
  return () => {
    publishedPostsRetain.count = Math.max(0, publishedPostsRetain.count - 1);
    if (publishedPostsRetain.count === 0 && publishedPostsRetain.unsub) {
      publishedPostsRetain.unsub();
      publishedPostsRetain.unsub = null;
    }
  };
}

export function retainAdminCommentsListener(
  queryClient: QueryClient,
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    published: boolean;
  }>,
): () => void {
  const postKey = posts
    .map((p) => p.id)
    .sort()
    .join("|");

  adminCommentsRetain.count += 1;

  const start = () => {
    if (adminCommentsRetain.unsub) {
      adminCommentsRetain.unsub();
      adminCommentsRetain.unsub = null;
    }
    adminCommentsRetain.postKey = postKey;
    adminCommentsRetain.unsub = subscribeToAllCommentsForAdmin(
      posts,
      (comments: AdminBlogComment[]) => {
        queryClient.setQueryData(blogKeys.adminComments(), comments);
      },
      (error) => {
        queryClient.setQueryData(
          blogKeys.adminComments(),
          [] as AdminBlogComment[],
        );
        console.error("[blog] admin comments listener:", error.message);
      },
    );
  };

  if (!adminCommentsRetain.unsub || adminCommentsRetain.postKey !== postKey) {
    start();
  }

  return () => {
    adminCommentsRetain.count = Math.max(0, adminCommentsRetain.count - 1);
    if (adminCommentsRetain.count === 0 && adminCommentsRetain.unsub) {
      adminCommentsRetain.unsub();
      adminCommentsRetain.unsub = null;
      adminCommentsRetain.postKey = "";
    }
  };
}
