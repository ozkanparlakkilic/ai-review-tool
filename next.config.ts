import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  env: {
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      "development-secret-key-do-not-use-in-production",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
};

const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({
        enabled: true,
      })
    : (config: NextConfig) => config;

const sentryConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "ozkanparlakkilic",
  project: process.env.SENTRY_PROJECT || "ai-review-tool",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

export default withBundleAnalyzer(sentryConfig);
