/** Shared 16:10 frame — cropped uploads display 1:1 with no further cutting. */
export default function BlogImage({
  src,
  alt = "",
  className = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden bg-navy-900 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain object-center"
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
