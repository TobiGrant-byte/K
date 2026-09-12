import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogList from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog | Dr. Sunday Okafor",
  description:
    "Thoughts on family, career, and society from Dr. Sunday Okafor — Transportation Engineer, Researcher, and Leader.",
};

export default function BlogPage() {
  return (
    <PageShell>
      <main>
        <BlogList />
      </main>
    </PageShell>
  );
}
