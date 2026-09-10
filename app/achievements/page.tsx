import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Achievements from "@/components/Achievements";
import Credentials from "@/components/Credentials";

export const metadata: Metadata = {
  title: "Achievements | Dr. Sunday Okafor",
  description: "Career achievements, milestones, and credentials of Dr. Sunday Okafor.",
};

export default function AchievementsPage() {
  return (
    <PageShell>
      <main>
        <Achievements />
        <Credentials />
      </main>
    </PageShell>
  );
}
