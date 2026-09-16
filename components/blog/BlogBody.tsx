import RichHtml from "@/components/blog/RichHtml";

export default function BlogBody({ body }: { body: string }) {
  return <RichHtml html={body} tone="light" />;
}
