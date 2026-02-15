import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For MVP we use <img> tags for remote news images to avoid image domain config.
  // Later: migrate to next/image and whitelist domains.
};

export default nextConfig;
