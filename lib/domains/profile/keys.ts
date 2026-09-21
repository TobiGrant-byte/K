/** TanStack Query keys for the shared Profile / About domain. */
export const profileKeys = {
  all: ["profile"] as const,
  content: () => [...profileKeys.all, "content"] as const,
};
