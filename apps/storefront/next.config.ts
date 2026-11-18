import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vanam/catalog"],
  // Lets a production build run alongside the dev server (NEXT_DIST_DIR=.next-build npm run build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
};

export default nextConfig;
