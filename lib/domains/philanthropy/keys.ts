export const philanthropyKeys = {
  all: ["philanthropy"] as const,
  content: () => [...philanthropyKeys.all, "content"] as const,
};
