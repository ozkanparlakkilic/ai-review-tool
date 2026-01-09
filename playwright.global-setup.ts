import { chromium, type FullConfig, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const TEST_USERS = {
  reviewer: { email: "reviewer@test.com", password: "password123" },
  admin: { email: "admin@test.com", password: "password123" },
};

async function waitForServer(baseURL: string, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(baseURL, {
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok || response.status < 500) {
        return true;
      }
    } catch {
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  throw new Error(
    `Server at ${baseURL} did not become ready after ${maxRetries} attempts`
  );
}

async function authenticateUser(
  role: keyof typeof TEST_USERS,
  baseURL: string,
  authDir: string
) {
  console.log(`[GlobalSetup] Authenticating as ${role}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    await page.goto("/login", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    const emailField = page.getByLabel(/email/i);
    await expect(emailField).toBeVisible({ timeout: 15_000 });
    await emailField.fill(TEST_USERS[role].email);

    const passwordField = page.getByLabel(/password/i);
    await passwordField.fill(TEST_USERS[role].password);

    const submitButton = page.getByRole("button", { name: /sign in|login/i });

    await Promise.all([
      page.waitForURL(/\/($|\?)/, { timeout: 15_000 }),
      submitButton.click(),
    ]);

    const statePath = path.resolve(authDir, `${role}.json`);
    await context.storageState({ path: statePath });
    console.log(`[GlobalSetup] ✓ ${role} authenticated and state saved`);

    await browser.close();
  } catch (error) {
    await browser.close();
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[GlobalSetup] ✗ Failed to authenticate ${role}:`,
      errorMessage
    );
    throw new Error(`Authentication failed for ${role}: ${errorMessage}`);
  }
}

export default async function globalSetup(config: FullConfig) {
  console.log("\n");
  console.log("=".repeat(60));
  console.log("GLOBAL SETUP STARTED");
  console.log("=".repeat(60));
  console.log("\n");

  const baseURL = config.projects[0].use.baseURL as string;
  console.log(`[GlobalSetup] Base URL: ${baseURL}`);

  console.log(`[GlobalSetup] Waiting for web server to be ready...`);
  try {
    await waitForServer(baseURL);
    console.log(`[GlobalSetup] Web server is ready`);
  } catch (error) {
    console.error(`[GlobalSetup] Server wait failed:`, error);
    throw error;
  }

  const authDir = path.resolve(process.cwd(), "e2e/.auth");
  console.log(`[GlobalSetup] Creating auth directory: ${authDir}`);
  await mkdir(authDir, { recursive: true });
  console.log(`[GlobalSetup] Auth directory created`);

  const roles = Object.keys(TEST_USERS) as (keyof typeof TEST_USERS)[];
  console.log(
    `[GlobalSetup] Authenticating ${roles.length} users in parallel: ${roles.join(", ")}`
  );

  try {
    await Promise.all(
      roles.map((role) => authenticateUser(role, baseURL, authDir))
    );
    console.log(`\n[GlobalSetup] ========================================`);
    console.log(`[GlobalSetup] All authentication completed successfully`);
    console.log(`[GlobalSetup] ========================================\n`);
  } catch (error) {
    console.error(`\n[GlobalSetup] ========================================`);
    console.error(`[GlobalSetup] Authentication failed:`, error);
    console.error(`[GlobalSetup] ========================================\n`);
    throw error;
  }
}
