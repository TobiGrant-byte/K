"use client";

import { getFirebaseAuth } from "@/lib/firebase/config";
import { MAX_BLOG_IMAGES } from "@/lib/blog";
import {
  imageKitPublicKey,
  imageKitUrlEndpoint,
} from "@/lib/imagekit/config";

function isPendingImage(source: string): boolean {
  return source.startsWith("data:image/");
}

async function adminToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Your admin session has expired. Sign in again.");
  return user.getIdToken();
}

async function uploadAuthentication() {
  const response = await fetch("/api/imagekit/auth", {
    headers: { authorization: `Bearer ${await adminToken()}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(
      (await response.text()) || "Image upload authorization failed.",
    );
  }
  return (await response.json()) as {
    token: string;
    expire: number;
    signature: string;
  };
}

async function uploadImage(
  source: string | Blob,
  folder: string,
  fileNameHint?: string,
): Promise<{ url: string; fileId: string }> {
  const [authentication, blob] = await Promise.all([
    uploadAuthentication(),
    typeof source === "string"
      ? fetch(source).then(async (fileResponse) => {
          if (!fileResponse.ok) {
            throw new Error("Could not prepare the image for upload.");
          }
          return fileResponse.blob();
        })
      : Promise.resolve(source),
  ]);

  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/gif"
        ? "gif"
        : blob.type === "image/webp"
          ? "webp"
          : "jpg";
  const fileName =
    fileNameHint ||
    `image-${crypto.randomUUID()}.${ext === "jpg" ? "jpg" : ext}`;
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("fileName", fileName);
  formData.append("folder", folder);
  formData.append("publicKey", imageKitPublicKey);
  formData.append("token", authentication.token);
  formData.append("expire", String(authentication.expire));
  formData.append("signature", authentication.signature);
  formData.append("useUniqueFileName", "false");

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    },
  );
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `ImageKit upload failed (${response.status}).`);
  }

  const uploaded = (await response.json()) as {
    url?: string;
    fileId?: string;
  };
  if (
    !uploaded.url ||
    !uploaded.url.startsWith(imageKitUrlEndpoint.replace(/\/+$/, ""))
  ) {
    throw new Error("ImageKit returned an invalid image URL.");
  }
  return { url: uploaded.url, fileId: uploaded.fileId ?? "" };
}

/** Upload a cropped data-URL immediately (after crop), before publish. */
export async function uploadCroppedBlogImage(
  source: string,
  postId: string,
): Promise<string> {
  const uploaded = await uploadImage(source, `/blog/${postId}`);
  return uploaded.url;
}

/**
 * Upload an original file into the central Media Library ImageKit folder.
 * Does not crop — callers store the resulting URL on a gallery/{id} Firestore doc.
 */
export async function uploadGalleryMediaImage(
  file: File,
  mediaId: string,
): Promise<{ url: string; fileId: string }> {
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/gif"
        ? "gif"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const fileName = `${safeBase || "media"}-${mediaId.slice(0, 8)}.${ext}`;
  return uploadImage(file, `/gallery/${mediaId}`, fileName);
}

/**
 * Upload a site `/images/{fileName}` file into ImageKit `/site-media/{fileName}`.
 * Uses a stable path so fallbacks can reference the ImageKit URL in code.
 */
export async function uploadSiteMediaPublicFile(
  fileName: string,
): Promise<{ url: string; fileId: string }> {
  const publicPath = `/images/${fileName}`;
  const response = await fetch(publicPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not read ${publicPath} for ImageKit upload.`);
  }
  const blob = await response.blob();
  return uploadImage(blob, "/site-media", fileName);
}

export function isImageKitBlogUrl(url: string): boolean {
  const endpoint = imageKitUrlEndpoint.replace(/\/+$/, "");
  return url.startsWith(`${endpoint}/blog/`);
}

export type SyncedImages = {
  images: string[];
  coverImage?: string;
  removedImages: string[];
};

export async function syncPostImages({
  postId,
  imageSources,
  coverSource,
  previousImages,
}: {
  postId: string;
  imageSources: string[];
  coverSource?: string;
  previousImages: string[];
}): Promise<SyncedImages> {
  const uniqueSources = [...new Set(imageSources)].slice(0, MAX_BLOG_IMAGES);
  const sourceToUrl = new Map<string, string>();
  const newlyUploadedUrls: string[] = [];

  try {
    for (const source of uniqueSources) {
      if (!isPendingImage(source)) {
        sourceToUrl.set(source, source);
        continue;
      }
      const url = await uploadImage(source, `/blog/${postId}`).then(
        (uploaded) => uploaded.url,
      );
      sourceToUrl.set(source, url);
      newlyUploadedUrls.push(url);
    }
  } catch (error) {
    if (newlyUploadedUrls.length) {
      await deleteImageKitImages(newlyUploadedUrls).catch(console.error);
    }
    throw error;
  }

  const images = uniqueSources.map(
    (source) => sourceToUrl.get(source) ?? source,
  );
  const retainedExistingImages = uniqueSources.filter(
    (source) => !isPendingImage(source),
  );
  return {
    images,
    coverImage: coverSource
      ? (sourceToUrl.get(coverSource) ?? coverSource)
      : images[0],
    removedImages: previousImages.filter(
      (url) => !retainedExistingImages.includes(url),
    ),
  };
}

export async function deleteImageKitImages(urls: string[]): Promise<void> {
  const endpoint = imageKitUrlEndpoint.replace(/\/+$/, "");
  const imageKitUrls = urls.filter((url) =>
    url.startsWith(`${endpoint}/blog/`),
  );
  if (!imageKitUrls.length) return;

  const response = await fetch("/api/imagekit/delete", {
    method: "POST",
    headers: {
      authorization: `Bearer ${await adminToken()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ urls: imageKitUrls.slice(0, MAX_BLOG_IMAGES) }),
  });
  if (!response.ok) {
    throw new Error((await response.text()) || "ImageKit deletion failed.");
  }
}
