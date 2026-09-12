import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Research from "@/components/Research";

export const metadata: Metadata = {
  title: "Research and Development | Dr. Sunday Okafor",
  description:
    "Traffic safety, connected infrastructure, and inclusive mobility — R&D focus areas for safer transportation systems.",
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
