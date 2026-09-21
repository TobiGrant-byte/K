/** TanStack Query keys for Research & Development CMS. */
export const researchKeys = {
  all: ["research"] as const,
  content: () => [...researchKeys.all, "content"] as const,
};
