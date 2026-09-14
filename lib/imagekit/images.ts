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

async function uploadImage(source: string, postId: string): Promise<string> {
  const [authentication, fileResponse] = await Promise.all([
    uploadAuthentication(),
    fetch(source),
  ]);
  if (!fileResponse.ok) throw new Error("Could not prepare the cropped image.");

  const fileName = `image-${crypto.randomUUID()}.webp`;
  const formData = new FormData();
  formData.append("file", await fileResponse.blob(), fileName);
  formData.append("fileName", fileName);
  formData.append("folder", `/blog/${postId}`);
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

  const uploaded = (await response.json()) as { url?: string };
  if (
    !uploaded.url ||
    !uploaded.url.startsWith(imageKitUrlEndpoint.replace(/\/+$/, ""))
  ) {
    throw new Error("ImageKit returned an invalid image URL.");
  }
  return uploaded.url;
}

/** Upload a cropped data-URL immediately (after crop), before publish. */
export async function uploadCroppedBlogImage(
  source: string,
  postId: string,
): Promise<string> {
  return uploadImage(source, postId);
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
      const url = await uploadImage(source, postId);
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
