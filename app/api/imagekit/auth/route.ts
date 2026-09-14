import { NextResponse } from "next/server";
import {
  errorResponse,
  verifyFirebaseAdmin,
} from "@/lib/firebase/verify-admin-server";
import { createImageKitUploadAuthentication } from "@/lib/imagekit/server";

export async function GET(request: Request) {
  try {
    await verifyFirebaseAdmin(request);
    return NextResponse.json(createImageKitUploadAuthentication(), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
