import { NextResponse } from "next/server";
import {
  errorResponse,
  verifyFirebaseAdmin,
} from "@/lib/firebase/verify-admin-server";
import {
  deleteImageKitAsset,
  deleteImageKitAssetByFileId,
  IMAGEKIT_DELETE_BATCH_MAX,
} from "@/lib/imagekit/server";

export async function POST(request: Request) {
  try {
    await verifyFirebaseAdmin(request);
    const body = (await request.json()) as {
      urls?: unknown;
      fileIds?: unknown;
    };

    const urls = Array.isArray(body.urls)
      ? body.urls.filter((url): url is string => typeof url === "string")
      : [];
    const fileIds = Array.isArray(body.fileIds)
      ? body.fileIds.filter((id): id is string => typeof id === "string")
      : [];

    if (
      urls.length + fileIds.length === 0 ||
      urls.length + fileIds.length > IMAGEKIT_DELETE_BATCH_MAX
    ) {
      return new Response(
        `Provide up to ${IMAGEKIT_DELETE_BATCH_MAX} ImageKit urls and/or file ids.`,
        { status: 400 },
      );
    }

    await Promise.all([
      ...urls.map((url) => deleteImageKitAsset(url)),
      ...fileIds.map((id) => deleteImageKitAssetByFileId(id)),
    ]);
    return NextResponse.json({
      deleted: urls.length + fileIds.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
