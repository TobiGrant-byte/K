"use client";

import { getFirebaseAuth } from "@/lib/firebase/config";
import type { SiteRevalidateScope } from "@/lib/cms/site-revalidate";

type RefreshFn = () => void;

export const CMS_REVALIDATE_STORAGE_KEY = "cms:last-revalidate";

let routerRefresh: RefreshFn | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Register Next.js `router.refresh` from a client layout/provider.
 * After CMS revalidate, we soft-refresh so soft navigations to public pages
 * don't keep a stale RSC payload — without live Firestore on public routes.
 */
export function registerCmsRouterRefresh(fn: RefreshFn): () => void {
  routerRefresh = fn;
  return () => {
    if (routerRefresh === fn) routerRefresh = null;
  };
}

function scheduleRouterRefresh() {
  if (typeof window === "undefined") return;
  if (refreshTimer) clearTimeout(refreshTimer);
  // Coalesce burst revalidates (e.g. media migrate) into one refresh.
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    routerRefresh?.();
  }, 0);
}

function markCmsRevalidated() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CMS_REVALIDATE_STORAGE_KEY, String(Date.now()));
  } catch {
    /* private mode / blocked storage */
  }
}

/**
 * Ask the server to drop cached public pages after an admin write, then
 * refresh the App Router client cache so the admin sees updates without F5.
 * Failures are logged only — the mutation itself already succeeded.
 */
export async function revalidatePublicSite(
  scope: SiteRevalidateScope,
): Promise<void> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ scope }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(
        "[revalidate]",
        (await response.text()) || response.statusText,
      );
      return;
    }
    markCmsRevalidated();
    scheduleRouterRefresh();
  } catch (error) {
    console.warn("[revalidate]", error);
  }
}
