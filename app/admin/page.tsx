import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Admin | Dr. Sunday Okafor",
  description: "Blog administration — private.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
