export const achievementsKeys = {
  all: ["achievements"] as const,
  content: () => [...achievementsKeys.all, "content"] as const,
};
