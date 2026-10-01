export type {
  ContactContent,
  ContactContentInput,
  ContactTopic,
} from "@/lib/domains/contact/types";
export { CONTACT_FALLBACK } from "@/lib/domains/contact/defaults";
export {
  CONTACT_PUBLIC_EMPTY,
  contactSeedPayload,
  normalizeContactContent,
  normalizeContactTopics,
  toContactWritePayload,
} from "@/lib/domains/contact/normalize";
export { contactKeys } from "@/lib/domains/contact/keys";
export {
  CONTACT_DOC_PATH,
  ensureContactContentSeeded,
  fetchContactContent,
  saveContactContent,
} from "@/lib/firebase/contact";
export {
  useContactContent,
  useSaveContactMutation,
} from "@/lib/domains/contact/hooks";
