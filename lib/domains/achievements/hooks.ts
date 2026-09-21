"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { achievementsKeys } from "@/lib/domains/achievements/keys";
import {
  ensureAchievementsContentSeeded,
  saveAchievementsContent,
} from "@/lib/firebase/achievements";
import type { AchievementsContentInput } from "@/lib/domains/achievements/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const ACHIEVEMENTS_STALE = 5 * 60_000;

export function useAchievementsContent() {
  return useQuery({
    queryKey: achievementsKeys.content(),
    queryFn: ensureAchievementsContentSeeded,
    staleTime: ACHIEVEMENTS_STALE,
  });
}

export function useSaveAchievementsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AchievementsContentInput) =>
      saveAchievementsContent(input),
    onSuccess: (data) => {
      queryClient.setQueryData(achievementsKeys.content(), data);
      void revalidatePublicSite("achievements");
    },
  });
}
