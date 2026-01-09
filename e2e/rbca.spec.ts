import { test, expect } from "@playwright/test";

test.describe("RBAC", () => {
  test.describe("Reviewer", () => {
    test.use({ storageState: "e2e/.auth/reviewer.json" });

    test("cannot access audit log", async ({ page }) => {
      await page.goto("/audit-log", { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("heading", { name: /^403$/ })).toBeVisible({
        timeout: 15000,
      });

      await expect(page.getByText(/access forbidden/i)).toBeVisible();
      await expect(
        page.getByText(/you don't have necessary permission/i)
      ).toBeVisible();
    });

    test("cannot access insights", async ({ page }) => {
      await page.goto("/insights", { waitUntil: "domcontentloaded" });

      await expect(page.getByRole("heading", { name: /^403$/ })).toBeVisible({
        timeout: 15000,
      });

      await expect(page.getByText(/access forbidden/i)).toBeVisible();
      await expect(
        page.getByText(/you don't have necessary permission/i)
      ).toBeVisible();
    });
  });

  test.describe("Admin", () => {
    test.use({ storageState: "e2e/.auth/admin.json" });

    test("can access audit log", async ({ page }) => {
      await page.goto("/audit-log", { waitUntil: "domcontentloaded" });

      const heading = page.getByRole("heading", { name: /audit log/i });
      await expect(heading).toBeVisible({ timeout: 15000 });
    });

    test("can access insights", async ({ page }) => {
      await page.goto("/insights", { waitUntil: "domcontentloaded" });

      const heading = page.getByRole("heading", { name: /insights/i });
      await expect(heading).toBeVisible({ timeout: 15000 });
    });
  });
});
