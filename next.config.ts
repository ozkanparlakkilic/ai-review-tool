import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "development-secret-key-do-not-use-in-production",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
};

export default nextConfig;
