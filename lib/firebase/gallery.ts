import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import {
  firebaseConfigured,
  getFirebaseFirestore,
  missingFirebaseEnvironmentVariables,
} from "@/lib/firebase/config";
import {
  isGalleryCategory,
  type GalleryCategory,
  type MediaAsset,
  type MediaMetadataInput,
  normalizeMediaMetadata,
} from "@/lib/media";
import {
  LEGACY_SITE_GALLERY,
  LIBRARY_ONLY_SITE_MEDIA,
  isLocalPublicMediaUrl,
  isVideoMediaUrl,
  legacyGalleryId,
} from "@/lib/domains/media/legacy-gallery";

function dateString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mediaFromData(id: string, data: DocumentData): MediaAsset {
  const categoryRaw = String(data.category ?? "Moments");
  const category: GalleryCategory = isGalleryCategory(categoryRaw)
    ? categoryRaw
    : "Moments";
  const description = String(data.title ?? data.altText ?? "").trim();
  return {
    id,
    imageUrl: String(data.imageUrl ?? ""),
    title: description,
    category,
    altText: description,
    showInGallery: Boolean(data.showInGallery),
    imageKitFileId: String(data.imageKitFileId ?? ""),
    createdAt: dateString(data.createdAt),
    updatedAt: dateString(data.updatedAt),
  };
}

function mediaFromSnapshot(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): MediaAsset {
  return mediaFromData(snapshot.id, snapshot.data());
}

function requireFirebase() {
  if (!firebaseConfigured) {
    throw new Error(
      `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
    );
  }
}

/** Admin: all media assets, newest updates first. */
export function subscribeToAllMedia(
  onMedia: (items: MediaAsset[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured) {
    onError(
      new Error(
        `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
      ),
    );
    return () => undefined;
  }
  const mediaQuery = query(
    collection(getFirebaseFirestore(), "gallery"),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(
    mediaQuery,
    (snap) => onMedia(snap.docs.map(mediaFromSnapshot)),
    (error) => onError(error),
  );
}

