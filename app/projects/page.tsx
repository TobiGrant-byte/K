import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Projects from "@/components/Projects";
import { fetchProjectsContent } from "@/lib/domains/projects";
import { fetchMediaAssetById } from "@/lib/domains/media";
import type { MediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Projects | Dr. Sunday Okafor",
  description:
    "Engineering projects across safety, operations, and ITS — work as a project engineer.",
};

/** ISR: admin saves bust via /api/revalidate. */
export const revalidate = 3600;

type MediaPick = Pick<MediaAsset, "imageUrl" | "altText" | "title"> | null;

export default async function ProjectsPage() {
  const projects = await fetchProjectsContent();

  const mediaIds = [
    ...new Set(
      projects.items
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
        <Projects projects={projects} mediaById={mediaById} />
      </main>
    </PageShell>
  );
}
