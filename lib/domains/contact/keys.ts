export const contactKeys = {
  all: ["contact"] as const,
  content: () => [...contactKeys.all, "content"] as const,
};
