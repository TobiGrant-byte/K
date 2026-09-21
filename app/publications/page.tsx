import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import PressSection from "@/components/PressSection";
import { fetchPublicationsContent } from "@/lib/domains/publications";
import { fetchMediaAssetById } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Publications | Dr. Sunday Okafor",
  description:
    "Press features and scholarship tips from Dr. Sunday Okafor — coverage of his work in transportation, safety, and leadership.",
};

/** ISR: admin saves bust via /api/revalidate. */
export const revalidate = 300;

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

export default async function PublicationsPage() {
  const publications = await fetchPublicationsContent();

  const mediaIds = [
    ...new Set(
      publications.items
        .map((item) => item.image?.galleryImageId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const pressMediaById: Record<string, MediaPick> = {};
  await Promise.all(
    mediaIds.map(async (id) => {
      try {
        pressMediaById[id] = await fetchMediaAssetById(id);
      } catch {
        pressMediaById[id] = null;
      }
    }),
  );

  return (
    <PageShell>
      <main>
        <PressSection
          publications={publications}
          pressMediaById={pressMediaById}
        />
      </main>
    </PageShell>
  );
}
