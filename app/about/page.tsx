import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import About from "@/components/About";
import Hobbies from "@/components/Hobbies";

export const metadata: Metadata = {
  title: "About | Dr. Sunday Okafor",
  description: "About Dr. Sunday Okafor — Professional Engineer, scholar, and academic leader.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <main>
        <About />
        <Hobbies />
      </main>
    </PageShell>
  );
}
