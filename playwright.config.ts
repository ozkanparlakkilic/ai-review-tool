import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI || process.env.CI === "true";

const workers = isCI ? 4 : 2;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers,
  timeout: isCI ? 90_000 : 30_000,
  reporter: isCI
    ? [
        ["list"],
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],
  globalSetup: "./playwright.global-setup.ts",
  globalTeardown: "./playwright.global-teardown.ts",
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,

    navigationTimeout: 15_000,
    actionTimeout: 5_000,

    trace: isCI ? "retain-on-failure" : "off",
    video: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isCI
      ? `sh -c 'pnpm build && pnpm prisma:ci && cp -r public .next/standalone/ && mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/ && cp -r node_modules/.prisma .next/standalone/node_modules/ 2>/dev/null || true && cd .next/standalone && cross-env DATABASE_URL="${process.env.DATABASE_URL}" PORT=${PORT} node server.js'`
      : `dotenv -e .env.test -- pnpm dev -p ${PORT}`,

    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "ignore",
  },
});
