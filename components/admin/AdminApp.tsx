"use client";

import { Suspense, useEffect, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AdminOverview from "@/components/admin/cms/AdminOverview";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminProfile from "@/components/admin/AdminProfile";
import AdminProjects from "@/components/admin/AdminProjects";
import AdminResearch from "@/components/admin/AdminResearch";
import AdminPublications from "@/components/admin/AdminPublications";
import AdminPhilanthropy from "@/components/admin/AdminPhilanthropy";
import AdminAchievements from "@/components/admin/AdminAchievements";
import AdminContact from "@/components/admin/AdminContact";
import AdminManageAdmins from "@/components/admin/AdminManageAdmins";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminShell from "@/components/admin/cms/AdminShell";
import AdminToasts from "@/components/admin/cms/AdminToasts";
import AdminUrlSync from "@/components/admin/cms/AdminUrlSync";
import {
  requestAdminPasswordReset,
  signInAdminWithEmailPassword,
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => subscribeToAdminAuth(setAuthState), []);

  useEffect(() => {
    if (authState.status === "unauthorized") {
      adminToast.error(
        "This account is not authorized to view this page. Please contact Dr. Sunday Okafor for access.",
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

  const handleGoogleLogin = async () => {
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

  const handleEmailLogin = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    try {
      await signInAdminWithEmailPassword(email, password);
    } catch (error) {
      const details = error as Error & { code?: string };
      const message =
        details.code === "auth/invalid-credential" ||
        details.code === "auth/wrong-password" ||
        details.code === "auth/user-not-found" ||
        details.code === "auth/invalid-email"
          ? "Invalid email or password."
          : details.message || "Sign-in failed.";
      adminToast.error(message);
    } finally {
      setSigningIn(false);
    }
  };

  const handleForgotPassword = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetBusy(true);
    try {
      await requestAdminPasswordReset(resetEmail);
      adminToast.success(
        "A password reset email is on the way. Check your inbox.",
      );
      setForgotMode(false);
      setResetEmail("");
    } catch (error) {
      adminToast.error(
        error instanceof Error
          ? error.message
          : "Could not send reset email.",
      );
    } finally {
      setResetBusy(false);
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
              {forgotMode ? "Reset password" : "Sign in"}
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-white/50">
              {forgotMode
                ? "Enter the email for your admin account and we’ll send a reset link if it exists."
                : "Use an authorized Google account or email/password credentials created by an existing admin."}
            </p>

            {forgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={resetBusy}
                    className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent disabled:opacity-60"
                  />
                </label>
                <button
                  type="submit"
                  disabled={resetBusy}
                  className="w-full rounded-lg bg-accent py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:bg-accent-light disabled:opacity-60"
                >
                  {resetBusy ? "Sending…" : "Send reset email"}
                </button>
                <button
                  type="button"
                  disabled={resetBusy}
                  onClick={() => {
                    setForgotMode(false);
                    setResetEmail("");
                  }}
                  className="w-full font-title text-[9px] uppercase tracking-[2px] text-white/45 hover:text-white/70 disabled:opacity-50"
                >
                  ← Back to sign in
                </button>
              </form>
            ) : (
              <>
            <button
              type="button"
              onClick={() => void handleGoogleLogin()}
              disabled={signingIn}
              className="w-full rounded-lg bg-accent py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:bg-accent-light disabled:opacity-60"
            >
              {signingIn ? "Signing in…" : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-title text-[9px] uppercase tracking-[2px] text-white/35">
                or password
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                  Username or email
                </span>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={signingIn}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent disabled:opacity-60"
                />
              </label>
              <label className="block">
                <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                  Password
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={signingIn}
                    className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-accent disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={signingIn}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-white/45 hover:text-white/80 disabled:opacity-50"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </label>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={signingIn}
                  onClick={() => setForgotMode(true)}
                  className="font-title text-[9px] uppercase tracking-[2px] text-white/45 hover:text-white/70 disabled:opacity-50"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={signingIn}
                className="w-full rounded-lg border border-white/15 py-3.5 font-title text-[11px] uppercase tracking-[2.5px] text-white transition-colors hover:border-white/30 hover:bg-white/5 disabled:opacity-60"
              >
                {signingIn ? "Signing in…" : "Sign in"}
              </button>
            </form>
              </>
            )}

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
      {section === "projects" ? <AdminProjects /> : null}
      {section === "research-dev" ? <AdminResearch /> : null}
      {section === "publications" ? <AdminPublications /> : null}
      {section === "philanthropy" ? <AdminPhilanthropy /> : null}
      {section === "achievements" ? <AdminAchievements /> : null}
      {section === "contact" ? <AdminContact /> : null}
      {section === "manage-admins" ? <AdminManageAdmins /> : null}
      {section === "settings" ? <AdminSettings /> : null}
    </AdminShell>
  );
}
