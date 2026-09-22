"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchHighlight from "@/components/SearchHighlight";
import { CMS_REVALIDATE_STORAGE_KEY } from "@/lib/cms/revalidate-client";

/** Soft-nav onto a public page soon after an admin save → refresh once. */
function usePublicRouteRefreshAfterCmsSave(isAdmin: boolean) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin) return;
    try {
      const raw = sessionStorage.getItem(CMS_REVALIDATE_STORAGE_KEY);
      if (!raw) return;
      const at = Number(raw);
      if (!Number.isFinite(at) || Date.now() - at > 60_000) {
        sessionStorage.removeItem(CMS_REVALIDATE_STORAGE_KEY);
        return;
      }
      sessionStorage.removeItem(CMS_REVALIDATE_STORAGE_KEY);
      router.refresh();
    } catch {
      /* ignore */
    }
  }, [isAdmin, pathname, router]);
}

/** Site chrome is hidden on /admin so the CMS can own the full viewport. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = Boolean(pathname?.startsWith("/admin"));
  usePublicRouteRefreshAfterCmsSave(isAdmin);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <SearchHighlight />
    </>
  );
}
