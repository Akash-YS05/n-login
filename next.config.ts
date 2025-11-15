import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [],
    };
    return config;
  },

};

export default nextConfig;
