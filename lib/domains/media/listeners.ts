import type { QueryClient } from "@tanstack/react-query";
import { mediaKeys } from "@/lib/domains/media/keys";
import {
  subscribeToAllMedia,
  subscribeToPublicGalleryMedia,
  type MediaAsset,
} from "@/lib/domains/media/service";

type RetainEntry = {
  count: number;
  unsub: (() => void) | null;
};

const adminMediaRetain: RetainEntry = { count: 0, unsub: null };
const publicGalleryRetain: RetainEntry = { count: 0, unsub: null };

/**
 * Ref-counted realtime listener for the full Media Library.
 * Admin Media Library + Media Picker share one Firestore subscription.
 */
export function retainAdminMediaListener(queryClient: QueryClient): () => void {
  adminMediaRetain.count += 1;
  if (!adminMediaRetain.unsub) {
    adminMediaRetain.unsub = subscribeToAllMedia(
      (items: MediaAsset[]) => {
        queryClient.setQueryData(mediaKeys.list(), items);
        for (const item of items) {
          queryClient.setQueryData(mediaKeys.detail(item.id), item);
        }
      },
      (error) => {
        queryClient.setQueryData(mediaKeys.list(), [] as MediaAsset[]);
        console.error("[media] admin list listener:", error.message);
      },
    );
  }
  return () => {
    adminMediaRetain.count = Math.max(0, adminMediaRetain.count - 1);
    if (adminMediaRetain.count === 0 && adminMediaRetain.unsub) {
      adminMediaRetain.unsub();
      adminMediaRetain.unsub = null;
    }
  };
}

/** Public Gallery: showInGallery == true only. Unused until public page is wired. */
export function retainPublicGalleryListener(
  queryClient: QueryClient,
): () => void {
  publicGalleryRetain.count += 1;
  if (!publicGalleryRetain.unsub) {
    publicGalleryRetain.unsub = subscribeToPublicGalleryMedia(
      (items: MediaAsset[]) => {
        queryClient.setQueryData(mediaKeys.publicGallery(), items);
      },
      (error) => {
        queryClient.setQueryData(
          mediaKeys.publicGallery(),
          [] as MediaAsset[],
        );
        console.error("[media] public gallery listener:", error.message);
      },
    );
  }
  return () => {
    publicGalleryRetain.count = Math.max(0, publicGalleryRetain.count - 1);
    if (publicGalleryRetain.count === 0 && publicGalleryRetain.unsub) {
      publicGalleryRetain.unsub();
      publicGalleryRetain.unsub = null;
    }
  };
}
