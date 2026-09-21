export {
  createMediaRecord,
  createMediaRecordsBatch,
  deleteMediaRecordsBatch,
  fetchMediaAssetById,
  fetchPublicGalleryMedia,
  importLegacySiteGallery,
  importLibraryOnlySiteMedia,
  removeLocalPublicMediaFromMediaLibrary,
  removeVideoAssetsFromMediaLibrary,
  setMediaVisibilityBatch,
  subscribeToAllMedia,
  subscribeToPublicGalleryMedia,
  updateMediaMetadata,
  updateMediaRecordsBatch,
} from "@/lib/firebase/gallery";
export type { MediaAsset, MediaMetadataInput, GalleryCategory } from "@/lib/media";
export {
  GALLERY_CATEGORIES,
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_BYTES,
  MEDIA_MAX_UPLOAD_COUNT,
  normalizeMediaMetadata,
  validateMediaFile,
  validateMediaFiles,
} from "@/lib/media";
export {
  LEGACY_SITE_GALLERY,
  LIBRARY_ONLY_SITE_MEDIA,
  PUBLIC_GALLERY_STATIC_VIDEO,
  isLocalPublicMediaUrl,
  isVideoMediaUrl,
  legacyGalleryId,
  presentationForMediaUrl,
} from "@/lib/domains/media/legacy-gallery";
export {
  SITE_MEDIA_MIGRATION,
  siteMediaDocId,
  siteMediaImageKitUrl,
} from "@/lib/domains/media/site-media-migration";
export {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  IMAGE_DISPLAY_MAX_ZOOM,
  IMAGE_DISPLAY_MIN_ZOOM,
  createMediaImageRef,
  imageDisplayPositionCss,
  imageDisplayStyle,
  normalizeImageDisplayConfig,
  type ImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";