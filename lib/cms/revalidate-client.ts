"use client";

import { getFirebaseAuth } from "@/lib/firebase/config";
import type { SiteRevalidateScope } from "@/lib/cms/site-revalidate";

/**
 * Ask the server to drop cached public pages after an admin write.
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
    }
  } catch (error) {
    console.warn("[revalidate]", error);
  }
}
