"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppQueryClient } from "@/lib/cms/query-client";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createAppQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
