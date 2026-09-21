import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Achievements from "@/components/Achievements";
import Credentials from "@/components/Credentials";
import { fetchAchievementsContent } from "@/lib/domains/achievements";
import { fetchMediaAssetById } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Achievements | Dr. Sunday Okafor",
  description:
    "Career milestones, professional credentials, and awards — from PE licensure to national recognition.",
};

/** ISR: admin saves bust via /api/revalidate. */
export const revalidate = 300;

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

export default async function AchievementsPage() {
  const achievements = await fetchAchievementsContent();

  const mediaIds = [
    ...new Set(
      [
        ...achievements.milestones.items.map(
          (item) => item.image?.galleryImageId,
        ),
        achievements.journey.portraitImage?.galleryImageId,
        achievements.journey.secondaryImageA?.galleryImageId,
        achievements.journey.secondaryImageB?.galleryImageId,
      ].filter((id): id is string => Boolean(id)),
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
        <Achievements
          milestones={achievements.milestones}
          mediaById={mediaById}
        />
        <Credentials journey={achievements.journey} mediaById={mediaById} />
      </main>
    </PageShell>
  );
}
