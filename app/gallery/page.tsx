import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery | Dr. Sunday Okafor",
  description:
    "Moments from work, campus, and community — a visual story of Dr. Sunday Okafor’s journey.",
};

export default function GalleryPage() {
  return (
    <PageShell>
      <main>
        <Gallery />
      </main>
    </PageShell>
  );
}
