import "server-only";

import { createHmac, randomUUID } from "node:crypto";

function privateKey(): string {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new Error("IMAGEKIT_PRIVATE_KEY is not configured.");
  return key;
}

export function createImageKitUploadAuthentication() {
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", privateKey())
    .update(token + expire)
    .digest("hex");
  return { token, expire, signature };
}

function imageKitAuthorization(): string {
  return `Basic ${Buffer.from(`${privateKey()}:`).toString("base64")}`;
}

function imageKitPath(url: string): { folder: string; name: string; path: string } {
  const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not configured.");
  }

  const normalizedEndpoint = endpoint.replace(/\/+$/, "");
  if (!url.startsWith(`${normalizedEndpoint}/blog/`)) {
    throw new Error("Only blog images from this ImageKit account can be deleted.");
  }

  const path = decodeURIComponent(url.slice(normalizedEndpoint.length).split("?")[0]);
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
