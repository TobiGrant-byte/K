"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publicationsKeys } from "@/lib/domains/publications/keys";
import {
  ensurePublicationsContentSeeded,
  savePublicationsContent,
} from "@/lib/firebase/publications";
import type { PublicationsContentInput } from "@/lib/domains/publications/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const PUBLICATIONS_STALE = 5 * 60_000;

export function usePublicationsContent() {
  return useQuery({
    queryKey: publicationsKeys.content(),
    queryFn: ensurePublicationsContentSeeded,
    staleTime: PUBLICATIONS_STALE,
  });
}

export function useSavePublicationsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublicationsContentInput) =>
      savePublicationsContent(input),
    onSuccess: (data) => {
      queryClient.setQueryData(publicationsKeys.content(), data);
      void revalidatePublicSite("publications");
    },
  });
}
