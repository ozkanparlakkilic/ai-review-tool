import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI
    ? "github"
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],
  globalSetup: "./playwright.global-setup.ts",
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: BASE_URL,

    navigationTimeout: 30_000,
    actionTimeout: 10_000,

    trace: isCI ? "retain-on-failure" : "off",
    video: isCI ? "retain-on-failure" : "off",
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
      ? `pnpm build && pnpm start -p ${PORT}`
      : `pnpm dev -p ${PORT}`,

    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
