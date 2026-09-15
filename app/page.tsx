import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader",
  description:
    "Dr. Sunday Okafor, PhD — Transportation Engineer, Researcher, and Leader. Designing safer roads, mentoring emerging professionals, and leading with purpose.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Contact />
    </main>
  );
}
