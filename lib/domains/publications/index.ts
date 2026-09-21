export type {
  PublicationPressItem,
  PublicationTipItem,
  PublicationsContent,
  PublicationsContentInput,
  PublicationsTipsContent,
} from "@/lib/domains/publications/types";
export { PUBLICATIONS_IMAGE_ASPECT } from "@/lib/domains/publications/types";
export { PUBLICATIONS_FALLBACK } from "@/lib/domains/publications/defaults";
export {
  normalizePublicationPressItems,
  normalizePublicationTipItems,
  normalizePublicationsContent,
  normalizePublicationsTips,
  tipDisplayNumber,
  toPublicationsWritePayload,
} from "@/lib/domains/publications/normalize";
export { publicationsKeys } from "@/lib/domains/publications/keys";
export {
  ensurePublicationsContentSeeded,
  fetchPublicationsContent,
  savePublicationsContent,
  PUBLICATIONS_DOC_PATH,
} from "@/lib/firebase/publications";
export {
  usePublicationsContent,
  useSavePublicationsMutation,
} from "@/lib/domains/publications/hooks";
