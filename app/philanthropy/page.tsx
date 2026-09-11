import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Philanthropy from "@/components/Philanthropy";

export const metadata: Metadata = {
  title: "Philanthropy | Dr. Sunday Okafor",
  description:
    "Giving back through mentorship, community, and safer transportation — Dr. Sunday Okafor’s commitment to society.",
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
