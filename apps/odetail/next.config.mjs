/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  experimental: {
    optimizePackageImports: ["@repo/ui"],
  },
};

export default nextConfig;
