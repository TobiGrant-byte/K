import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import BlogList from "@/components/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog | Dr. Sunday Okafor",
  description:
    "Reflections on family, career, and society from Dr. Sunday Okafor.",
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
