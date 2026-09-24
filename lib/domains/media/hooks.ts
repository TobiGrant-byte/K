"use client";

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createId } from "@/lib/blog";
import { uploadGalleryMediaImage } from "@/lib/imagekit/images";
import { mediaKeys } from "@/lib/domains/media/keys";
import {
  retainAdminMediaListener,
  retainPublicGalleryListener,
} from "@/lib/domains/media/listeners";
import {
  createMediaRecordsBatch,
  deleteMediaAssetsIfUnused,
  importLegacySiteGallery,
  importLibraryOnlySiteMedia,
  removeLocalPublicMediaFromMediaLibrary,
  removeVideoAssetsFromMediaLibrary,
  setMediaVisibilityBatch,
  updateMediaRecordsBatch,
  type MediaAsset,
  type MediaMetadataInput,
  MediaInUseError,
  normalizeMediaMetadata,
  validateMediaFiles,
} from "@/lib/domains/media/service";
import { migrateSiteMediaToImageKit } from "@/lib/domains/media/migrate-site-media";
import { deleteImageKitMediaAssets } from "@/lib/imagekit/images";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const MEDIA_STALE = 5 * 60_000;

async function bumpPublicMedia() {
  await revalidatePublicSite("gallery");
}

/** Admin Media Library + Media Picker: shared list + one Firestore listener. */
export function useMediaLibrary() {
  const queryClient = useQueryClient();

  useEffect(() => retainAdminMediaListener(queryClient), [queryClient]);

  return useQuery({
    queryKey: mediaKeys.list(),
    queryFn: async () =>
      queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [],
    staleTime: MEDIA_STALE,
    refetchOnMount: false,
  });
}

/** Public Gallery source of truth (showInGallery). Shared listener + cache. */
export function usePublicGalleryMedia(initialData: MediaAsset[] = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData.length) {
      queryClient.setQueryData(mediaKeys.publicGallery(), initialData);
    }
    // Seed once from SSR; listener keeps cache fresh afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount seed
  }, [queryClient]);

  useEffect(() => retainPublicGalleryListener(queryClient), [queryClient]);

  return useQuery({
    queryKey: mediaKeys.publicGallery(),
    queryFn: async (): Promise<MediaAsset[]> =>
      queryClient.getQueryData<MediaAsset[]>(mediaKeys.publicGallery()) ?? [],
    staleTime: MEDIA_STALE,
    refetchOnMount: false,
    initialData: initialData as MediaAsset[],
  });
}

export function useMediaById(id: string | null | undefined) {
  const library = useMediaLibrary();
  const asset = id
    ? (library.data?.find((item) => item.id === id) ?? null)
    : null;

  return {
    ...library,
    data: asset,
    isPending: Boolean(id) && library.isPending,
  };
}

export type StagedMediaUpload = {
  id: string;
  imageUrl: string;
  imageKitFileId: string;
  fileName: string;
};

/**
 * Upload files to ImageKit only (no Firestore yet).
 * Caller stages metadata locally, then commits with useCreateMediaBatchMutation.
 */
export function useUploadMediaFilesMutation() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const validationError = validateMediaFiles(files);
      if (validationError) throw new Error(validationError);

      const staged: StagedMediaUpload[] = [];
      for (const file of files) {
        const id = createId();
        const uploaded = await uploadGalleryMediaImage(file, id);
        staged.push({
          id,
          imageUrl: uploaded.url,
          imageKitFileId: uploaded.fileId,
          fileName: file.name,
        });
      }
      return staged;
    },
  });
}

