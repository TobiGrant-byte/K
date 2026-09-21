/**
 * Blog domain service — shared read/write boundary over Firestore.
 * Admin and Public consume the same functions; Admin-only mutations live here too.
 */
export {
  DuplicateSlugError,
  assertUniqueSlug,
  getPublishedPostBySlug,
  removePost,
  savePost,
  subscribeToAllPosts,
  subscribeToPublishedPosts,
} from "@/lib/firebase/posts";

export {
  addPostComment,
  deletePostComment,
  getPostEngagementCounts,
  subscribeToAllCommentsForAdmin,
  subscribeToPostComments,
  subscribeToPostEngagementCounts,
  subscribeToPostLoves,
  togglePostLove,
  type AdminBlogComment,
  type BlogComment,
} from "@/lib/firebase/engagement";

export type { BlogPost, BlogCategory } from "@/lib/blog";
