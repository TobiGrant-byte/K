import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogPostView from "@/components/blog/BlogPostView";
import {
  BLOG_IMAGE_HEIGHT,
  BLOG_IMAGE_WIDTH,
  truncateShareExcerpt,
} from "@/lib/blog";
import { getPublishedPostBySlug } from "@/lib/firebase/posts";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

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
  const description =
    truncateShareExcerpt(post.excerpt) ||
    "A personal reflection from Dr. Sunday Okafor on life, work, and society.";
  const url = `/blog/${post.slug}`;
  // Same-origin OG/Twitter image routes (PNG) — scrapers often reject ImageKit WebP.
  const shareImage = {
    url: `/blog/${post.slug}/opengraph-image`,
    width: BLOG_IMAGE_WIDTH,
    height: BLOG_IMAGE_HEIGHT,
    alt: title,
  };

  return {
    title: `${title} | Dr. Sunday Okafor`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      siteName: "Dr. Sunday Okafor",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage.url],
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