/** Persist staged uploads in one Firestore batch. */
export function useCreateMediaBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      items: Array<{
        id: string;
        imageUrl: string;
        imageKitFileId?: string;
        metadata: MediaMetadataInput;
      }>,
    ) => {
      const data = await createMediaRecordsBatch(items);
      await bumpPublicMedia();
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/** Import static /public Gallery into Media Library (keeps public files). */
export function useImportLegacyGalleryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const existing =
        queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [];
      const data = await importLegacySiteGallery(existing);
      await bumpPublicMedia();
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/** Import unpublished site assets (hobbies, etc.) into Media Library. */
export function useImportLibraryOnlyMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const existing =
        queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [];
      const data = await importLibraryOnlySiteMedia(existing);
      await bumpPublicMedia();
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/** Update many media records in one Firestore batch. */
export function useUpdateMediaBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      updates: Array<{ id: string; metadata: Partial<MediaMetadataInput> }>,
    ) => {
      const data = await updateMediaRecordsBatch(updates);
      await bumpPublicMedia();
      return data;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: mediaKeys.list() });
      const previous = queryClient.getQueryData<MediaAsset[]>(mediaKeys.list());
      const byId = new Map(updates.map((u) => [u.id, u.metadata]));
      queryClient.setQueryData<MediaAsset[]>(mediaKeys.list(), (prev) =>
        (prev ?? []).map((item) => {
          const patch = byId.get(item.id);
          if (!patch) return item;
          const next = normalizeMediaMetadata({
            title: patch.title ?? item.title,
            category: patch.category ?? item.category,
            altText: patch.altText ?? item.altText,
            showInGallery: patch.showInGallery ?? item.showInGallery,
            stripConfig: patch.stripConfig ?? item.stripConfig,
          });
          return { ...item, ...next, updatedAt: new Date().toISOString() };
        }),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(mediaKeys.list(), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/** Toggle visibility for many ids in one Firestore batch. */
export function useSetMediaVisibilityBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { ids: string[]; showInGallery: boolean }) => {
      const data = await setMediaVisibilityBatch(
        args.ids,
        args.showInGallery,
      );
      await bumpPublicMedia();
      return data;
    },
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey: mediaKeys.list() });
      const previous = queryClient.getQueryData<MediaAsset[]>(mediaKeys.list());
      const idSet = new Set(args.ids);
      queryClient.setQueryData<MediaAsset[]>(mediaKeys.list(), (prev) =>
        (prev ?? []).map((item) =>
          idSet.has(item.id)
            ? {
                ...item,
                showInGallery: args.showInGallery,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(mediaKeys.list(), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/**
 * Delete Media Library records that are unused by CMS / blog.
 * Deletes free assets first (Firestore, then ImageKit); if any remain linked,
 * throws MediaInUseError (includes deletedIds so the UI can refresh partial success).
 */
export function useDeleteMediaBatchMutation() {
  const queryClient = useQueryClient();

  const dropFromCache = (ids: string[]) => {
    if (!ids.length) return;
    const idSet = new Set(ids);
    queryClient.setQueryData<MediaAsset[]>(mediaKeys.list(), (prev) =>
      (prev ?? []).filter((item) => !idSet.has(item.id)),
    );
    void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
  };

  const purgeImageKit = async (
    assets: MediaAsset[],
    deletedIds: string[],
  ) => {
    const removed = assets.filter((asset) => deletedIds.includes(asset.id));
    if (!removed.length) return;
    await deleteImageKitMediaAssets(removed).catch((error) => {
      console.error("ImageKit cleanup after media delete failed", error);
    });
  };

  return useMutation({
    mutationFn: async (assets: MediaAsset[]) => {
      try {
        const result = await deleteMediaAssetsIfUnused(assets);
        await purgeImageKit(assets, result.deletedIds);
        await bumpPublicMedia();
        return result;
      } catch (error) {
        if (
          error instanceof MediaInUseError &&
          error.deletedIds.length > 0
        ) {
          await purgeImageKit(assets, error.deletedIds);
          await bumpPublicMedia().catch(() => undefined);
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      dropFromCache(result.deletedIds);
    },
    onError: (error) => {
      if (error instanceof MediaInUseError) {
        dropFromCache(error.deletedIds);
      }
    },
  });
}

/**
 * One-shot cleanup: drop video URLs that were imported into Media Library by mistake.
 * Does not delete /public files.
 */
export function useRemoveVideoMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const existing =
        queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [];
      const data = await removeVideoAssetsFromMediaLibrary(existing);
      await bumpPublicMedia();
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/**
 * One-shot cleanup: drop Media Library rows that only point at /public paths.
 * Keeps real ImageKit uploads stored in Firebase.
 */
export function useRemoveLocalPublicMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const existing =
        queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [];
      const data = await removeLocalPublicMediaFromMediaLibrary(existing);
      await bumpPublicMedia();
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

/**
 * Upload all catalogued public/images files to ImageKit and write Firebase
 * gallery docs using the original legacy-* ids (keeps CMS crops / selections).
 */
export function useMigrateSiteMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const existing =
        queryClient.getQueryData<MediaAsset[]>(mediaKeys.list()) ?? [];
      const data = await migrateSiteMediaToImageKit(existing);
      await Promise.all([
        revalidatePublicSite("gallery"),
        revalidatePublicSite("profile"),
        revalidatePublicSite("research"),
        revalidatePublicSite("publications"),
      ]);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}
