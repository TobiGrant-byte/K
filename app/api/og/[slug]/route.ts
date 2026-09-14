import { NextResponse } from "next/server";
import { toShareJpegUrl } from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  const source = post?.coverImage || post?.images[0];

  if (!source) {
    return NextResponse.redirect(new URL("/images/hero-picture.jpeg", "https://dr-okafor.com"), 302);
  }

  const jpegUrl = toShareJpegUrl(source);
  const upstream = await fetch(jpegUrl, {
    headers: { Accept: "image/jpeg,image/*,*/*" },
    next: { revalidate: 3600 },
  });

  if (!upstream.ok) {
    return new NextResponse("Share image unavailable", { status: 404 });
  }

  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "Content-Length": String(bytes.byteLength),
    },
  });
}
