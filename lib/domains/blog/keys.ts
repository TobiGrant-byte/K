/** TanStack Query keys for the Blog domain (Admin + Public). */
export const blogKeys = {
  all: ["blog"] as const,
  adminPosts: () => [...blogKeys.all, "admin-posts"] as const,
  publishedPosts: () => [...blogKeys.all, "published-posts"] as const,
  adminComments: () => [...blogKeys.all, "admin-comments"] as const,
};
