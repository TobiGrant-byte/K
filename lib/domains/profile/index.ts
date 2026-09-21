export type {
  ProfileAboutContent,
  ProfileContent,
  ProfileContentInput,
  ProfileHobbiesContent,
  ProfileHobbyItem,
  ProfileHomeContent,
} from "@/lib/domains/profile/types";
export {
  ABOUT_IMAGE_ASPECT,
  HOBBIES_IMAGE_ASPECT,
} from "@/lib/domains/profile/types";
export {
  ABOUT_IMAGE_FALLBACK_ALT,
  ABOUT_IMAGE_FALLBACK_SRC,
  HOME_HERO_IMAGE_SRC,
  PROFILE_FALLBACK,
} from "@/lib/domains/profile/defaults";
export {
  normalizeProfileAbout,
  normalizeProfileContent,
  normalizeProfileHobbies,
  normalizeProfileHobbyItems,
  normalizeProfileHome,
  profileBodyParagraphs,
  roleLines,
  toProfileWritePayload,
} from "@/lib/domains/profile/normalize";
export { profileKeys } from "@/lib/domains/profile/keys";
export {
  ensureProfileContentSeeded,
  fetchProfileContent,
  saveProfileContent,
  PROFILE_DOC_PATH,
} from "@/lib/firebase/profile";
export {
  useProfileContent,
  useSaveProfileMutation,
} from "@/lib/domains/profile/hooks";
