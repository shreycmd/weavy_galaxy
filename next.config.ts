import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/workflows",
        permanent: false,
      },
    ];
  },
};
module.exports = {
  images: {
    domains: ["img.clerk.com"],
  },
};

export default nextConfig;
