import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.sporting-immobilier.fr",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
