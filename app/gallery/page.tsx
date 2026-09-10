import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Gallery from "@/components/Gallery";

export const metadata: Metadata = {
  title: "Gallery | Dr. Sunday Okafor",
  description: "Photo gallery from the life and career of Dr. Sunday Okafor.",
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
