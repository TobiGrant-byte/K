export type {
  ProjectCategory,
  ProjectItem,
  ProjectsContent,
  ProjectsContentInput,
} from "@/lib/domains/projects/types";
export {
  PROJECT_CATEGORIES,
  PROJECTS_IMAGE_ASPECT,
} from "@/lib/domains/projects/types";
export { PROJECTS_FALLBACK } from "@/lib/domains/projects/defaults";
export {
  normalizeProjectItems,
  normalizeProjectsContent,
  projectsSeedPayload,
  PROJECTS_PUBLIC_EMPTY,
  toProjectsWritePayload,
} from "@/lib/domains/projects/normalize";
export { projectsKeys } from "@/lib/domains/projects/keys";
export {
  ensureProjectsContentSeeded,
  fetchProjectsContent,
  saveProjectsContent,
  PROJECTS_DOC_PATH,
} from "@/lib/firebase/projects";
export {
  useProjectsContent,
  useSaveProjectsMutation,
} from "@/lib/domains/projects/hooks";
