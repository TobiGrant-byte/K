import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Scholarship from "@/components/Scholarship";

export const metadata: Metadata = {
  title: "Scholarship | Dr. Sunday Okafor",
  description: "Scholarships and funded opportunities that shaped Dr. Sunday Okafor’s path.",
};

export default function ScholarshipPage() {
  return (
    <PageShell>
      <main>
        <Scholarship />
      </main>
    </PageShell>
  );
}
