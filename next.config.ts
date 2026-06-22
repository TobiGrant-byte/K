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
    ],
  },
};

export default nextConfig;