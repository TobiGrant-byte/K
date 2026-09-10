import type { ReactNode } from "react";

export default function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen pt-[72px]">{children}</div>;
}
