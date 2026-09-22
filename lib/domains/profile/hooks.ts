"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "@/lib/domains/profile/keys";
import {
  ensureProfileContentSeeded,
  saveProfileContent,
} from "@/lib/firebase/profile";
import type { ProfileContentInput } from "@/lib/domains/profile/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const PROFILE_STALE = 5 * 60_000;

/**
 * Admin Profile editor: loads (and seeds once if missing) the shared document.
 * Public pages use `fetchProfileContent` (read-only) instead.
 */
export function useProfileContent() {
  return useQuery({
    queryKey: profileKeys.content(),
    queryFn: ensureProfileContentSeeded,
    staleTime: PROFILE_STALE,
  });
}

export function useSaveProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileContentInput) => {
      const data = await saveProfileContent(input);
      await revalidatePublicSite("profile");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.content(), data);
    },
  });
}
