import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogPostView from "@/components/blog/BlogPostView";
import {
  BLOG_IMAGE_HEIGHT,
  BLOG_IMAGE_WIDTH,
  SITE_URL,
  blogShareImageAbsoluteUrl,
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
  const path = `/blog/${post.slug}`;
  const pageUrl = `${SITE_URL}${path}`;
  const imageUrl = blogShareImageAbsoluteUrl(post.slug);
  const shareImage = {
    url: imageUrl,
    secureUrl: imageUrl,
    type: "image/jpeg",
    width: BLOG_IMAGE_WIDTH,
    height: BLOG_IMAGE_HEIGHT,
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
