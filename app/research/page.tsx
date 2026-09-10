import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Research from "@/components/Research";

export const metadata: Metadata = {
  title: "Research and Development | Dr. Sunday Okafor",
  description: "Research and development focus areas in traffic safety, connected infrastructure, and inclusive mobility.",
};

export default function ResearchPage() {
  return (
    <PageShell>
      <main>
        <Research />
      </main>
    </PageShell>
  );
}
