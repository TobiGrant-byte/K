export type {
  PhilanthropyContent,
  PhilanthropyContentInput,
  PhilanthropyPillarItem,
} from "@/lib/domains/philanthropy/types";
export { PHILANTHROPY_IMAGE_ASPECT } from "@/lib/domains/philanthropy/types";
export { PHILANTHROPY_FALLBACK } from "@/lib/domains/philanthropy/defaults";
export {
  normalizePhilanthropyContent,
  normalizePhilanthropyPillarItems,
  toPhilanthropyWritePayload,
  philanthropySeedPayload,
  PHILANTHROPY_PUBLIC_EMPTY,
} from "@/lib/domains/philanthropy/normalize";
export { philanthropyKeys } from "@/lib/domains/philanthropy/keys";
export {
  ensurePhilanthropyContentSeeded,
  fetchPhilanthropyContent,
  savePhilanthropyContent,
  PHILANTHROPY_DOC_PATH,
} from "@/lib/firebase/philanthropy";
export {
  usePhilanthropyContent,
  useSavePhilanthropyMutation,
} from "@/lib/domains/philanthropy/hooks";
