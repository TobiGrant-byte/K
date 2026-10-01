import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Contact from "@/components/Contact";
import {
  CONTACT_FALLBACK,
  fetchContactContent,
} from "@/lib/domains/contact";

export const metadata: Metadata = {
  title: "Contact | Dr. Sunday Okafor",
  description:
    "Get in touch with Dr. Sunday Okafor about collaborations, speaking, or mentorship.",
};

/** ISR: serve cached HTML; admin saves bust the cache via /api/revalidate. */
export const revalidate = 3600;

export default async function ContactPage() {
  const fetched = await fetchContactContent();
  const content = fetched.title.trim() ? fetched : CONTACT_FALLBACK;

  return (
    <PageShell>
      <main>
        <Contact content={content} />
      </main>
    </PageShell>
  );
}
