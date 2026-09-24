/**
 * Media Library delete guards — scan CMS content + blog posts for references.
 * CMS pages link via galleryImageId; posts link via cover/body image URLs.
 * Gallery visibility (showInGallery) is not a reference and does not block delete.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";
import { collectPostImageUrls } from "@/lib/blog";
import {
  firebaseConfigured,
  getFirebaseFirestore,
  missingFirebaseEnvironmentVariables,
} from "@/lib/firebase/config";
import type { MediaAsset } from "@/lib/media";

export type MediaUsageRef = {
  kind: "content" | "post";
  label: string;
};

const CONTENT_SCAN_TARGETS = [
  { id: "profile", label: "Profile" },
  { id: "research", label: "Research & Development" },
  { id: "publications", label: "Publications" },
  { id: "philanthropy", label: "Impacts" },
  { id: "achievements", label: "Achievements" },
] as const;

export class MediaInUseError extends Error {
  readonly blocked: Array<{ id: string; title: string; labels: string[] }>;
  /** Ids that were removed before this error (partial bulk delete). */
  readonly deletedIds: string[];

  constructor(
    blocked: Array<{ id: string; title: string; labels: string[] }>,
    deletedIds: string[] = [],
  ) {
    const removed =
      deletedIds.length > 0
        ? `Removed ${deletedIds.length} unused image${deletedIds.length === 1 ? "" : "s"}. `
        : "";
    const describe = (item: { id: string; title: string }) =>
      item.title.trim() || item.id;
    const detail = blocked
      .map((item) => {
        return `“${describe(item)}” is used on: ${item.labels.join(", ")}`;
      })
      .join(", ");
    const first = blocked[0];
    super(
      blocked.length === 1 && first
        ? `${removed}Could not delete this image “${describe(first)}” — it is being used on: ${first.labels.join(", ")}. Remove it from those pages first.`
        : `${removed}Could not delete ${blocked.length} images. ${detail}`,
    );
    this.name = "MediaInUseError";
    this.blocked = blocked;
    this.deletedIds = deletedIds;
  }
}

