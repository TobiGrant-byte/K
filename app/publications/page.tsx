import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PressSection from "@/components/PressSection";

export const metadata: Metadata = {
  title: "Publications | Dr. Sunday Okafor",
  description:
    "Press features and written pieces covering Dr. Sunday Okafor’s work in transportation, safety, and leadership.",
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
