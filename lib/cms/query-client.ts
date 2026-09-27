import { QueryClient } from "@tanstack/react-query";

/** Shared QueryClient defaults — CMS changes infrequently; avoid refetch storms. */
export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 60_000, // 1 hour
        gcTime: 2 * 60 * 60_000, // keep unused cache ~2 hours
        refetchOnWindowFocus: false,
        // Don't re-hit Firebase just because the laptop woke / network flapped
        // while nobody is actively using the CMS.
        refetchOnReconnect: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
