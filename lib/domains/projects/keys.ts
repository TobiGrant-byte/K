export const projectsKeys = {
  all: ["projects"] as const,
  content: () => [...projectsKeys.all, "content"] as const,
};
