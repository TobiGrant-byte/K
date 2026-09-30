"use client";

import { useState, type SubmitEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/config";
import {
  getOwnAdminSettings,
  updateOwnPassword,
  updateOwnUsername,
} from "@/lib/firebase/admins";
import { adminToast } from "@/lib/admin/toast-store";

function providerLabel(providers: string[]): string {
  const set = new Set(providers);
  const hasGoogle = set.has("google.com");
  const hasPassword = set.has("password");
  if (hasGoogle && hasPassword) return "Google + Password";
  if (hasGoogle) return "Google";
  if (hasPassword) return "Email / password";
  return providers[0] || "Google";
}

export default function AdminSettings() {
  const currentUid = getFirebaseAuth().currentUser?.uid ?? "";
  if (!currentUid) {
    return (
      <p className="text-sm text-white/45">Sign in to manage your settings.</p>
    );
  }
  // Remount when the signed-in account changes so drafts/cache never leak.
  return <AdminSettingsForm key={currentUid} uid={currentUid} />;
}

function AdminSettingsForm({ uid }: { uid: string }) {
  const queryClient = useQueryClient();
  const settingsQueryKey = ["admins", "settings", uid] as const;
  const settingsQuery = useQuery({
    queryKey: settingsQueryKey,
    queryFn: getOwnAdminSettings,
  });

  const profile = settingsQuery.data;
  const [username, setUsername] = useState<string | null>(null);
  const [usernameBusy, setUsernameBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  const draftUsername = username ?? profile?.username ?? "";

  const handleSaveUsername = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUsernameBusy(true);
    try {
      await updateOwnUsername(draftUsername);
      adminToast.success("Username saved.");
      setUsername(draftUsername.trim());
      await queryClient.invalidateQueries({ queryKey: settingsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: ["admins", "directory"],
      });
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not save username.",
      );
    } finally {
      setUsernameBusy(false);
    }
  };

  const handleChangePassword = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      adminToast.error("New passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    try {
      await updateOwnPassword({
        currentPassword,
        newPassword,
      });
      adminToast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not update password.",
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  if (settingsQuery.isPending || !profile) {
    return (
      <p className="text-sm text-white/45">
        {settingsQuery.isPending
          ? "Loading settings…"
          : "Could not load your account settings."}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-white/50">
        Update your CMS account. Only fields your sign-in method supports are
        shown.
      </p>

      <section className="rounded-lg border border-white/10 bg-navy-800 p-6">
        <div className="mb-1 font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Account
        </div>
        <h2 className="font-display text-2xl font-light text-white">
          Your profile
        </h2>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Email
            </dt>
            <dd className="mt-2 text-sm text-white/80">
              {profile.email || "—"}
            </dd>
            <p className="mt-1 text-xs text-white/35">
              Managed by your sign-in provider; not editable here.
            </p>
          </div>
          <div>
            <dt className="font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Sign-in
            </dt>
            <dd className="mt-2 text-sm text-white/80">
              {providerLabel(profile.providers)}
            </dd>
          </div>
        </dl>

        <form
          onSubmit={handleSaveUsername}
          className="mt-8 max-w-md space-y-4"
        >
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Username
            </span>
            <input
              type="text"
              required
              autoComplete="username"
              value={draftUsername}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent"
            />
            <span className="mt-2 block text-xs text-white/40">
              Used for display and username login (email/password accounts).
            </span>
          </label>
          <button
            type="submit"
            disabled={
              usernameBusy ||
              draftUsername.trim() === profile.username.trim() ||
              !draftUsername.trim()
            }
            className="rounded-lg bg-accent px-6 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-50"
          >
            {usernameBusy ? "Saving…" : "Save username"}
          </button>
        </form>
      </section>

      {profile.canChangePassword ? (
        <section className="rounded-lg border border-white/10 bg-navy-800 p-6">
          <div className="mb-1 font-title text-[9px] uppercase tracking-[2px] text-white/50">
            Security
          </div>
          <h2 className="font-display text-2xl font-light text-white">
            Change password
          </h2>
          <form
            onSubmit={handleChangePassword}
            className="mt-6 max-w-md space-y-4"
          >
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                Current password
              </span>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white/45 hover:text-white/80"
                  aria-label={
                    showCurrent ? "Hide password" : "Show password"
                  }
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                New password
              </span>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white/45 hover:text-white/80"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
                Confirm new password
              </span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent"
              />
            </label>
            <button
              type="submit"
              disabled={passwordBusy}
              className="rounded-lg bg-accent px-6 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-50"
            >
              {passwordBusy ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      ) : (
        <section className="rounded-lg border border-white/10 bg-navy-800 p-6">
          <div className="mb-1 font-title text-[9px] uppercase tracking-[2px] text-white/50">
            Security
          </div>
          <h2 className="font-display text-2xl font-light text-white">
            Password
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">
            You sign in with Google, so there is no CMS password to change.
            Manage your Google account password in your Google account settings.
          </p>
        </section>
      )}
    </div>
  );
}
