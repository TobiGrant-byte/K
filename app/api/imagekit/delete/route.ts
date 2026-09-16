import { NextResponse } from "next/server";
import { MAX_BLOG_IMAGES } from "@/lib/blog";
import {
  errorResponse,
  verifyFirebaseAdmin,
} from "@/lib/firebase/verify-admin-server";
import { deleteImageKitAsset } from "@/lib/imagekit/server";

export async function POST(request: Request) {
  try {
    await verifyFirebaseAdmin(request);
    const body = (await request.json()) as { urls?: unknown };
    if (
      !Array.isArray(body.urls) ||
      body.urls.some((url) => typeof url !== "string") ||
      body.urls.length > MAX_BLOG_IMAGES
    ) {
      return new Response(
        `Provide up to ${MAX_BLOG_IMAGES} valid image URLs.`,
        { status: 400 },
      );
    }

    if (body.urls.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    await Promise.all(body.urls.map((url) => deleteImageKitAsset(url)));
    return NextResponse.json({ deleted: body.urls.length });
  } catch (error) {
    return errorResponse(error);
  }
}
