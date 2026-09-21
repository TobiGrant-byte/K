export type {
  PublicationPressItem,
  PublicationsContent,
  PublicationsContentInput,
} from "@/lib/domains/publications/types";
export { PUBLICATIONS_IMAGE_ASPECT } from "@/lib/domains/publications/types";
export { PUBLICATIONS_FALLBACK } from "@/lib/domains/publications/defaults";
export {
  normalizePublicationPressItems,
  normalizePublicationsContent,
  toPublicationsWritePayload,
} from "@/lib/domains/publications/normalize";
export { publicationsKeys } from "@/lib/domains/publications/keys";
export {
  PUBLICATIONS_DOC_PATH,
  ensurePublicationsContentSeeded,
  fetchPublicationsContent,
  savePublicationsContent,
} from "@/lib/firebase/publications";
export {
  usePublicationsContent,
  useSavePublicationsMutation,
} from "@/lib/domains/publications/hooks";
