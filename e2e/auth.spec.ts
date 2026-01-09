import { test, expect } from "@playwright/test";
import { Page } from "@playwright/test";

const TEST_USERS = {
  reviewer: { email: "reviewer@test.com", password: "password123" },
  admin: { email: "admin@test.com", password: "password123" },
};

async function loginAs(page: Page, role: keyof typeof TEST_USERS) {
  const user = TEST_USERS[role];

  await page.goto("/login", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 15000 });

  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);

  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).not.toHaveURL(/\/login/);

  await expect(page).toHaveURL(/\/($|\?)/);
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
