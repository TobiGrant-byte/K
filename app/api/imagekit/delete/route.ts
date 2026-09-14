import { NextResponse } from "next/server";
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
      body.urls.length > 3
    ) {
      return new Response("Provide up to 3 valid image URLs.", { status: 400 });
    }

    await Promise.all(body.urls.map((url) => deleteImageKitAsset(url)));
    return NextResponse.json({ deleted: body.urls.length });
  } catch (error) {
    return errorResponse(error);
  }
}
