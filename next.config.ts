import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.app.github.dev",
        "*.replit.app",
        "*.replit.dev",
        "*.replit.me",
      ],
    },
  },
};

export default nextConfig;
