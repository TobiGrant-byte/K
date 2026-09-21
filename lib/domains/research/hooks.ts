"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { researchKeys } from "@/lib/domains/research/keys";
import {
  ensureResearchContentSeeded,
  saveResearchContent,
} from "@/lib/firebase/research";
import type { ResearchContentInput } from "@/lib/domains/research/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const RESEARCH_STALE = 5 * 60_000;

/** Admin: load (and seed once if missing) Research content. */
export function useResearchContent() {
  return useQuery({
    queryKey: researchKeys.content(),
    queryFn: ensureResearchContentSeeded,
    staleTime: RESEARCH_STALE,
  });
}

export function useSaveResearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResearchContentInput) => saveResearchContent(input),
    onSuccess: (data) => {
      queryClient.setQueryData(researchKeys.content(), data);
      void revalidatePublicSite("research");
    },
  });
}
