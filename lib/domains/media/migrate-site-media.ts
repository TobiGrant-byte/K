import {
  SITE_MEDIA_MIGRATION,
  siteMediaImageKitUrl,
} from "@/lib/domains/media/site-media-migration";
import { PRESS_MEDIA_RECOVERY } from "@/lib/domains/media/press-media-recovery";
import {
  isLocalPublicMediaUrl,
  legacyGalleryId,
} from "@/lib/domains/media/legacy-gallery";
import { uploadSiteMediaPublicFile } from "@/lib/imagekit/images";
import {
  createMediaRecordsBatch,
  type MediaAsset,
} from "@/lib/domains/media/service";
import { normalizeMediaMetadata } from "@/lib/media";
import { DEFAULT_IMAGE_DISPLAY_CONFIG } from "@/lib/domains/media/display";

function isImageKitUrl(url: string): boolean {
  return /imagekit\.io/i.test(url) && !isLocalPublicMediaUrl(url);
}

function urlForFileName(urls: Iterable<string>, fileName: string): string | null {
  for (const url of urls) {
    if (
      url.includes(`/site-media/${fileName}`) ||
      url.includes(`/site-media/${encodeURIComponent(fileName)}`)
    ) {
      return url;
    }
  }
  return null;
}

type MigrationTarget = {
  fileName: string;
  galleryId: string;
  caption: string;
  category: MediaAsset["category"];
  showInGallery: boolean;
  imageKitFileId?: string;
};

function migrationTargets(): MigrationTarget[] {
  const fromCatalog: MigrationTarget[] = SITE_MEDIA_MIGRATION.map((item) => ({
    fileName: item.fileName,
    galleryId: legacyGalleryId(`/images/${item.fileName}`),
    caption: item.caption,
    category: item.category,
    showInGallery: item.showInGallery,
  }));
  const fromPress: MigrationTarget[] = PRESS_MEDIA_RECOVERY.map((item) => ({
    fileName: item.fileName,
    galleryId: item.galleryId,
    caption: item.caption,
    category: item.category,
    showInGallery: false,
    imageKitFileId: item.imageKitFileId,
  }));
  return [...fromCatalog, ...fromPress];
}

async function imageKitFileExists(fileName: string): Promise<boolean> {
  try {
    const response = await fetch(siteMediaImageKitUrl(fileName), {
      method: "HEAD",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Upload public site images to ImageKit and write Firebase gallery docs.
 *
 * Uses the original `legacy-{filename}` document IDs so Profile / Research /
 * Publications / Gallery selections (galleryImageId + imageConfig crops) keep
 * working after the old /images/ URL rows were removed.
 *
 * Also restores recovered press hotlink images under their publications CMS ids.
 */
export async function migrateSiteMediaToImageKit(
  existing: MediaAsset[],
): Promise<{ uploaded: number; linked: number; skipped: number; failed: string[] }> {
  const byId = new Map(existing.map((item) => [item.id, item]));
  const urls = new Set(existing.map((item) => item.imageUrl));
  let uploaded = 0;
  let linked = 0;
  let skipped = 0;
  const failed: string[] = [];
  const pending: Array<{
    id: string;
    imageUrl: string;
    imageKitFileId?: string;
    metadata: ReturnType<typeof normalizeMediaMetadata>;
  }> = [];

  for (const item of migrationTargets()) {
    const id = item.galleryId;
    const current = byId.get(id);
    const description = item.caption.trim();
    const meta = normalizeMediaMetadata({
      title: description || item.fileName,
      altText: description || item.fileName,
      category: item.category,
      showInGallery: item.showInGallery,
    });

    // Already a real ImageKit row under the same CMS id — leave it alone.
    if (current && isImageKitUrl(current.imageUrl)) {
      skipped += 1;
      continue;
    }

    const existingHostedUrl =
      urlForFileName(urls, item.fileName) ??
      ((await imageKitFileExists(item.fileName))
        ? siteMediaImageKitUrl(item.fileName)
        : null);

    // If this file is already on ImageKit under another doc, re-link the legacy id
    // (preserves CMS galleryImageId refs) without re-uploading.
    const hostedDoc = existing.find(
      (asset) =>
        isImageKitUrl(asset.imageUrl) &&
        (asset.imageUrl.includes(`/site-media/${item.fileName}`) ||
          asset.imageUrl.includes(
            `/site-media/${encodeURIComponent(item.fileName)}`,
          )),
    );

    if (hostedDoc || (existingHostedUrl && isImageKitUrl(existingHostedUrl))) {
      const imageUrl = hostedDoc?.imageUrl ?? existingHostedUrl!;
      pending.push({
        id,
        imageUrl,
        imageKitFileId:
          hostedDoc?.imageKitFileId || item.imageKitFileId || "",
        metadata: meta,
      });
      linked += 1;
      urls.add(imageUrl);
      byId.set(id, {
        id,
        imageUrl,
        title: meta.title,
        altText: meta.altText,
        category: meta.category,
        showInGallery: meta.showInGallery,
        stripConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        imageKitFileId: hostedDoc?.imageKitFileId || item.imageKitFileId || "",
        createdAt: "",
        updatedAt: "",
      });
      continue;
    }

    try {
      const { url, fileId } = await uploadSiteMediaPublicFile(item.fileName);
      pending.push({
        id,
        imageUrl: url,
        imageKitFileId: fileId,
        metadata: meta,
      });
      uploaded += 1;
      urls.add(url);
      byId.set(id, {
        id,
        imageUrl: url,
        title: meta.title,
        altText: meta.altText,
        category: meta.category,
        showInGallery: meta.showInGallery,
        stripConfig: { ...DEFAULT_IMAGE_DISPLAY_CONFIG },
        imageKitFileId: fileId,
        createdAt: "",
        updatedAt: "",
      });
    } catch (error) {
      failed.push(
        `${item.fileName}: ${error instanceof Error ? error.message : "upload failed"}`,
      );
    }
  }

  const chunkSize = 40;
  for (let i = 0; i < pending.length; i += chunkSize) {
    await createMediaRecordsBatch(pending.slice(i, i + chunkSize));
  }

  return { uploaded, linked, skipped, failed };
}
