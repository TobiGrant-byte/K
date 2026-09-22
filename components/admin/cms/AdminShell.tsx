"use client";

import { useEffect, type ReactNode } from "react";
import type { User } from "firebase/auth";
import AdminHeader from "@/components/admin/cms/AdminHeader";
import AdminSidebar from "@/components/admin/cms/AdminSidebar";
import { useAdminUiStore } from "@/lib/admin/ui-store";

type Props = {
  user: User;
  onLogout: () => void;
  children: ReactNode;
};

export default function AdminShell({ user, onLogout, children }: Props) {
  const theme = useAdminUiStore((s) => s.theme);
  const hydrateTheme = useAdminUiStore((s) => s.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <div
      data-admin-theme={theme}
      className="admin-shell min-h-screen bg-navy-900 text-white"
    >
      <AdminSidebar />
      <div className="relative flex min-h-screen min-w-0 flex-col lg:pl-64">
        <div
          aria-hidden
          className="admin-shell-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(74,143,232,0.08)_0%,transparent_45%)]"
        />
        <AdminHeader user={user} onLogout={onLogout} />
        <main className="relative flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
