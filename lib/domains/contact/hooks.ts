"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactKeys } from "@/lib/domains/contact/keys";
import {
  ensureContactContentSeeded,
  saveContactContent,
} from "@/lib/firebase/contact";
import type { ContactContentInput } from "@/lib/domains/contact/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const CONTACT_STALE = 60 * 60_000;

export function useContactContent() {
  return useQuery({
    queryKey: contactKeys.content(),
    queryFn: ensureContactContentSeeded,
    staleTime: CONTACT_STALE,
  });
}

export function useSaveContactMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContactContentInput) => {
      const data = await saveContactContent(input);
      await revalidatePublicSite("contact");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(contactKeys.content(), data);
    },
  });
}
