import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogPostView from "@/components/blog/BlogPostView";

export const metadata: Metadata = {
  title: "Reflection | Dr. Sunday Okafor",
  description:
    "A personal reflection from Dr. Sunday Okafor on life, work, and society.",
};

export default function BlogPostPage() {
  return (
    <PageShell>
      <main>
        <BlogPostView />
      </main>
    </PageShell>
  );
}
