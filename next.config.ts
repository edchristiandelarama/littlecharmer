import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Product photography is the heaviest thing on the site. AVIF first, then WebP.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
  },
  experimental: {
    // three.js is large; keep it out of the shared chunk.
    optimizePackageImports: ["@react-three/drei", "motion"],
  },
};

export default nextConfig;
