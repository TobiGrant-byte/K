import type { Metadata } from "next";
import Hero from "@/components/Hero";
import AboutTeaser from "@/components/AboutTeaser";
import {
  fetchProfileContent,
  PROFILE_FALLBACK,
} from "@/lib/domains/profile";
import { fetchMediaAssetById } from "@/lib/domains/media";

export const metadata: Metadata = {
  title: "Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader",
  description:
    "Dr. Sunday Okafor, PhD — Transportation Engineer, Researcher, and Leader. Designing safer roads, mentoring emerging professionals, and leading with purpose.",
};

/** Refresh shared profile copy periodically; static hero never waits on CMS. */
export const revalidate = 60;

export default async function Home() {
  let profile = PROFILE_FALLBACK;
  try {
    profile = await fetchProfileContent();
  } catch {
    profile = PROFILE_FALLBACK;
  }

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
