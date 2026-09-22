"use client";

import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import AdminHeader from "@/components/admin/cms/AdminHeader";
import AdminSidebar from "@/components/admin/cms/AdminSidebar";

type Props = {
  user: User;
  onLogout: () => void;
  children: ReactNode;
};

export default function AdminShell({ user, onLogout, children }: Props) {
  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <AdminSidebar />
      <div className="relative flex min-h-screen min-w-0 flex-col lg:pl-64">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(74,143,232,0.08)_0%,transparent_45%)]"
        />
        <AdminHeader user={user} onLogout={onLogout} />
        <main className="relative flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
