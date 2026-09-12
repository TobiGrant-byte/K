import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Achievements from "@/components/Achievements";
import Credentials from "@/components/Credentials";

export const metadata: Metadata = {
  title: "Achievements | Dr. Sunday Okafor",
  description:
    "Career milestones, professional credentials, and awards — from PE licensure to national recognition.",
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
