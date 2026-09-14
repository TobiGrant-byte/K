import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/images/**",
        search: "",
      },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "www.scholarshipregion.com" },
      { protocol: "https", hostname: "cdn.legit.ng" },
      { protocol: "https", hostname: "news.ua.edu" },
      { protocol: "https", hostname: "sundayokafor.com" },
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
  async rewrites() {
    // WhatsApp/Facebook prefer OG image URLs that end in .jpg
    return [
      {
        source: "/og/:slug.jpg",
        destination: "/api/og/:slug",
      },
    ];
  },
};

export default nextConfig;