function requireFirebase() {
  if (!firebaseConfigured) {
    throw new Error(
      `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
    );
  }
}

/** Walk Firestore CMS payloads for galleryImageId links (no file scraping). */
export function collectGalleryImageIds(
  value: unknown,
  out: Set<string> = new Set(),
): Set<string> {
  if (value == null) return out;
  if (Array.isArray(value)) {
    for (const item of value) collectGalleryImageIds(item, out);
    return out;
  }
  if (typeof value !== "object") return out;
  const obj = value as Record<string, unknown>;
  const id = obj.galleryImageId;
  if (typeof id === "string" && id.trim()) {
    out.add(id.trim());
  }
  for (const child of Object.values(obj)) {
    collectGalleryImageIds(child, out);
  }
  return out;
}

function normalizeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
  } catch {
    return trimmed.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") ?? trimmed;
  }
}

function urlsReferToSameImage(a: string, b: string): boolean {
  if (!a.trim() || !b.trim()) return false;
  if (a === b) return true;
  const na = normalizeMediaUrl(a);
  const nb = normalizeMediaUrl(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // ImageKit transform path variants still share the same file path suffix.
  return na.includes(nb) || nb.includes(na);
}

function postUsesMediaAsset(
  post: {
    title: string;
    slug: string;
    coverImage?: string;
    excerpt: string;
    body: string;
  },
  asset: MediaAsset,
): boolean {
  const urls = collectPostImageUrls(
    post.coverImage,
    post.excerpt,
    post.body,
  );
  return urls.some((url) => urlsReferToSameImage(url, asset.imageUrl));
}

type ContentIndex = Array<{ label: string; ids: Set<string> }>;
type PostIndex = Array<{
  title: string;
  slug: string;
  coverImage?: string;
  excerpt: string;
  body: string;
}>;

async function loadContentIndex(): Promise<ContentIndex> {
  requireFirebase();
  const db = getFirebaseFirestore();
  const snaps = await Promise.all(
    CONTENT_SCAN_TARGETS.map((target) =>
      getDoc(doc(db, "content", target.id)),
    ),
  );
  return CONTENT_SCAN_TARGETS.map((target, index) => {
    const data = snaps[index]?.data() as DocumentData | undefined;
    const ids = new Set<string>();
    if (data) collectGalleryImageIds(data, ids);
    return { label: target.label, ids };
  });
}

async function loadPostIndex(): Promise<PostIndex> {
  requireFirebase();
  const result = await getDocs(
    query(
      collection(getFirebaseFirestore(), "posts"),
      orderBy("updatedAt", "desc"),
    ),
  );
  return result.docs.map((snap) => {
    const data = snap.data();
    return {
      title: String(data.title ?? ""),
      slug: String(data.slug ?? snap.id),
      coverImage: data.coverImage ? String(data.coverImage) : undefined,
      excerpt: String(data.excerpt ?? ""),
      body: String(data.body ?? ""),
    };
  });
}

function usagesForAsset(
  asset: MediaAsset,
  content: ContentIndex,
  posts: PostIndex,
): MediaUsageRef[] {
  const usages: MediaUsageRef[] = [];
  for (const doc of content) {
    if (doc.ids.has(asset.id)) {
      usages.push({ kind: "content", label: doc.label });
    }
  }
  for (const post of posts) {
    if (postUsesMediaAsset(post, asset)) {
      usages.push({
        kind: "post",
        label: `Blog: ${post.title.trim() || post.slug}`,
      });
    }
  }
  return usages;
}

/** Find every CMS / blog place that still references this Media Library asset. */
export async function findMediaUsages(
  asset: MediaAsset,
): Promise<MediaUsageRef[]> {
  const [content, posts] = await Promise.all([
    loadContentIndex(),
    loadPostIndex(),
  ]);
  return usagesForAsset(asset, content, posts);
}

/**
 * Batch usage scan (loads content + posts once).
 * Returns a map of asset id → usage list (empty when safe to delete).
 */
export async function findMediaUsagesForMany(
  assets: MediaAsset[],
): Promise<Map<string, MediaUsageRef[]>> {
  const map = new Map<string, MediaUsageRef[]>();
  if (!assets.length) return map;

  const [content, posts] = await Promise.all([
    loadContentIndex(),
    loadPostIndex(),
  ]);

  for (const asset of assets) {
    map.set(asset.id, usagesForAsset(asset, content, posts));
  }
  return map;
}

/**
 * Split assets into unused (safe to delete) vs referenced elsewhere.
 */
export async function partitionMediaByUsage(assets: MediaAsset[]): Promise<{
  free: MediaAsset[];
  blocked: Array<{ id: string; title: string; labels: string[] }>;
}> {
  if (!assets.length) return { free: [], blocked: [] };
  const usageMap = await findMediaUsagesForMany(assets);
  const free: MediaAsset[] = [];
  const blocked: Array<{ id: string; title: string; labels: string[] }> = [];

  for (const asset of assets) {
    const usages = usageMap.get(asset.id) ?? [];
    if (!usages.length) {
      free.push(asset);
      continue;
    }
    blocked.push({
      id: asset.id,
      title: asset.title,
      labels: [...new Set(usages.map((u) => u.label))],
    });
  }

  return { free, blocked };
}

/**
 * Throws MediaInUseError when any asset is referenced outside the Gallery.
 * Call before deleteMediaRecordsBatch when you need all-or-nothing.
 */
export async function assertMediaAssetsUnused(
  assets: MediaAsset[],
): Promise<void> {
  if (!assets.length) return;
  const { blocked } = await partitionMediaByUsage(assets);
  if (blocked.length) {
    throw new MediaInUseError(blocked);
  }
}
