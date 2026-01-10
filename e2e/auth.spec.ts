import { test, expect } from "@playwright/test";
import { Page } from "@playwright/test";

const TEST_USERS = {
  reviewer: { email: "reviewer@test.com", password: "password123" },
  admin: { email: "admin@test.com", password: "password123" },
};

async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const user = TEST_USERS[role];

  await page.goto("/login");

  const emailField = page.getByLabel(/email/i);
  await expect(emailField).toBeVisible({ timeout: 15000 });
  await emailField.fill(user.email);

  const passwordField = page.getByLabel(/password/i);
  await passwordField.fill(user.password);

  const submitButton = page.getByRole("button", { name: /sign in|login/i });
  await expect(submitButton).toBeEnabled();

  await Promise.all([
    page.waitForURL(/\/($|\?)/, { timeout: 30_000 }),
    submitButton.click(),
  ]);
}

async function logout(page: Page) {
  const avatarButton = page.locator('button[class*="rounded-full"]').first();
  await avatarButton.click();

  await page.getByRole("menuitem", { name: /sign out/i }).click();

  const confirmButton = page.getByRole("button", { name: /sign out|confirm/i });
  const hasConfirmButton = (await confirmButton.count()) > 0;
  if (hasConfirmButton) {
    await confirmButton.click();
  }

  await expect(page).toHaveURL(/\/login(\?.*)?$/);
}

test.describe("Authentication", () => {
  test("unauthenticated user visiting root redirects to login", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login(\?.*)?$/);
  });

  test("login as reviewer redirects to review queue", async ({ page }) => {
    await loginAs(page, "reviewer");
    await expect(page).toHaveURL(/\/($|\?)/);

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("login as admin redirects to review queue", async ({ page }) => {
    await loginAs(page, "admin");
    await expect(page).toHaveURL(/\/($|\?)/);

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test("logout redirects to login", async ({ page }) => {
    await loginAs(page, "reviewer");
    await logout(page);
    await expect(page).toHaveURL(/\/login(\?.*)?$/);
  });
});
