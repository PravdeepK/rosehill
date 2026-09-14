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
      // Retired in favour of /portfolio-map, which shows the same work with
      // real photography. The old route was indexed, so redirect rather than 404.
      {
        source: "/projects",
        destination: "https://www.rosehilldesignbuild.com/portfolio-map",
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
    // LogoWall uses ?v=mtime in dev for cache busting; omit search so query strings are allowed.
    localPatterns: [
      { pathname: "/logos/**" },
      { pathname: "/images/**" },
      { pathname: "/company-logos/**" },
    ],
  },
};

export default nextConfig;
