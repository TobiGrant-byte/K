import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Research from "@/components/Research";
import {
  fetchResearchContent,
  RESEARCH_FALLBACK,
} from "@/lib/domains/research";
import { fetchMediaAssetById } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Research and Development | Dr. Sunday Okafor",
  description:
    "Traffic safety, connected infrastructure, and inclusive mobility — R&D focus areas for safer transportation systems.",
};

/** ISR: serve cached HTML; admin saves bust the cache via /api/revalidate. */
export const revalidate = 300;

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

export default async function ResearchPage() {
  let research = RESEARCH_FALLBACK;
  try {
    research = await fetchResearchContent();
  } catch {
    research = RESEARCH_FALLBACK;
  }

  let developmentMedia: MediaPick = null;
  const developmentImageId = research.development.image?.galleryImageId;
  if (developmentImageId) {
    try {
      developmentMedia = await fetchMediaAssetById(developmentImageId);
    } catch {
      developmentMedia = null;
    }
  }

  const actionIds = [
    ...new Set(
      research.action.items
        .map((item) => item.image?.galleryImageId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const actionMediaById: Record<string, MediaPick> = {};
  await Promise.all(
    actionIds.map(async (id) => {
      try {
        actionMediaById[id] = await fetchMediaAssetById(id);
      } catch {
        actionMediaById[id] = null;
      }
    }),
  );

  return (
    <PageShell>
      <main>
        <Research
          research={research}
          developmentMedia={developmentMedia}
          actionMediaById={actionMediaById}
        />
      </main>
    </PageShell>
  );
}
