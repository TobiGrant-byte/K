import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogPostView from "@/components/blog/BlogPostView";
import {
  DEFAULT_BLOG_AUTHOR,
  SITE_URL,
  toShareJpegUrl,
  truncateShareExcerpt,
} from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug).catch(() => null);

  if (!post) {
    return {
      title: "Reflection | Dr. Sunday Okafor",
      description:
        "A personal reflection from Dr. Sunday Okafor on life, work, and society.",
    };
  }

  const title = post.title;
  const author = post.author || DEFAULT_BLOG_AUTHOR;
  const description =
    truncateShareExcerpt(post.excerpt) ||
    "A personal reflection from Dr. Sunday Okafor on life, work, and society.";
  const path = `/blog/${post.slug}`;
  const pageUrl = new URL(path, SITE_URL).toString();
  const rawImage = post.coverImage || post.images[0];
  // Direct ImageKit JPEG (absolute .jpg URL) — WhatsApp/X fetch this themselves.
  const imageUrl = rawImage
    ? toShareJpegUrl(rawImage)
    : `${SITE_URL}/images/hero-picture.jpeg`;

  const shareImage = {
    url: imageUrl,
    secureUrl: imageUrl,
    type: "image/jpeg" as const,
    width: 1200,
    height: 630,
    alt: title,
  };

  return {
    title: `${title} | Dr. Sunday Okafor`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      type: "article",
      url: pageUrl,
      siteName: "Dr. Sunday Okafor",
      locale: "en_US",
      authors: [author],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function BlogPostPage() {
  return (
    <PageShell>
      <main>
        <BlogPostView />
      </main>
    </PageShell>
  );
}
