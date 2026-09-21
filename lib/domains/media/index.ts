export { mediaKeys } from "@/lib/domains/media/keys";
export * from "@/lib/domains/media/service";
export {
  useCreateMediaBatchMutation,
  useImportLegacyGalleryMutation,
  useImportLibraryOnlyMediaMutation,
  useMediaById,
  useMediaLibrary,
  usePublicGalleryMedia,
  useRemoveVideoMediaMutation,
  useSetMediaVisibilityBatchMutation,
  useUpdateMediaBatchMutation,
  useUploadMediaFilesMutation,
  type StagedMediaUpload,
} from "@/lib/domains/media/hooks";
