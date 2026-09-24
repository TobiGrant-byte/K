export {
  createMediaRecord,
  createMediaRecordsBatch,
  deleteMediaAssetsIfUnused,
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
  MediaInUseError,
  assertMediaAssetsUnused,
  findMediaUsages,
  findMediaUsagesForMany,
  partitionMediaByUsage,
  type MediaUsageRef,
} from "@/lib/domains/media/media-usage";
export {
  GALLERY_CATEGORIES,
  FEATURED_STRIP_IMAGE_ASPECT,
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
  isImageKitMediaUrl,
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
  PRESS_MEDIA_RECOVERY,
  knownHostedMediaAsset,
} from "@/lib/domains/media/press-media-recovery";
export {
  DEFAULT_IMAGE_DISPLAY_CONFIG,
  IMAGE_DISPLAY_MAX_ZOOM,
  IMAGE_DISPLAY_MIN_ZOOM,
  computeImageCoverLayout,
  createMediaImageRef,
  imageDisplayPositionCss,
  imageDisplayStyle,
  normalizeImageDisplayConfig,
  type ImageCoverLayout,
  type ImageDisplayConfig,
  type MediaImageRef,
} from "@/lib/domains/media/display";
