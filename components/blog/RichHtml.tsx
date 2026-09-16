import { sanitizeBlogHtml } from "@/lib/blog";

/** Renders sanitized blog HTML (bold / italic / images). */
export default function RichHtml({
  html,
  className = "",
  tone = "light",
}: {
  html: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const safe = sanitizeBlogHtml(html);
  if (!safe) return null;

  const prose =
    tone === "light"
      ? "text-[15px] leading-[1.9] text-text-secondary [&_strong]:font-semibold [&_strong]:text-navy-800 [&_em]:italic [&_p]:mb-5 [&_p:last-child]:mb-0 [&_img]:my-8 [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:border [&_img]:border-navy-800/10 [&_img]:bg-off-white [&_img]:object-contain"
      : "text-[13px] leading-relaxed text-white/55 [&_strong]:font-semibold [&_strong]:text-white/80 [&_em]:italic [&_p]:mb-2 [&_img]:my-2 [&_img]:block [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:object-contain [&_img]:bg-navy-900";

  return (
    <div
      className={`${prose} ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
