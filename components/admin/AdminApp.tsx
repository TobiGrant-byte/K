"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import AdminOverview from "@/components/admin/cms/AdminOverview";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminProfile from "@/components/admin/AdminProfile";
import AdminResearch from "@/components/admin/AdminResearch";
import AdminPublications from "@/components/admin/AdminPublications";
import AdminPhilanthropy from "@/components/admin/AdminPhilanthropy";
import AdminAchievements from "@/components/admin/AdminAchievements";
import AdminShell from "@/components/admin/cms/AdminShell";
import AdminToasts from "@/components/admin/cms/AdminToasts";
import AdminUrlSync from "@/components/admin/cms/AdminUrlSync";
import {
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeToAdminAuth,
  type AdminAuthState,
} from "@/lib/firebase/auth";
import { useAdminUiStore } from "@/lib/admin/ui-store";
import { adminToast } from "@/lib/admin/toast-store";

export default function AdminApp() {
  const section = useAdminUiStore((s) => s.section);
  const [authState, setAuthState] = useState<AdminAuthState>({
    status: "loading",
    user: null,
    isAdmin: false,
  });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => subscribeToAdminAuth(setAuthState), []);

  useEffect(() => {
    if (authState.status === "unauthorized") {
      adminToast.error(
        "This Google account is not authorized to view this page. Please contact Dr. Sunday Okafor for access.",
      );
      const t = window.setTimeout(() => {
        setAuthState({ status: "signed-out", user: null, isAdmin: false });
      }, 8000);
      return () => window.clearTimeout(t);
    }
    if (authState.status === "error") {
      adminToast.error(authState.message);
    const t = window.setTimeout(() => {
      setAuthState({ status: "signed-out", user: null, isAdmin: false });
    }, 8000);
    return () => window.clearTimeout(t);
    }
  }, [authState]);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInAdminWithGoogle();
    } catch (error) {
      const details = error as Error & { code?: string };
      if (
        details.code !== "auth/popup-closed-by-user" &&
        details.code !== "auth/cancelled-popup-request"
      ) {
        adminToast.error(details.message || "Google sign-in failed.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
  };

  if (authState.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 text-white/50">
        Loading…
      </div>
    );
  }

  if (authState.status !== "admin" || !authState.user) {
    return (
      <>
        <AdminToasts />
        <div className="flex min-h-screen items-center justify-center bg-navy-900 px-6">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-navy-800 p-8">
            <div className="mb-2 font-title text-[10px] uppercase tracking-[3px] text-white/50">
              CMS
          </div>
          <h1 className="mb-2 font-display text-3xl font-light text-white">
            Sign in
          </h1>
            <p className="mb-8 text-sm leading-relaxed text-white/50">
              Continue with an authorized Google account to manage site content.
            </p>

          <button
            type="button"
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full rounded-lg bg-accent py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:bg-accent-light disabled:opacity-60"
          >
            {signingIn ? "Signing in…" : "Continue with Google"}
          </button>

          <Link
            href="/"
              className="mt-6 inline-flex font-title text-[9px] uppercase tracking-[2px] text-white/40 no-underline hover:text-white/70"
          >
            ← Back to site
          </Link>
        </div>
      </div>
      </>
    );
  }

  return (
    <AdminShell user={authState.user} onLogout={handleLogout}>
      <Suspense fallback={null}>
        <AdminUrlSync />
      </Suspense>
      <AdminToasts />
      {section === "overview" ? <AdminOverview /> : null}
      {section === "blog-posts" ? <AdminPosts /> : null}
      {section === "gallery" ? <AdminMediaLibrary /> : null}
      {section === "about" ? <AdminProfile /> : null}
      {section === "research-dev" ? <AdminResearch /> : null}
      {section === "publications" ? <AdminPublications /> : null}
      {section === "philanthropy" ? <AdminPhilanthropy /> : null}
      {section === "achievements" ? <AdminAchievements /> : null}
    </AdminShell>
  );
}
