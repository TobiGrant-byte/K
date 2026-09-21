import type { GalleryCategory, MediaAsset } from "@/lib/media";
import { siteMediaImageKitUrl } from "@/lib/domains/media/site-media-migration";

/**
 * Press card images that were historically hotlinked (UA / Scholarship Region /
 * Legit). Recovered into ImageKit `/site-media/` under these filenames.
 * Gallery doc ids match what `content/publications` already references.
 */
export const PRESS_MEDIA_RECOVERY: Array<{
  fileName: string;
  caption: string;
  category: GalleryCategory;
  /** Stable gallery/{id} — must match publications CMS galleryImageId values. */
  galleryId: string;
  imageKitFileId?: string;
}> = [
  {
    fileName: "press-ua-long-safe-road.jpg",
    caption: "The Long and Safe Road · UA News",
    category: "Recognition",
    galleryId: "legacy-press-ua-long-safe-road.jpg",
    imageKitFileId: "6ab15fdcead997d09a5881c2",
  },
  {
    fileName: "press-scholarship-region.jpg",
    caption: "Scholarship Region feature",
    category: "Recognition",
    galleryId: "legacy-press-scholarship-region.jpg",
    imageKitFileId: "6ab15fe0ead997d09a588e95",
  },
  {
    fileName: "press-legit-alabama-job.jpeg",
    caption: "Legit.ng · University of Alabama feature",
    category: "Recognition",
    galleryId: "legacy-press-legit-alabama-job.jpeg",
    imageKitFileId: "6ab15fe3ead997d09a5895c1",
  },
];

/** Resolve a recovered press asset when the Firestore gallery doc is missing. */
export function knownHostedMediaAsset(id: string): MediaAsset | null {
  const trimmed = id.trim();
  if (!trimmed) return null;

  for (const item of PRESS_MEDIA_RECOVERY) {
    if (item.galleryId !== trimmed) continue;
    const caption = item.caption;
    return {
      id: item.galleryId,
      imageUrl: siteMediaImageKitUrl(item.fileName),
      title: caption,
      altText: caption,
      category: item.category,
      showInGallery: false,
      imageKitFileId: item.imageKitFileId ?? "",
      createdAt: "",
      updatedAt: "",
    };
  }

  return null;
}
