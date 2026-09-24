import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import { imageKitUrlEndpoint } from "@/lib/imagekit/config";

const imageKitPrivateKey = "private_ur6ZjNxipETuZGEDGvna0v31ZBk=";

/** Max URLs accepted by the ImageKit delete API in one request. */
export const IMAGEKIT_DELETE_BATCH_MAX = 100;

export function createImageKitUploadAuthentication() {
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", imageKitPrivateKey)
    .update(token + expire)
    .digest("hex");
  return { token, expire, signature };
}

function imageKitAuthorization(): string {
  return `Basic ${Buffer.from(`${imageKitPrivateKey}:`).toString("base64")}`;
}

function imageKitPath(url: string): {
  folder: string;
  name: string;
  path: string;
} | null {
  const normalizedEndpoint = imageKitUrlEndpoint.replace(/\/+$/, "");
  if (!url.startsWith(`${normalizedEndpoint}/`)) {
    throw new Error("Only images from this ImageKit account can be deleted.");
  }

  const path = decodeURIComponent(
    url.slice(normalizedEndpoint.length).split("?")[0] ?? "",
  );
  // Hardcoded site fallbacks — never delete via Media Library / blog cleanup.
  if (path.startsWith("/site-media/") || path.startsWith("site-media/")) {
    return null;
  }

  const slash = path.lastIndexOf("/");
  if (slash <= 0) throw new Error("Invalid ImageKit image URL.");
  return {
    folder: path.slice(0, slash),
    name: path.slice(slash + 1),
    path,
  };
}

type ImageKitFile = {
  fileId: string;
  url: string;
  filePath?: string;
};

export async function deleteImageKitAsset(url: string): Promise<void> {
  const target = imageKitPath(url);
  if (!target) return;

  const params = new URLSearchParams({
    path: target.folder,
    name: target.name,
    limit: "100",
  });
  const listResponse = await fetch(
    `https://api.imagekit.io/v1/files?${params.toString()}`,
    {
      headers: { authorization: imageKitAuthorization() },
      cache: "no-store",
    },
  );

  if (!listResponse.ok) {
    throw new Error(`ImageKit file lookup failed (${listResponse.status}).`);
  }

  const files = (await listResponse.json()) as ImageKitFile[];
  const file = files.find(
    (item) => item.url === url || item.filePath === target.path,
  );
  if (!file) return;

  const deleteResponse = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(file.fileId)}`,
    {
      method: "DELETE",
      headers: { authorization: imageKitAuthorization() },
      cache: "no-store",
    },
  );
  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    throw new Error(`ImageKit deletion failed (${deleteResponse.status}).`);
  }
}

/** Prefer fileId when Media Library stored it — skips path lookup. */
export async function deleteImageKitAssetByFileId(
  fileId: string,
): Promise<void> {
  const id = fileId.trim();
  if (!id) return;
  const deleteResponse = await fetch(
    `https://api.imagekit.io/v1/files/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { authorization: imageKitAuthorization() },
      cache: "no-store",
    },
  );
  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    throw new Error(`ImageKit deletion failed (${deleteResponse.status}).`);
  }
}
