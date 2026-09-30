"use client";

import { useMemo, useState, type SubmitEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase/config";
import type { AdminRecord } from "@/lib/firebase/admin-types";
import {
  createAdminAccount,
  listAdmins,
  revokeAdminAccess,
} from "@/lib/firebase/admins";
import { adminToast } from "@/lib/admin/toast-store";
import AdminConfirmDialog from "@/components/admin/cms/AdminConfirmDialog";

const ADMINS_QUERY_KEY = ["admins", "directory"] as const;

function providerLabel(providers: string[]): string {
  const set = new Set(providers);
  const hasGoogle = set.has("google.com");
  const hasPassword = set.has("password");
  if (hasGoogle && hasPassword) return "Google + Password";
  if (hasGoogle) return "Google";
  if (hasPassword) return "Email / password";
  return providers[0] || "Google";
}

function formatCreated(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminManageAdmins() {
  const currentUser = getFirebaseAuth().currentUser;
  const currentUid = currentUser?.uid ?? "";
  const canRemoveAdmins =
    currentUser?.providerData.some((p) => p.providerId === "google.com") ??
    false;
  const queryClient = useQueryClient();
  const adminsQuery = useQuery({
    queryKey: ADMINS_QUERY_KEY,
    queryFn: listAdmins,
  });
  const admins = adminsQuery.data ?? [];
  const loading = adminsQuery.isPending;
  const sortedAdmins = useMemo(() => {
    const createdMs = (value: string | null) => {
      if (!value) return 0;
      const ms = new Date(value).getTime();
      return Number.isNaN(ms) ? 0 : ms;
    };
    return [...admins].sort((a, b) => {
      const aYou = a.uid === currentUid;
      const bYou = b.uid === currentUid;
      if (aYou !== bYou) return aYou ? -1 : 1;
      return createdMs(b.createdAt) - createdMs(a.createdAt);
    });
  }, [admins, currentUid]);
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);

  const refreshAdmins = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEY });
  };

  const handleCreate = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      await createAdminAccount({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      adminToast.success("Admin created.");
      setUsername("");
      setEmail("");
      setPassword("");
      await refreshAdmins();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not create admin.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await revokeAdminAccess(deleteTarget.uid);
      adminToast.success("Admin access removed.");
      setDeleteTarget(null);
      await refreshAdmins();
    } catch (error) {
      adminToast.error(
        error instanceof Error ? error.message : "Could not remove admin.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm leading-relaxed text-white/50">
        Invite-only administrators. Creating an account here adds email/password
        sign-in. Only Google admins can remove access.
      </p>

      <section className="rounded-lg border border-white/10 bg-navy-800 p-6">
        <div className="mb-1 font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Add admin
        </div>
        <h2 className="font-display text-2xl font-light text-white">
          Create account
        </h2>
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Username
            </span>
            <input
              type="text"
              required
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block font-title text-[9px] uppercase tracking-[2px] text-white/45">
              Temporary password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/12 bg-navy-900 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/45 hover:text-white/80"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
            </div>
            <span className="mt-2 block text-xs text-white/40">
              Minimum 8 characters. Share it securely; they can reset later by
              email.
            </span>
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-6 py-3 font-title text-[10px] uppercase tracking-[2px] text-white hover:bg-accent-light disabled:opacity-50"
            >
              {busy ? "Working…" : "Add admin"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-white/10 bg-navy-800 p-6">
        <div className="mb-1 font-title text-[9px] uppercase tracking-[2px] text-white/50">
          Directory
        </div>
        <h2 className="font-display text-2xl font-light text-white">
          Current admins
        </h2>

        {loading ? (
          <p className="mt-6 text-sm text-white/45">Loading admins…</p>
        ) : admins.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">No admins found.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-160 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 font-title text-[9px] uppercase tracking-[2px] text-white/45">
                  <th className="pb-3 pr-4 font-normal">Username</th>
                  <th className="pb-3 pr-4 font-normal">Email</th>
                  <th className="pb-3 pr-4 font-normal">Sign-in</th>
                  <th
                    className={`pb-3 font-normal ${canRemoveAdmins ? "pr-4" : ""}`}
                  >
                    Created
                  </th>
                  {canRemoveAdmins ? (
                    <th className="pb-3 font-normal">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {sortedAdmins.map((admin) => {
                  const isYou = admin.uid === currentUid;
                  return (
                    <tr
                      key={admin.uid}
                      className="border-b border-white/8 text-white/80"
                    >
                      <td className="py-4 pr-4">
                        {admin.username}
                        {isYou ? (
                          <span className="ml-2 font-title text-[8px] uppercase tracking-[1.5px] text-accent">
                            You
                          </span>
                        ) : null}
                      </td>
                      <td className="py-4 pr-4 text-white/60">
                        {admin.email || "—"}
                      </td>
                      <td className="py-4 pr-4 text-white/60">
                        {providerLabel(admin.providers)}
                      </td>
                      <td
                        className={`py-4 text-white/50 ${canRemoveAdmins ? "pr-4" : ""}`}
                      >
                        {formatCreated(admin.createdAt)}
                      </td>
                      {canRemoveAdmins ? (
                        <td className="py-4">
                          <button
                            type="button"
                            disabled={busy || isYou || sortedAdmins.length <= 1}
                            onClick={() => setDeleteTarget(admin)}
                            className="rounded border border-red-500/30 px-3 py-1.5 font-title text-[8px] uppercase tracking-[1.5px] text-red-300 hover:bg-red-500/10 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        eyebrow="Remove admin"
        title="Revoke CMS access?"
        confirmLabel={busy ? "Removing…" : "Remove access"}
        busy={busy}
        onCancel={() => {
          if (busy) return;
          setDeleteTarget(null);
        }}
        onConfirm={() => void handleRevoke()}
        description={
          deleteTarget ? (
            <p>
              Remove CMS access for{" "}
              <span className="text-white/80">{deleteTarget.username}</span>
              {deleteTarget.email ? ` (${deleteTarget.email})` : ""}.
            </p>
          ) : null
        }
      />
    </div>
  );
}
