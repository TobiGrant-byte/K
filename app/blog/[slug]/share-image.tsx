import { ImageResponse } from "next/og";
import {
  BLOG_IMAGE_HEIGHT,
  BLOG_IMAGE_WIDTH,
} from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

export const shareImageSize = {
  width: BLOG_IMAGE_WIDTH,
  height: BLOG_IMAGE_HEIGHT,
};

function jpegShareUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("imagekit.io")) {
      parsed.searchParams.set("tr", "f-jpg,w-1200,h-750,c-maintain_ratio");
      return parsed.toString();
    }
  } catch {
    /* keep original */
  }
  return url;
}

export async function createBlogShareImage(slug: string) {
  const post = await getPublishedPostBySlug(slug).catch(() => null);
  const source = post?.coverImage || post?.images[0];

  if (source) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#0a1628",
          }}
        >
          {/* Remote post image — re-encoded as PNG for LinkedIn/Facebook */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={jpegShareUrl(source)}
            alt=""
            width={BLOG_IMAGE_WIDTH}
            height={BLOG_IMAGE_HEIGHT}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ),
      { ...shareImageSize },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 64,
          background: "linear-gradient(145deg, #0a1628 0%, #143056 100%)",
          color: "white",
          fontSize: 56,
          fontWeight: 500,
          lineHeight: 1.15,
        }}
      >
        {post?.title || "Dr. Sunday Okafor"}
      </div>
    ),
    { ...shareImageSize },
  );
}
