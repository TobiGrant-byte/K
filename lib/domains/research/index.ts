export type {
  ResearchActionContent,
  ResearchActionItem,
  ResearchArea,
  ResearchContent,
  ResearchContentInput,
  ResearchDevelopmentContent,
} from "@/lib/domains/research/types";
export {
  RESEARCH_ACTION_IMAGE_ASPECT,
  RESEARCH_IMAGE_ASPECT,
} from "@/lib/domains/research/types";
export {
  RESEARCH_FALLBACK,
  RESEARCH_IMAGE_FALLBACK_ALT,
  RESEARCH_IMAGE_FALLBACK_SRC,
} from "@/lib/domains/research/defaults";
export {
  normalizeResearchAreas,
  normalizeResearchAction,
  normalizeResearchActionItems,
  normalizeResearchContent,
  normalizeResearchDevelopment,
  researchAreaNumber,
  RESEARCH_PUBLIC_EMPTY,
  researchSeedPayload,
  toResearchWritePayload,
} from "@/lib/domains/research/normalize";
export { researchKeys } from "@/lib/domains/research/keys";
export {
  RESEARCH_DOC_PATH,
  ensureResearchContentSeeded,
  fetchResearchContent,
  saveResearchContent,
} from "@/lib/firebase/research";
export {
  useResearchContent,
  useSaveResearchMutation,
} from "@/lib/domains/research/hooks";
