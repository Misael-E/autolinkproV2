/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
};

export default nextConfig;
