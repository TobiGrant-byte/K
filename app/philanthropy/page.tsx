import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Philanthropy from "@/components/Philanthropy";
import { fetchPhilanthropyContent } from "@/lib/domains/philanthropy";
import { fetchMediaAssetById } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Impacts | Dr. Sunday Okafor",
  description:
    "Mentorship, community leadership, and public talks — how Dr. Sunday Okafor gives back beyond the job.",
};

/** ISR: admin saves bust via /api/revalidate. */
export const revalidate = 300;

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

export default async function PhilanthropyPage() {
  const philanthropy = await fetchPhilanthropyContent();

  const mediaIds = [
    ...new Set(
      philanthropy.items
        .map((item) => item.image?.galleryImageId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const mediaById: Record<string, MediaPick> = {};
  await Promise.all(
    mediaIds.map(async (id) => {
      try {
        mediaById[id] = await fetchMediaAssetById(id);
      } catch {
        mediaById[id] = null;
      }
    }),
  );

  return (
    <PageShell>
      <main>
        <Philanthropy philanthropy={philanthropy} mediaById={mediaById} />
      </main>
    </PageShell>
  );
}
