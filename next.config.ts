import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ignoreBuildErrors: true,
  transpilePackages: ["@shadcn/ui"],
  images: {
    domains: ["localhost", "127.0.0.1"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;
