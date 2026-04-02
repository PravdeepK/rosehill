import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // LogoWall uses ?v=mtime in dev for cache busting; omit search so query strings are allowed.
    localPatterns: [{ pathname: "/logos/**" }],
  },
};

export default nextConfig;
