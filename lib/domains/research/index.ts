export type {
  ResearchActionContent,
  ResearchActionItem,
  ResearchArea,
  ResearchContent,
  ResearchContentInput,
  ResearchDevelopmentContent,
  ResearchScholarContent,
  ResearchScholarStat,
} from "@/lib/domains/research/types";
export {
  RESEARCH_ACTION_IMAGE_ASPECT,
  RESEARCH_IMAGE_ASPECT,
} from "@/lib/domains/research/types";
export {
  RESEARCH_FALLBACK,
  RESEARCH_IMAGE_FALLBACK_ALT,
  RESEARCH_IMAGE_FALLBACK_SRC,
  RESEARCH_SCHOLAR_FALLBACK,
} from "@/lib/domains/research/defaults";
export {
  normalizeResearchAreas,
  normalizeResearchAction,
  normalizeResearchActionItems,
  normalizeResearchContent,
  normalizeResearchDevelopment,
  normalizeResearchScholar,
  normalizeResearchScholarBullets,
  normalizeResearchScholarStats,
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
