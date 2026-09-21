export const publicationsKeys = {
  all: ["publications"] as const,
  content: () => [...publicationsKeys.all, "content"] as const,
};
