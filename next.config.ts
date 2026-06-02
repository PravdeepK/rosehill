import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy CMS — absolute targets so apex URLs land on canonical www home.
      {
        source: "/about-us",
        destination: "https://www.rosehilldesignbuild.com/",
        permanent: true,
      },
      {
        source: "/about",
        destination: "https://www.rosehilldesignbuild.com/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "rosehilldesignbuild.com" }],
        destination: "https://www.rosehilldesignbuild.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // LogoWall uses ?v=mtime in dev for cache busting; omit search so query strings are allowed.
    localPatterns: [
      { pathname: "/logos/**" },
      { pathname: "/images/**" },
      { pathname: "/company-logos/**" },
    ],
  },
};

export default nextConfig;
