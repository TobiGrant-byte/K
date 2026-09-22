"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppQueryClient } from "@/lib/cms/query-client";
import { registerCmsRouterRefresh } from "@/lib/cms/revalidate-client";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createAppQueryClient());
  const router = useRouter();

  useEffect(() => {
    return registerCmsRouterRefresh(() => {
      router.refresh();
    });
  }, [router]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
