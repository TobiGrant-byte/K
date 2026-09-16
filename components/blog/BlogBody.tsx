import BlogImage from "@/components/blog/BlogImage";

/** Plain paragraphs from the body string (blank line = new paragraph). */
export default function BlogBody({ body }: { body: string }) {
  const paragraphs = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div className="mt-10 space-y-6">
      {paragraphs.map((text, i) => (
        <p
          key={`p-${i}`}
          className="m-0 text-[15px] leading-[1.9] text-text-secondary"
        >
          {text}
        </p>
      ))}
    </div>
  );
}
