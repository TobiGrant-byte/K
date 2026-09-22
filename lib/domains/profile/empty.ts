import { PROFILE_FALLBACK } from "@/lib/domains/profile/defaults";
import type { ProfileContent } from "@/lib/domains/profile/types";

/** Public read when Firebase has no profile doc — About keeps seed copy. */
export const PROFILE_PUBLIC_EMPTY: ProfileContent = {
  home: { roles: [], quote: "" },
  about: { ...PROFILE_FALLBACK.about },
  hobbies: {
    quote: "",
    items: [],
  },
  updatedAt: "",
};
