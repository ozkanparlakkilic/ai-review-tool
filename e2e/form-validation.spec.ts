import { test, expect } from "@playwright/test";

test.describe("Form Validation", () => {
  test("login form validates email format", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole("button", { name: /sign in|login/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill("invalid-email");
    await passwordInput.fill("password123");
    await submitButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("login form has required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|login/i })
    ).toBeVisible();
  });
});

test.describe("Feedback Validation", () => {
  test.use({ storageState: "e2e/.auth/reviewer.json" });

  test("feedback field exists on review page", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reject/i }).first()
    ).toBeVisible();
  });

  test("can fill feedback and see reject button", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", {
      name: /review queue|reviews/i,
    });
    await expect(heading).toBeVisible();

    const statusFilter = page.getByRole("button", { name: /status/i }).first();
    await expect(statusFilter).toBeVisible();
    await statusFilter.click();

    const pendingOption = page.getByRole("option", { name: /pending/i });
    await expect(pendingOption).toBeVisible();
    await pendingOption.click();

    const firstRow = page.getByRole("row").nth(1);
    const viewLink = firstRow.getByRole("link", { name: /review/i });
    await viewLink.click();

    await expect(page).toHaveURL(/\/review\/[^/]+/);

    const feedback = page.getByLabel(/feedback/i).or(page.locator("#feedback"));
    await expect(feedback).toBeVisible();
    await feedback.fill("Quality standards not met. Please improve clarity.");

    await expect(
      page.getByRole("button", { name: /reject/i }).first()
    ).toBeVisible();
  });
});
