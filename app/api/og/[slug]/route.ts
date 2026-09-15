import { NextResponse } from "next/server";
import { SITE_URL, toShareJpegUrl } from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

/** Fallback image endpoint — metadata now points at ImageKit directly. */
export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  const source = post?.coverImage || post?.images[0];

  if (!source) {
    return NextResponse.redirect(`${SITE_URL}/images/hero-picture.jpeg`, 302);
  }

  return NextResponse.redirect(toShareJpegUrl(source), 302);
}
