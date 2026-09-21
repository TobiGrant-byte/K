import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Gallery from "@/components/Gallery";
import { fetchPublicGalleryMedia } from "@/lib/domains/media";

export const metadata: Metadata = {
  title: "Gallery | Dr. Sunday Okafor",
  description:
    "Moments from work, campus, and community — a visual story of Dr. Sunday Okafor’s journey.",
};

/** Refresh SSR gallery data periodically; client listener keeps it live. */
export const revalidate = 60;

export default async function GalleryPage() {
  let initialMedia: Awaited<ReturnType<typeof fetchPublicGalleryMedia>> = [];
  try {
    initialMedia = await fetchPublicGalleryMedia();
  } catch {
    initialMedia = [];
  }

  return (
    <PageShell>
      <main>
        <Gallery initialMedia={initialMedia} />
      </main>
    </PageShell>
  );
}
