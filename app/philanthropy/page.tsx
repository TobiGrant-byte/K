import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Philanthropy from "@/components/Philanthropy";

export const metadata: Metadata = {
  title: "Impacts | Dr. Sunday Okafor",
  description:
    "Mentorship, community leadership, and public talks — how Dr. Sunday Okafor gives back beyond the job.",
};

export default function PhilanthropyPage() {
  return (
    <PageShell>
      <main>
        <Philanthropy />
      </main>
    </PageShell>
  );
}
