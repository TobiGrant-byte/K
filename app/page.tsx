import type { Metadata } from "next";
import Hero from "@/components/Hero";
import AboutTeaser from "@/components/AboutTeaser";
import { fetchProfileContent } from "@/lib/domains/profile";
import { fetchMediaAssetById } from "@/lib/domains/media";

export const metadata: Metadata = {
  title: "Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader",
  description:
    "Dr. Sunday Okafor, PhD — Transportation Engineer, Researcher, and Leader. Designing safer roads, mentoring emerging professionals, and leading with purpose.",
};

/** ISR: serve cached HTML; admin saves bust the cache via /api/revalidate. */
export const revalidate = 300;

export default async function Home() {
  const profile = await fetchProfileContent();

  let aboutMedia = null;
  const imageId = profile.about.image?.galleryImageId;
  if (imageId) {
    try {
      aboutMedia = await fetchMediaAssetById(imageId);
    } catch {
      aboutMedia = null;
    }
  }

  return (
    <main>
      <Hero home={profile.home} />
      <AboutTeaser about={profile.about} aboutMedia={aboutMedia} />
    </main>
  );
}
