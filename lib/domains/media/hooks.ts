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
  importLegacySiteGallery,
  importLibraryOnlySiteMedia,
  removeLocalPublicMediaFromMediaLibrary,
  removeVideoAssetsFromMediaLibrary,
  setMediaVisibilityBatch,
  updateMediaRecordsBatch,
  type MediaAsset,
  type MediaMetadataInput,
  normalizeMediaMetadata,
  validateMediaFiles,
} from "@/lib/domains/media/service";
import { migrateSiteMediaToImageKit } from "@/lib/domains/media/migrate-site-media";
import { knownHostedMediaAsset } from "@/lib/domains/media/press-media-recovery";
import { revalidatePublicSite } from "@/lib/cms/revalidate-client";

const MEDIA_STALE = 5 * 60_000;

function bumpPublicMedia() {
  void revalidatePublicSite("gallery");
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
  const fromLibrary = id
    ? (library.data?.find((item) => item.id === id) ?? null)
    : null;
  const asset =
    fromLibrary ??
    (id ? knownHostedMediaAsset(id) : null);

  return {
    ...library,
    data: asset,
    isPending: Boolean(id) && library.isPending && !asset,
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
    mutationFn: (
      items: Array<{
        id: string;
        imageUrl: string;
        imageKitFileId?: string;
        metadata: MediaMetadataInput;
      }>,
    ) => createMediaRecordsBatch(items),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
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
      return importLegacySiteGallery(existing);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
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
      return importLibraryOnlySiteMedia(existing);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
    },
  });
}

/** Update many media records in one Firestore batch. */
export function useUpdateMediaBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      updates: Array<{ id: string; metadata: Partial<MediaMetadataInput> }>,
    ) => updateMediaRecordsBatch(updates),
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
      bumpPublicMedia();
    },
  });
}

/** Toggle visibility for many ids in one Firestore batch. */
export function useSetMediaVisibilityBatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { ids: string[]; showInGallery: boolean }) =>
      setMediaVisibilityBatch(args.ids, args.showInGallery),
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
      bumpPublicMedia();
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
      return removeVideoAssetsFromMediaLibrary(existing);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
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
      return removeLocalPublicMediaFromMediaLibrary(existing);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
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
      return migrateSiteMediaToImageKit(existing);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: mediaKeys.all });
      bumpPublicMedia();
      void revalidatePublicSite("gallery");
      void revalidatePublicSite("profile");
      void revalidatePublicSite("research");
      void revalidatePublicSite("publications");
    },
  });
}
