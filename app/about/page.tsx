import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import About from "@/components/About";
import Hobbies from "@/components/Hobbies";
import {
  fetchProfileContent,
  PROFILE_FALLBACK,
} from "@/lib/domains/profile";
import { fetchMediaAssetById } from "@/lib/domains/media";

export const metadata: Metadata = {
  title: "About | Dr. Sunday Okafor",
  description:
    "Meet Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader dedicated to safer roads and stronger communities.",
};

/** ISR: serve cached HTML; admin saves bust the cache via /api/revalidate. */
export const revalidate = 300;

export default async function AboutPage() {
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
    <PageShell>
      <main>
        <About about={profile.about} aboutMedia={aboutMedia} />
        <Hobbies />
      </main>
    </PageShell>
  );
}
