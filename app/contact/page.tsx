import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact | Dr. Sunday Okafor",
  description:
    "Get in touch with Dr. Sunday Okafor about collaborations, speaking, or mentorship.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <main>
        <Contact />
      </main>
    </PageShell>
  );
}
