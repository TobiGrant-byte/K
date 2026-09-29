"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsKeys } from "@/lib/domains/projects/keys";
import {
  ensureProjectsContentSeeded,
  saveProjectsContent,
} from "@/lib/firebase/projects";
import type { ProjectsContentInput } from "@/lib/domains/projects/types";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const PROJECTS_STALE = 60 * 60_000; // 1 hour

export function useProjectsContent() {
  return useQuery({
    queryKey: projectsKeys.content(),
    queryFn: ensureProjectsContentSeeded,
    staleTime: PROJECTS_STALE,
  });
}

export function useSaveProjectsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProjectsContentInput) => {
      const data = await saveProjectsContent(input);
      await revalidatePublicSite("projects");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(projectsKeys.content(), data);
    },
  });
}