/** Public Gallery: only assets marked showInGallery. */
export function subscribeToPublicGalleryMedia(
  onMedia: (items: MediaAsset[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  if (!firebaseConfigured) {
    onError(
      new Error(
        `Missing Firebase environment variables: ${missingFirebaseEnvironmentVariables.join(", ")}`,
      ),
    );
    return () => undefined;
  }
  const mediaQuery = query(
    collection(getFirebaseFirestore(), "gallery"),
    where("showInGallery", "==", true),
  );
  return onSnapshot(
    mediaQuery,
    (snap) => {
      const items = snap.docs
        .map(mediaFromSnapshot)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      onMedia(items);
    },
    (error) => onError(error),
  );
}

/** One-shot public fetch for SSR / SEO hydration (no listener). */
export async function fetchPublicGalleryMedia(): Promise<MediaAsset[]> {
  if (!firebaseConfigured) return [];
  const mediaQuery = query(
    collection(getFirebaseFirestore(), "gallery"),
    where("showInGallery", "==", true),
  );
  const snap = await getDocs(mediaQuery);
  return snap.docs
    .map(mediaFromSnapshot)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Resolve a single Media Library asset by id (SSR / CMS image refs). */
export async function fetchMediaAssetById(
  id: string,
): Promise<MediaAsset | null> {
  if (!firebaseConfigured || !id.trim()) return null;
  try {
    const snap = await getDoc(doc(getFirebaseFirestore(), "gallery", id.trim()));
    if (!snap.exists()) return null;
    return mediaFromData(snap.id, snap.data());
  } catch {
    return null;
  }
}

export async function createMediaRecord(args: {
  id: string;
  imageUrl: string;
  imageKitFileId?: string;
  metadata: MediaMetadataInput;
}): Promise<void> {
  requireFirebase();
  const meta = normalizeMediaMetadata(args.metadata);
  const ref = doc(getFirebaseFirestore(), "gallery", args.id);
  await setDoc(ref, {
    imageUrl: args.imageUrl,
    title: meta.title,
    category: meta.category,
    altText: meta.altText,
    showInGallery: meta.showInGallery,
    imageKitFileId: args.imageKitFileId ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Create many gallery docs in a single Firestore batch commit. */
export async function createMediaRecordsBatch(
  items: Array<{
    id: string;
    imageUrl: string;
    imageKitFileId?: string;
    metadata: MediaMetadataInput;
  }>,
): Promise<void> {
  requireFirebase();
  if (!items.length) return;
  if (items.length > 500) {
    throw new Error("Too many images to save in one batch.");
  }
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  for (const item of items) {
    const meta = normalizeMediaMetadata(item.metadata);
    batch.set(doc(db, "gallery", item.id), {
      imageUrl: item.imageUrl,
      title: meta.title,
      category: meta.category,
      altText: meta.altText,
      showInGallery: meta.showInGallery,
      imageKitFileId: item.imageKitFileId ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

/**
 * Import the existing /public site Gallery into Media Library.
 * Keeps public files in place; points imageUrl at those paths.
 * Idempotent: skips ids / urls already present.
 */
export async function importLegacySiteGallery(
  existing: MediaAsset[],
): Promise<{ created: number; skipped: number }> {
  requireFirebase();
  const existingIds = new Set(existing.map((item) => item.id));
  const existingUrls = new Set(existing.map((item) => item.imageUrl));

  const toCreate = LEGACY_SITE_GALLERY.filter((item) => {
    const id = legacyGalleryId(item.src);
    return !existingIds.has(id) && !existingUrls.has(item.src);
  }).map((item) => {
    const description = item.caption.trim();
    return {
      id: legacyGalleryId(item.src),
      imageUrl: item.src,
      imageKitFileId: "",
      metadata: normalizeMediaMetadata({
        title: description,
        altText: description,
        category: item.category,
        showInGallery: true,
      }),
    };
  });

  if (toCreate.length) {
    await createMediaRecordsBatch(toCreate);
  }

  return {
    created: toCreate.length,
    skipped: LEGACY_SITE_GALLERY.length - toCreate.length,
  };
}

/**
 * Import library-only site images (e.g. hobbies) into Media Library.
 * showInGallery stays false — public Gallery is unaffected.
 * Idempotent: skips ids / urls already present.
 */
export async function importLibraryOnlySiteMedia(
  existing: MediaAsset[],
): Promise<{ created: number; skipped: number }> {
  requireFirebase();
  const existingIds = new Set(existing.map((item) => item.id));
  const existingUrls = new Set(existing.map((item) => item.imageUrl));

  const toCreate = LIBRARY_ONLY_SITE_MEDIA.filter((item) => {
    const id = legacyGalleryId(item.src);
    return !existingIds.has(id) && !existingUrls.has(item.src);
  }).map((item) => {
    const description = item.caption.trim();
    return {
      id: legacyGalleryId(item.src),
      imageUrl: item.src,
      imageKitFileId: "",
      metadata: normalizeMediaMetadata({
        title: description,
        altText: description,
        category: item.category,
        showInGallery: false,
      }),
    };
  });

  if (toCreate.length) {
    await createMediaRecordsBatch(toCreate);
  }

  return {
    created: toCreate.length,
    skipped: LIBRARY_ONLY_SITE_MEDIA.length - toCreate.length,
  };
}

export async function updateMediaMetadata(
  id: string,
  metadata: Partial<MediaMetadataInput>,
): Promise<void> {
  requireFirebase();
  const ref = doc(getFirebaseFirestore(), "gallery", id);
  const patch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (metadata.title !== undefined || metadata.altText !== undefined) {
    const description = (metadata.title ?? metadata.altText ?? "").trim();
    patch.title = description;
    patch.altText = description;
  }
  if (metadata.category !== undefined) {
    if (!isGalleryCategory(metadata.category)) {
      throw new Error("Invalid gallery category.");
    }
    patch.category = metadata.category;
  }
  if (metadata.showInGallery !== undefined) {
    patch.showInGallery = Boolean(metadata.showInGallery);
  }
  await updateDoc(ref, patch);
}

/** Update many media docs in a single Firestore batch commit. */
export async function updateMediaRecordsBatch(
  updates: Array<{ id: string; metadata: Partial<MediaMetadataInput> }>,
): Promise<void> {
  requireFirebase();
  if (!updates.length) return;
  if (updates.length > 500) {
    throw new Error("Too many images to update in one batch.");
  }
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  for (const item of updates) {
    const patch: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (
      item.metadata.title !== undefined ||
      item.metadata.altText !== undefined
    ) {
      const description = (
        item.metadata.title ??
        item.metadata.altText ??
        ""
      ).trim();
      patch.title = description;
      patch.altText = description;
    }
    if (item.metadata.category !== undefined) {
      if (!isGalleryCategory(item.metadata.category)) {
        throw new Error("Invalid gallery category.");
      }
      patch.category = item.metadata.category;
    }
    if (item.metadata.showInGallery !== undefined) {
      patch.showInGallery = Boolean(item.metadata.showInGallery);
    }
    batch.update(doc(db, "gallery", item.id), patch);
  }
  await batch.commit();
}

/** Set showInGallery for many docs in one Firestore batch. */
export async function setMediaVisibilityBatch(
  ids: string[],
  showInGallery: boolean,
): Promise<void> {
  requireFirebase();
  if (!ids.length) return;
  if (ids.length > 500) {
    throw new Error("Too many images to update in one batch.");
  }
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.update(doc(db, "gallery", id), {
      showInGallery,
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

/** Delete Media Library records only (does not delete public / ImageKit files). */
export async function deleteMediaRecordsBatch(ids: string[]): Promise<void> {
  requireFirebase();
  if (!ids.length) return;
  if (ids.length > 500) {
    throw new Error("Too many images to delete in one batch.");
  }
  const db = getFirebaseFirestore();
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.delete(doc(db, "gallery", id));
  }
  await batch.commit();
}

/**
 * Remove Media Library rows that only point at /public image paths.
 * Real uploads live on ImageKit; those docs are kept.
 * Does not delete files from disk or ImageKit.
 */
export async function removeLocalPublicMediaFromMediaLibrary(
  existing: MediaAsset[],
): Promise<number> {
  const localIds = existing
    .filter((item) => isLocalPublicMediaUrl(item.imageUrl))
    .map((item) => item.id);
  if (!localIds.length) return 0;
  await deleteMediaRecordsBatch(localIds);
  return localIds.length;
}

/**
 * Remove video URLs that were mistakenly imported as Media Library images.
 * Public files are left untouched.
 */
export async function removeVideoAssetsFromMediaLibrary(
  existing: MediaAsset[],
): Promise<number> {
  const videoIds = existing
    .filter((item) => isVideoMediaUrl(item.imageUrl))
    .map((item) => item.id);
  if (!videoIds.length) return 0;
  await deleteMediaRecordsBatch(videoIds);
  return videoIds.length;
}
