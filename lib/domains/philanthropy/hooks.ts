"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { philanthropyKeys } from "@/lib/domains/philanthropy/keys";
import {
  ensurePhilanthropyContentSeeded,
  savePhilanthropyContent,
} from "@/lib/firebase/philanthropy";
import type { PhilanthropyContentInput } from "@/lib/domains/philanthropy/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const PHILANTHROPY_STALE = 5 * 60_000;

export function usePhilanthropyContent() {
  return useQuery({
    queryKey: philanthropyKeys.content(),
    queryFn: ensurePhilanthropyContentSeeded,
    staleTime: PHILANTHROPY_STALE,
  });
}

export function useSavePhilanthropyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PhilanthropyContentInput) =>
      savePhilanthropyContent(input),
    onSuccess: (data) => {
      queryClient.setQueryData(philanthropyKeys.content(), data);
      void revalidatePublicSite("philanthropy");
    },
  });
}
