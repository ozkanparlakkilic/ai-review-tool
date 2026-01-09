import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "./node_modules/react/jsx-runtime"
      ),
      "@tanstack/react-query": path.resolve(
        __dirname,
        "./node_modules/@tanstack/react-query"
      ),
      "@tanstack/query-core": path.resolve(
        __dirname,
        "./node_modules/@tanstack/query-core"
      ),
      "next-auth/react": path.resolve(
        __dirname,
        "./node_modules/next-auth/react"
      ),
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./app"),
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/playwright/**",
    ],
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/test/setup/vitest.setup.ts",
    server: {
      deps: {
        inline: ["@tanstack/react-query", "react", "react-dom"],
      },
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockServiceWorker.js",
        "**/*.test.{ts,tsx}",
        "**/__tests__/**",
        "**/__mocks__/**",
        "coverage/",
        ".next/",
        "playwright-report/",
        "test-results/",
        "e2e/",
        "playwright.config.ts",
        "playwright.global-setup.ts",
        "next.config.ts",
        "vitest.config.ts",
        "tailwind.config.*",
        "postcss.config.*",
        "eslint.config.*",
        "middleware.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
