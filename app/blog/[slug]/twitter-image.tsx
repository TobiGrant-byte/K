import { BLOG_IMAGE_HEIGHT, BLOG_IMAGE_WIDTH } from "@/lib/blog";
import { createBlogShareImage } from "./share-image";

export const runtime = "nodejs";
export const alt = "Blog reflection";
export const size = {
  width: BLOG_IMAGE_WIDTH,
  height: BLOG_IMAGE_HEIGHT,
};
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;
  return createBlogShareImage(slug);
}
