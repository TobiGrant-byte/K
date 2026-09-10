import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PressSection from "@/components/PressSection";

export const metadata: Metadata = {
  title: "Publications | Dr. Sunday Okafor",
  description: "Publications and featured press coverage of Dr. Sunday Okafor.",
};

export default function PublicationsPage() {
  return (
    <PageShell>
      <main>
        <PressSection />
      </main>
    </PageShell>
  );
}
