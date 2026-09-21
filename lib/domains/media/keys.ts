/** TanStack Query keys for the Media / Gallery domain. */
export const mediaKeys = {
  all: ["media"] as const,
  list: () => [...mediaKeys.all, "list"] as const,
  publicGallery: () => [...mediaKeys.all, "public-gallery"] as const,
  detail: (id: string) => [...mediaKeys.all, "detail", id] as const,
};
