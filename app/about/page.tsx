import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import About from "@/components/About";
import Hobbies from "@/components/Hobbies";

export const metadata: Metadata = {
  title: "About | Dr. Sunday Okafor",
  description:
    "Meet Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader dedicated to safer roads and stronger communities.",
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
